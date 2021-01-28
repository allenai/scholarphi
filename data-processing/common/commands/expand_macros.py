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
from common.types import ArxivId, CompiledTexFile


@dataclass
class ExpansionTask:
    arxiv_id: ArxivId
    tex_file: CompiledTexFile


class ExpandMathMacros(ArxivBatchCommand[ExpansionTask, List[Expansion]]):
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
                yield ExpansionTask(arxiv_id, tex_file)

    def process(self, item: ExpansionTask) -> Iterator[List[Expansion]]:
        # expansions = detect_expansions(item.path)

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

        # THIS IS A TRICKY CASE---would be good if we could output the type of each token, so that we can put
        # space between control sequences and other characters that might be mistaken for a continuation of them.
        # Double check the rules from the TeXBook on how to handle these expansions.
        # Note that letters with catcode 11 will generally be grouped into the control sequences before them (assuming)
        # those control sequences were called and they were defined using catcode-11 characters:
        # https://tex.stackexchange.com/a/423018/198728
        # This means that, in general we should introduce a space between a call to a control sequence and
        # subsequent characters of catcode 11.3
        # In general, however, I believe there should be no harm to introducing a space after _all_ macros, as
        # the space after a macro usage is usually skipped.
        assert False

        expansions = detect_expansions(result.stdout)
        if expansions is None:
            logging.debug(
                "No macro expansions were detected in math environments for paper %s",
                item.arxiv_id,
            )

        yield expansions

    def save(self, item: ExpansionTask, result: List[Expansion]) -> None:
        pass
        # output_dir = directories.arxiv_subdir("normalized-sources", item.arxiv_id)
        # if not os.path.exists(output_dir):
        #     os.makedirs(output_dir)

        # output_path = os.path.join(output_dir, "expansions.csv")
        # file_utils.append_to_csv(output_path, result)
