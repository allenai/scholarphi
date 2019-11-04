import csv
import logging
import os.path
import shutil
from abc import ABC, abstractmethod
from typing import Iterator

from explanations import directories
from explanations.compile import compile_tex
from explanations.directories import (
    get_arxiv_id_iteration_path,
    get_arxiv_ids,
    get_iteration_names,
)
from explanations.file_utils import clean_directory
from explanations.types import AbsolutePath, ArxivId, CompilationResult, RelativePath
from scripts.command import Command

CompilationPath = AbsolutePath


class CompileTexCommand(Command[CompilationPath, CompilationResult], ABC):
    """
    Compile a TeX project, first copying it to a new directory.
    """

    @abstractmethod
    def get_sources_base_dir(self) -> AbsolutePath:
        """
        Path to the data directory containing all papers' TeX sources.
        """

    @abstractmethod
    def get_source_dirs(self, arxiv_id: ArxivId) -> Iterator[CompilationPath]:
        """
        Get all directories that should be compiled for an arXiv ID. Paths should
        be relative to the sources base dir.
        """

    @abstractmethod
    def get_output_base_dir(self) -> AbsolutePath:
        """
        Path to the data directory that will contain all compiled TeX sources.
        """

    def load(self) -> Iterator[CompilationPath]:

        sources_base_dir = self.get_sources_base_dir()
        for arxiv_id in get_arxiv_ids(sources_base_dir):

            # Clean all past output for this arXiv ID.
            output_dir_for_arxiv_id = directories.get_data_subdirectory_for_arxiv_id(
                self.get_output_base_dir(), arxiv_id
            )
            clean_directory(output_dir_for_arxiv_id)

            for source_dir in self.get_source_dirs(arxiv_id):
                source_dir_absolute = os.path.join(sources_base_dir, source_dir)
                output_dir = os.path.join(self.get_output_base_dir(), source_dir)
                if os.path.exists(output_dir):
                    logging.warning(
                        "Compilation directory already exists in %s. Deleting.",
                        output_dir,
                    )
                    shutil.rmtree(output_dir)
                shutil.copytree(source_dir_absolute, output_dir)
                yield output_dir

    def process(self, item: CompilationPath) -> Iterator[CompilationResult]:
        result = compile_tex(item)
        yield result

    def save(self, item: CompilationPath, result: CompilationResult) -> None:
        results_dir = os.path.join(item, "compilation_results")
        if not os.path.exists(results_dir):
            os.makedirs(results_dir)

        if result.success:
            logging.debug(
                "Successfully compiled TeX. Generated PDFs %s",
                str(result.compiled_pdfs),
            )
        else:
            logging.warning(
                "Could not compile TeX in %s. See logs in %s.", item, results_dir
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

    def get_sources_base_dir(self) -> AbsolutePath:
        return directories.SOURCES_DIR

    def get_source_dirs(self, arxiv_id: ArxivId) -> Iterator[RelativePath]:
        return iter([directories.escape_slashes(arxiv_id)])

    def get_output_base_dir(self) -> AbsolutePath:
        return directories.COMPILED_SOURCES_DIR


class CompileTexSourcesWithColorizedCitations(CompileTexCommand):
    @staticmethod
    def get_name() -> str:
        return "compile-tex-with-colorized-citations"

    @staticmethod
    def get_description() -> str:
        return "Compile TeX sources with colorized citations."

    def get_sources_base_dir(self) -> str:
        return directories.SOURCES_WITH_COLORIZED_CITATIONS_DIR

    def get_source_dirs(self, arxiv_id: ArxivId) -> Iterator[RelativePath]:
        sources_base_dir = self.get_sources_base_dir()
        for iteration in get_iteration_names(sources_base_dir, arxiv_id):
            yield get_arxiv_id_iteration_path(arxiv_id, iteration)

    def get_output_base_dir(self) -> AbsolutePath:
        return directories.COMPILED_SOURCES_WITH_COLORIZED_CITATIONS_DIR


class CompileTexSourcesWithColorizedEquations(CompileTexCommand):
    @staticmethod
    def get_name() -> str:
        return "compile-tex-with-colorized-equations"

    @staticmethod
    def get_description() -> str:
        return "Compile TeX sources with colorized equations."

    def get_sources_base_dir(self) -> str:
        return directories.SOURCES_WITH_COLORIZED_EQUATIONS_DIR

    def get_source_dirs(self, arxiv_id: ArxivId) -> Iterator[RelativePath]:
        sources_base_dir = self.get_sources_base_dir()
        for iteration in get_iteration_names(sources_base_dir, arxiv_id):
            yield get_arxiv_id_iteration_path(arxiv_id, iteration)

    def get_output_base_dir(self) -> AbsolutePath:
        return directories.COMPILED_SOURCES_WITH_COLORIZED_EQUATIONS_DIR


class CompileTexSourcesWithColorizedEquationTokens(CompileTexCommand):
    @staticmethod
    def get_name() -> str:
        return "compile-tex-with-colorized-equation-tokens"

    @staticmethod
    def get_description() -> str:
        return "Compile TeX sources with colorized equation tokens."

    def get_sources_base_dir(self) -> str:
        return directories.SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR

    def get_source_dirs(self, arxiv_id: ArxivId) -> Iterator[RelativePath]:
        sources_base_dir = self.get_sources_base_dir()
        for iteration in get_iteration_names(sources_base_dir, arxiv_id):
            yield get_arxiv_id_iteration_path(arxiv_id, iteration)

    def get_output_base_dir(self) -> AbsolutePath:
        return directories.COMPILED_SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR
