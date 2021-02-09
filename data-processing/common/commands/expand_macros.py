import logging
import os.path
import re
import shutil
import subprocess
from dataclasses import dataclass
from tempfile import NamedTemporaryFile
from typing import Iterator, List

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.compile import get_compiled_tex_files
from common.expand_macros import Expansion, detect_expansions
from common.types import AbsolutePath, ArxivId, CompiledTexFile, Path


@dataclass
class ExpansionTask:
    arxiv_id: ArxivId
    output_sources_dir: RelativePath
    tex_file: CompiledTexFile


@dataclass
class ExpandedFile:
    expansions: List[Expansion]
    save_path: Path
    tex: str


class ExpandMathMacros(ArxivBatchCommand[ExpansionTask, ExpandedFile]):
    @staticmethod
    def get_name() -> str:
        return "expand-math-macros"

    @staticmethod
    def get_description() -> str:
        return "Expand macros and commands used in TeX math environments."

    def get_arxiv_ids_dirkey(self) -> str:
        return "expanded-sources"

    def load(self) -> Iterator[ExpansionTask]:
        for arxiv_id in self.arxiv_ids:
            sources_dir = directories.arxiv_subdir("expanded-sources", arxiv_id)
            if not os.path.exists(sources_dir):
                logging.warning(  # pylint: disable=logging-not-lazy
                    "No directory of TeX sources could be found for paper %s. The macros "
                    + "in this paper will not be expanded.",
                    arxiv_id,
                )
                continue

            output_dir = directories.arxiv_subdir("normalized-sources", arxiv_id)
            if os.path.exists(output_dir):
                logging.warning(
                    "Directory for macro expansions already exists in %s. Deleting.",
                    output_dir,
                )
                shutil.rmtree(output_dir)

            compiled_tex_dir = directories.arxiv_subdir("compiled-sources", arxiv_id)
            compiled_tex_files = get_compiled_tex_files(compiled_tex_dir)
            if len(compiled_tex_files) == 0:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "Could not find any TeX files that were successfully compiled for paper %s. "
                    + "The pipeline will not be able to process this paper further.",
                    arxiv_id,
                )
                continue

            for tex_file in compiled_tex_files:
                yield ExpansionTask(arxiv_id, output_dir, tex_file)

    def process(self, item: ExpansionTask) -> Iterator[ExpandedFile]:
        latexml_bin = os.path.join(
            os.path.abspath(os.path.join("perl", "latexml", "bin", "latexml"))
        )
        if not os.path.exists(latexml_bin):
            logging.warning(  # pylint: disable=logging-not-lazy
                "Could not find LaTeXML binary. It will not be possible to expand macros for "
                + "this paper without it. Has the setup script in the 'perl' directory been run?"
            )

        # Remove '.tex' extension from the name of the TeX file.
        tex_name = re.sub(r"\.tex$", "", item.tex_file.path)
        sources_dir = directories.arxiv_subdir("expanded-sources", item.arxiv_id)

        with NamedTemporaryFile() as tmp_file:
            args = [
                latexml_bin,
                tex_name,
                # Silence LaTeXML default output (HTML and log messages) so that only
                # the custom messages related to macro expansions are output from LaTeXML.
                "--destination",
                tmp_file.name,
                "--quiet",
            ]

            # Run LaTeXML on the TeX file.
            logging.debug(
                "Detecting macros and their expansions for file '%s' in directory %s",
                tex_name,
                sources_dir,
            )
            result = subprocess.run(
                args,
                cwd=sources_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False,
            )

        success = False
        if result.returncode == 0:
            success = True

        logging.debug(
            "Finished macro expansion attempt for file %s in %s. Success? %s.",
            tex_name,
            sources_dir,
            success,
        )
        if not success:
            logging.warning(  # pylint: disable=logging-not-lazy
                "Some error occurred when scanning paper %s for macros. However, it is possible "
                + "that some macros were successfully scanned. Macro analysis will proceed. "
                + "This may mean that some macros will not be expanded for this paper.",
                item.arxiv_id,
            )

        tex_path = os.path.join(item.output_sources_dir, item.tex_file.path)
        absolute_tex_path = os.path.realpath(os.path.abspath(tex_path))

        expansions = detect_expansions(result.stdout, in_files=[absolute_tex_path])
        if expansions is None:
            logging.debug(
                "No macro expansions were detected in math environments for paper %s",
                item.arxiv_id,
            )
            yield None

        if not os.path.isfile(tex_path):
            logging.warning(  # pylint: disable=logging-not-lazy
                "TeX file at path %s for paper %s is not an actual file (i.e., it might be a "
                + "link). This file will not be expanded, in case there's something fishy "
                + "with this directory of sources that could cause files outside of the TeX "
                + "project to be modified.",
                item.tex_file.path,
                item.arxiv_id,
            )
            return

        # Expand macros in the TeX contents.
        assert False, "Finish this up"
        # the original file with the unified file. This is so that as little as
        # possible will be changed in the sources directory, in the hopes that it will
        # cause AutoTeX to process the unified file the same way as the original file.
        with open(tex_path, "w", encoding="utf-8") as tex_file:
            tex_file.write(expanded)

    def save(self, item: ExpansionTask, result: List[Expansion]) -> None:
        pass
        # output_dir = directories.arxiv_subdir("normalized-sources", item.arxiv_id)
        # if not os.path.exists(output_dir):
        #     os.makedirs(output_dir)

        # output_path = os.path.join(output_dir, "expansions.csv")
        # file_utils.append_to_csv(output_path, result)
