import glob
import logging
import os
import shutil
import subprocess
from argparse import ArgumentParser
from dataclasses import dataclass
from tempfile import TemporaryDirectory
from typing import Iterator, List

from command.command import ArxivBatchCommand
from common import directories
from common.types import ArxivId

DEFAULT_S3_LOGS_BUCKET = "s2-reader-pipeline-logs"


@dataclass(frozen=True)
class ResultSpec:
    " Description of a result file to upload to the server. "

    dirkey: str
    """
    Key for a data directory to search in which to search for result files. Should be one of the
    directory keys registered in the 'directories' module.
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
    def get_arxiv_ids_dirkey() -> str:
        return "sources-archives"

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
                    directories.dirpath(spec.dirkey),
                    directories.escape_slashes(item),
                    spec.glob,
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
    ResultSpec("bibitems", "bibitems.csv", "bibitems"),
    ResultSpec("bibitem-resolutions", "resolutions.csv", "bibitem-resolutions"),
    ResultSpec("detected-equations", "equations.csv", "detected-equations"),
    ResultSpec("symbols", "parse_results.csv", "symbol-parse-results"),
    ResultSpec("symbols", "symbols.csv", "symbols"),
    ResultSpec("symbols", "symbol_children.csv", "symbol-children"),
    ResultSpec("symbols", "symbol_tokens.csv", "symbol-tokens"),
    ResultSpec("symbols", "tokens.csv", "tokens"),
    ResultSpec(
        "sources-with-colorized-citations", "**/entity_hues.csv", "citation-hues",
    ),
    ResultSpec(
        "sources-with-colorized-equations", "**/entity_hues.csv", "equation-hues",
    ),
    ResultSpec(
        "sources-with-colorized-equation-tokens", "**/entity_hues.csv", "token-hues",
    ),
    ResultSpec(
        "compiled-sources",
        "compilation_results/result",
        "compilation-result-uninstrumented",
    ),
    ResultSpec(
        "compiled-sources",
        "compilation_results/pdf_names.csv",
        "compilation-pdf-names-uninstrumented",
    ),
    ResultSpec(
        "compiled-sources", "auto_gen_ps.log", "compilation-autotex-log-uninstrumented",
    ),
    ResultSpec(
        "compiled-sources-with-colorized-citations",
        "**/compilation_results/result",
        "compilation-result-colorized-citations",
    ),
    ResultSpec(
        "compiled-sources-with-colorized-citations",
        "**/compilation_results/pdf_names.csv",
        "compilation-pdf-names-colorized-citations",
    ),
    ResultSpec(
        "compiled-sources-with-colorized-citations",
        "**/auto_gen_ps.log",
        "compilation-autotex-log-colorized-citations",
    ),
    ResultSpec(
        "compiled-sources-with-colorized-equations",
        "**/compilation_results/result",
        "compilation-result-colorized-equations",
    ),
    ResultSpec(
        "compiled-sources-with-colorized-equations",
        "**/compilation_results/pdf_names.csv",
        "compilation-pdf-names-colorized-equations",
    ),
    ResultSpec(
        "compiled-sources-with-colorized-equations",
        "**/auto_gen_ps.log",
        "compilation-autotex-log-colorized-equations",
    ),
    ResultSpec(
        "compiled-sources-with-colorized-equation-tokens",
        "**/compilation_results/result",
        "compilation-result-colorized-tokens",
    ),
    ResultSpec(
        "compiled-sources-with-colorized-equation-tokens",
        "**/compilation_results/pdf_names.csv",
        "compilation-pdf-names-colorized-tokens",
    ),
    ResultSpec(
        "compiled-sources-with-colorized-equation-tokens",
        "**/auto_gen_ps.log",
        "compilation-autotex-log-colorized-tokens",
    ),
    ResultSpec(
        "hue-locations-for-citations", "hue_locations.csv", "citation-locations",
    ),
    ResultSpec(
        "hue-locations-for-equations", "hue_locations.csv", "equation-locations",
    ),
    ResultSpec(
        "hue-locations-for-equation-tokens", "hue_locations.csv", "token-locations",
    ),
]
