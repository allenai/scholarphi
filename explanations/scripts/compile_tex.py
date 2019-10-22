import csv
import logging
import os.path
import shutil
from abc import ABC, abstractmethod
from typing import Iterator

from explanations import directories
from explanations.compile import compile_tex
from explanations.directories import get_data_subdirectory_for_arxiv_id
from explanations.file_utils import clean_directory
from explanations.types import ArxivId, CompilationResult
from scripts.command import Command


class CompileTexCommand(Command[ArxivId, CompilationResult], ABC):
    """
    Compile a TeX project, first copying it to a new directory.
    """

    @staticmethod
    @abstractmethod
    def get_sources_base_dir() -> str:
        """
        Path to the data directory containing all papers' TeX sources.
        """

    @staticmethod
    @abstractmethod
    def get_output_base_dir() -> str:
        """
        Path to the data directory where you want TeX files to be copied and compiled.
        """

    def load(self) -> Iterator[ArxivId]:
        for arxiv_id in os.listdir(self.get_sources_base_dir()):
            src_dir = get_data_subdirectory_for_arxiv_id(
                self.get_sources_base_dir(), arxiv_id
            )
            dest_dir = get_data_subdirectory_for_arxiv_id(
                self.get_output_base_dir(), arxiv_id
            )
            clean_directory(dest_dir)
            shutil.copytree(src_dir, dest_dir)
            yield arxiv_id

    def process(self, item: ArxivId) -> Iterator[CompilationResult]:
        compile_dir = get_data_subdirectory_for_arxiv_id(
            self.get_output_base_dir(), item
        )
        result = compile_tex(compile_dir)
        yield result

    def save(self, item: ArxivId, result: CompilationResult) -> None:
        results_dir = os.path.join(
            get_data_subdirectory_for_arxiv_id(self.get_output_base_dir(), item),
            "compilation_results",
        )
        if not os.path.exists(results_dir):
            os.makedirs(results_dir)

        if result.success:
            logging.debug(
                "Successfully compiled TeX. Generated PDFs %s",
                str(result.compiled_pdfs),
            )
        else:
            logging.warning(
                "Could not compile TeX for arXiv ID %s. See logs in %s.",
                item,
                results_dir,
            )

        with open(os.path.join(results_dir, "result"), "w") as success_file:
            success_file.write(str(result.success))

        if result.compiled_pdfs is not None:
            with open(
                os.path.join(results_dir, "pdf_names.csv"), "w"
            ) as pdf_names_file:
                writer = csv.writer(pdf_names_file, quoting=csv.QUOTE_ALL)
                for i, pdf in enumerate(result.compiled_pdfs):
                    writer.writerow([i, pdf])

        with open(os.path.join(results_dir, "stdout.log"), "wb") as stdout_file:
            stdout_file.write(result.stdout)

        with open(os.path.join(results_dir, "stderr.log"), "wb") as stderr_file:
            stderr_file.write(result.stderr)


class CompileTexSources(CompileTexCommand):
    @staticmethod
    def get_name() -> str:
        return "compile-tex"

    @staticmethod
    def get_description() -> str:
        return "Compile original TeX sources."

    @staticmethod
    def get_sources_base_dir() -> str:
        return directories.SOURCES_DIR

    @staticmethod
    def get_output_base_dir() -> str:
        return directories.COMPILED_SOURCES_DIR
