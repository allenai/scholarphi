import glob
import logging
import os
import shutil
import subprocess
from argparse import ArgumentParser
from dataclasses import dataclass
from tempfile import TemporaryDirectory
from typing import Iterator, List

from explanations import directories
from explanations.types import ArxivId
from scripts.command import ArxivBatchCommand

DEFAULT_S3_LOGS_BUCKET = "s2-reader-pipeline-logs"


@dataclass(frozen=True)
class ResultSpec:
    " Description of a result file to upload to the server. "

    data_dir: str
    """
    Base data directory to search for result file. Should be one of the directory constants from
    the 'directories' module.
    """

    glob: str
    """
    Glob for finding all matching result files in <data_dir>/<arxiv_id>/. See acceptable glob
    syntax at https://docs.python.org/3/library/glob.html.
    """

    name: str
    """
    Descriptive name for this result. Results will be saved on S3 to:
    s3://<s3-bucket>/<s3-prefix-from-command-args>/results/<name>/<arxiv-id>-%d.<ext>.
    """


class StoreResults(ArxivBatchCommand[ArxivId, None]):
    @staticmethod
    def get_name() -> str:
        return "store-results"

    @staticmethod
    def get_description() -> str:
        return (
            "Store results from running the pipeline for a set of papers to storage on S3. "
            + "This includes both the end output (e.g., CSV files containing entity locations) "
            + "and intermediate results (e.g., colorized TeX, rastered pages)."
        )

    @staticmethod
    def get_arxiv_ids_dir() -> str:
        return directories.SOURCE_ARCHIVES_DIR

    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        super(StoreResults, StoreResults).init_parser(parser)
        parser.add_argument(
            "--s3-bucket",
            type=str,
            default=DEFAULT_S3_LOGS_BUCKET,
            help="S3 bucket to upload results and logs to.",
        )
        parser.add_argument(
            "--s3-prefix",
            type=str,
            default="master",
            help=(
                "Prefix for path to which to upload results in the S3 bucket. "
                + "Uploading results for the same arXiv ID twice with the same S3 prefix will have "
                + "upredictable behavior, and will partially (but perhaps not completely) overwrite "
                + " previously uploaded results."
            ),
        )

    def load(self) -> Iterator[ArxivId]:
        for arxiv_id in self.arxiv_ids:
            yield arxiv_id

    def process(self, _: ArxivId) -> Iterator[None]:
        yield None

    def save(self, item: ArxivId, _: None) -> None:

        upload_path = (
            f"s3://{self.args.s3_bucket}/{self.args.s3_prefix}/dump/by_arxiv_id/{item}"
        )
        command_args = [
            "aws",
            "s3",
            "sync",
            directories.DATA_DIR,
            upload_path,
            "--exclude",
            "*",
            # This is not a _perfect_ filter: if an arXiv paper has in its sources a directory
            # with the name of another arXiv ID, that directory will be copied when processing
            # the paper with that ID. This shouldn't come up often enough to be a concern.
            "--include",
            f"*/{directories.escape_slashes(item)}",
            "--include",
            f"*/{directories.escape_slashes(item)}/*",
        ]
        logging.debug("Uploading all output with command %s", command_args)
        command_result = subprocess.run(
            command_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
        )
        logging.debug("Finished uploading all output for arXiv ID %s to S3.", item)
        if command_result.returncode != 0:
            logging.warning(
                "Error uploading all output to S3 for arXiv ID %s: %s",
                item,
                command_result.stderr,
            )

        with TemporaryDirectory() as staging_dir_path:
            for spec in RESULT_SPECS:
                glob_pattern = os.path.join(
                    spec.data_dir, directories.escape_slashes(item), spec.glob
                )
                paths = glob.glob(glob_pattern)
                if len(paths) == 0:
                    logging.warning(  # pylint: disable=logging-not-lazy
                        (
                            "Could not find any files matching %s for arXiv ID %s. There may have been errors "
                            + "in processing the stage that would generate these files for this paper."
                        ),
                        glob_pattern,
                        item,
                    )

                result_dir = os.path.join(staging_dir_path, spec.name)
                os.makedirs(result_dir)

                for i, path in enumerate(paths):
                    __, ext = os.path.splitext(path)
                    filename = f"{item}-{i}{ext}"
                    dest_path = os.path.join(result_dir, filename)
                    logging.debug(
                        "Staging %s to temporary directory %s", path, dest_path
                    )
                    shutil.copy(path, dest_path)

            upload_path = f"s3://{self.args.s3_bucket}/{self.args.s3_prefix}/results"
            command_args = ["aws", "s3", "sync", staging_dir_path, upload_path]
            logging.debug("Uploading results with command %s", command_args)
            command_result = subprocess.run(
                command_args,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False,
            )
            logging.debug("Finished uploading results for arXiv ID %s to S3.", item)
            if command_result.returncode != 0:
                logging.warning(
                    "Error uploading results to S3 for arXiv ID %s: %s",
                    item,
                    command_result.stderr,
                )


RESULT_SPECS: List[ResultSpec] = [
    ResultSpec(directories.BIBITEMS_DIR, "bibitems.csv", "bibitems"),
    ResultSpec(
        directories.BIBITEM_RESOLUTIONS_DIR, "resolutions.csv", "bibitem-resolutions"
    ),
    ResultSpec(directories.EQUATIONS_DIR, "equations.csv", "equations"),
    ResultSpec(directories.SYMBOLS_DIR, "parse_results.csv", "symbol-parse-results"),
    ResultSpec(directories.SYMBOLS_DIR, "symbols.csv", "symbols"),
    ResultSpec(directories.SYMBOLS_DIR, "symbol_children.csv", "symbol-children"),
    ResultSpec(directories.SYMBOLS_DIR, "symbol_tokens.csv", "symbol-tokens"),
    ResultSpec(directories.SYMBOLS_DIR, "tokens.csv", "tokens"),
    ResultSpec(
        directories.SOURCES_WITH_COLORIZED_CITATIONS_DIR,
        "**/citation_hues.csv",
        "citation-hues",
    ),
    ResultSpec(
        directories.SOURCES_WITH_COLORIZED_EQUATIONS_DIR,
        "**/equation_hues.csv",
        "equation-hues",
    ),
    ResultSpec(
        directories.SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR,
        "**/token_hues.csv",
        "token-hues",
    ),
    ResultSpec(
        directories.COMPILED_SOURCES_DIR,
        "compilation_results/result",
        "compilation-result-uninstrumented",
    ),
    ResultSpec(
        directories.COMPILED_SOURCES_DIR,
        "compilation_results/pdf_names.csv",
        "compilation-pdf-names-uninstrumented",
    ),
    ResultSpec(
        directories.COMPILED_SOURCES_DIR,
        "auto_gen_ps.log",
        "compilation-autotex-log-uninstrumented",
    ),
    ResultSpec(
        directories.COMPILED_SOURCES_WITH_COLORIZED_CITATIONS_DIR,
        "**/compilation_results/result",
        "compilation-result-colorized-citations",
    ),
    ResultSpec(
        directories.COMPILED_SOURCES_WITH_COLORIZED_CITATIONS_DIR,
        "**/compilation_results/pdf_names.csv",
        "compilation-pdf-names-colorized-citations",
    ),
    ResultSpec(
        directories.COMPILED_SOURCES_WITH_COLORIZED_CITATIONS_DIR,
        "**/auto_gen_ps.log",
        "compilation-autotex-log-colorized-citations",
    ),
    ResultSpec(
        directories.COMPILED_SOURCES_WITH_COLORIZED_EQUATIONS_DIR,
        "**/compilation_results/result",
        "compilation-result-colorized-equations",
    ),
    ResultSpec(
        directories.COMPILED_SOURCES_WITH_COLORIZED_EQUATIONS_DIR,
        "**/compilation_results/pdf_names.csv",
        "compilation-pdf-names-colorized-equations",
    ),
    ResultSpec(
        directories.COMPILED_SOURCES_WITH_COLORIZED_EQUATIONS_DIR,
        "**/auto_gen_ps.log",
        "compilation-autotex-log-colorized-equations",
    ),
    ResultSpec(
        directories.COMPILED_SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR,
        "**/compilation_results/result",
        "compilation-result-colorized-tokens",
    ),
    ResultSpec(
        directories.COMPILED_SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR,
        "**/compilation_results/pdf_names.csv",
        "compilation-pdf-names-colorized-tokens",
    ),
    ResultSpec(
        directories.COMPILED_SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR,
        "**/auto_gen_ps.log",
        "compilation-autotex-log-colorized-tokens",
    ),
    ResultSpec(
        directories.HUE_LOCATIONS_FOR_CITATIONS_DIR,
        "hue_locations.csv",
        "citation-locations",
    ),
    ResultSpec(
        directories.HUE_LOCATIONS_FOR_EQUATIONS_DIR,
        "hue_locations.csv",
        "equation-locations",
    ),
    ResultSpec(
        directories.HUE_LOCATIONS_FOR_EQUATION_TOKENS_DIR,
        "hue_locations.csv",
        "token-locations",
    ),
]
