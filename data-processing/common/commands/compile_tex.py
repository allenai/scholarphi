import logging
import os.path
import shutil
from abc import ABC, abstractmethod
from typing import Iterator, Type

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.compile import compile_tex
from common.types import AbsolutePath, ArxivId, CompilationResult, Path, RelativePath

CompilationPath = AbsolutePath


class CompileTexCommand(ArxivBatchCommand[CompilationPath, CompilationResult], ABC):
    """
    Compile a TeX project, first copying it to a new directory.
    """

    @abstractmethod
    def get_sources_base_dirkey(self) -> str:
        """
        Key for a data directory containing all papers' TeX sources.
        """

    def get_source_dirs(self, arxiv_id: ArxivId) -> Iterator[RelativePath]:
        """
        Get all directories that should be compiled for an arXiv ID. Paths should
        be relative to the sources base dir. This method can be overridden.
        """
        for iteration in directories.iteration_names(
            self.get_sources_base_dirkey(), arxiv_id
        ):
            yield directories.relpath_arxiv_id_iteration(arxiv_id, iteration)

    @abstractmethod
    def get_output_base_dirkey(self) -> str:
        """
        Key for a data directory that will contain all compiled TeX sources.
        """

    def get_arxiv_ids_dirkey(self) -> Path:
        return self.get_sources_base_dirkey()

    def load(self) -> Iterator[CompilationPath]:

        sources_base_dir = directories.dirpath(self.get_sources_base_dirkey())
        output_base_dir = directories.dirpath(self.get_output_base_dirkey())
        for arxiv_id in self.arxiv_ids:

            # Clean all past output for this arXiv ID.
            output_dir_for_arxiv_id = directories.arxiv_subdir(
                self.get_output_base_dirkey(), arxiv_id
            )
            file_utils.clean_directory(output_dir_for_arxiv_id)

            for source_dir in self.get_source_dirs(arxiv_id):
                qualified_source_dir = os.path.join(sources_base_dir, source_dir)
                output_dir = os.path.join(output_base_dir, source_dir)
                if os.path.exists(output_dir):
                    logging.warning(
                        "Compilation directory already exists in %s. Deleting.",
                        output_dir,
                    )
                    shutil.rmtree(output_dir)
                shutil.copytree(qualified_source_dir, output_dir)
                yield output_dir

    def process(self, item: CompilationPath) -> Iterator[CompilationResult]:
        result = compile_tex(item)
        yield result

    def save(self, item: CompilationPath, result: CompilationResult) -> None:
        file_utils.save_compilation_results(item, result)


class CompileTexSources(CompileTexCommand):
    @staticmethod
    def get_name() -> str:
        return "compile-tex"

    @staticmethod
    def get_description() -> str:
        return "Compile original TeX sources."

    def get_sources_base_dirkey(self) -> str:
        return "sources"

    def get_source_dirs(self, arxiv_id: ArxivId) -> Iterator[RelativePath]:
        return iter([directories.escape_slashes(arxiv_id)])

    def get_output_base_dirkey(self) -> str:
        return "compiled-sources"


def make_compile_tex_command(entity_name: str) -> Type[CompileTexCommand]:
    class C(CompileTexCommand):
        @staticmethod
        def get_name() -> str:
            return f"compile-tex-with-colorized-{entity_name}"

        @staticmethod
        def get_description() -> str:
            return f"Compile TeX sources with colorized {entity_name}."

        def get_sources_base_dirkey(self) -> str:
            return f"sources-with-colorized-{entity_name}"

        def get_output_base_dirkey(self) -> str:
            return f"compiled-sources-with-colorized-{entity_name}"

    return C
