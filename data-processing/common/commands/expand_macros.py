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
from common.expand_macros import Expansion, detect_expansions, expand_macros
from common.types import ArxivId, CompiledTexFile, RelativePath


@dataclass
class ExpansionTask:
    arxiv_id: ArxivId
    output_sources_dir: RelativePath
    tex_file: CompiledTexFile


@dataclass
class ExpansionResult:
    expansions: List[Expansion]
    latexml_stdout: bytes


class ExpandMathMacros(ArxivBatchCommand[ExpansionTask, ExpansionResult]):
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

    def process(self, item: ExpansionTask) -> Iterator[ExpansionResult]:

        # Make a copy of the sources directory that in which the macros will be expanded.
        shutil.copytree(
            directories.arxiv_subdir("expanded-sources", item.arxiv_id),
            item.output_sources_dir,
        )

        # Save paths to the TeX source file in the new directory.
        sources_dir = item.output_sources_dir
        tex_path = os.path.join(sources_dir, item.tex_file.path)
        absolute_tex_path = os.path.realpath(os.path.abspath(tex_path))

        # Remove '.tex' extension from the name of the TeX file.
        tex_name = re.sub(r"\.tex$", "", item.tex_file.path)

        latexml_bin = os.path.join(
            os.path.abspath(os.path.join("perl", "latexml", "bin", "latexml"))
        )
        if not os.path.exists(latexml_bin):
            logging.warning(  # pylint: disable=logging-not-lazy
                "Could not find LaTeXML binary. It will not be possible to expand macros for "
                + "this paper without it. Has the setup script in the 'perl' directory been run?"
            )
            return

        # Run LaTeXML on the TeX file to detect macros.
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

            logging.debug(
                "Detecting macros and their expansions for file '%s' in directory %s.",
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
            "Finished attempt to detect macro expansions for file %s in %s. Success? %s.",
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

        # Determine the set of files in the project that can contain project-specific macros.
        project_files = [
            os.path.realpath(os.path.abspath(p))
            for p in file_utils.find_files(sources_dir, [".sty", ".tex"])
        ]

        # Extract macro expansions from the LaTeXML log.
        expansions = detect_expansions(
            result.stdout, used_in=[absolute_tex_path], defined_in=project_files
        )

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

        # Expand macros in the TeX file.
        with open(tex_path, "rb") as tex_file:
            contents = tex_file.read()

        expansions_list = list(expansions)
        if len(expansions_list) == 0:
            logging.debug(
                "No macro expansions were detected in math environments for paper %s",
                item.arxiv_id,
            )
            return
        expanded = expand_macros(contents, expansions_list)
        with open(tex_path, "wb") as tex_file:
            tex_file.write(expanded)

        yield ExpansionResult(expansions_list, result.stdout)

    def save(self, item: ExpansionTask, result: ExpansionResult) -> None:
        latexml_stdout_path = os.path.join(
            item.output_sources_dir, "latexml_stdout.txt"
        )
        with open(latexml_stdout_path, "wb") as latexml_stdout_file:
            latexml_stdout_file.write(result.latexml_stdout)

        expansions_path = os.path.join(item.output_sources_dir, "expansions.csv")
        for expansion in result.expansions:
            file_utils.append_to_csv(expansions_path, expansion)
