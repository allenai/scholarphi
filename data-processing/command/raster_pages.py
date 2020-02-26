import ast
import configparser
import logging
import os.path
import subprocess
from abc import ABC, abstractmethod
from typing import Dict, Iterator, NamedTuple

from common.compile import get_output_files
from common.directories import get_arxiv_id_iteration_path, get_iteration_names
from common.file_utils import clean_directory
from common.types import AbsolutePath, ArxivId, Path, RelativePath
from common import directories
from command.command import ArxivBatchCommand

"""
Load commands for rastering TeX outputs.
"""
RASTER_CONFIG = "config.ini"
config = configparser.ConfigParser()
config.read(RASTER_CONFIG)

raster_commands: Dict[str, str] = {}
if "rasterers" in config:
    raster_commands = {k: v for (k, v) in config["rasterers"].items()}


class RasterTask(NamedTuple):
    compiled_tex_path: RelativePath  # relative to directory for arXiv ID
    output_file_type: str
    relative_output_file_path: RelativePath  # relative to iteration path
    absolute_output_file_path: AbsolutePath


class RasterPagesCommand(ArxivBatchCommand[RasterTask, None], ABC):
    """
    Raster images of pages from a paper.
    Rasters are save to a directory parallel to the one from which the PDF was read.
    If a PDF was rendered at:
      /path/to/<compiled-papers-dir>/relative/path/1/<file.pdf>
    The rastser will be written to:
      /path/to/<output-dir>/relative/path/1/file.pdf/[0-N].png
    """

    @abstractmethod
    def get_papers_base_dir(self) -> AbsolutePath:
        """
        Path to data directory containing all compiled TeX papers.
        """

    @abstractmethod
    def get_paper_dirs(self, arxiv_id: ArxivId) -> Iterator[RelativePath]:
        """
        Get all directories containing compiled TeX sources that should be rastered, for a given
        arXiv ID. Paths should be relative to the papers base dir.
        """

    @abstractmethod
    def get_output_base_dir(self) -> AbsolutePath:
        """
        Path to the data directory where images of the paper should be output.
        """

    def get_arxiv_ids_dir(self) -> Path:
        return self.get_papers_base_dir()

    def load(self) -> Iterator[RasterTask]:

        for arxiv_id in self.arxiv_ids:

            # Clean all past output for this arXiv ID.
            output_dir_for_arxiv_id = directories.get_data_subdirectory_for_arxiv_id(
                self.get_output_base_dir(), arxiv_id
            )
            clean_directory(output_dir_for_arxiv_id)

            for paper_dir in self.get_paper_dirs(arxiv_id):
                paper_abs_path = os.path.join(self.get_papers_base_dir(), paper_dir)
                output_files = get_output_files(paper_abs_path)
                for output_file in output_files:
                    yield RasterTask(
                        paper_dir,
                        output_file.output_type,
                        output_file.path,
                        os.path.join(paper_abs_path, output_file.path),
                    )

    def process(self, _: RasterTask) -> Iterator[None]:
        yield None

    def save(self, item: RasterTask, _: None) -> None:
        output_dir = os.path.join(
            self.get_output_base_dir(),
            item.compiled_tex_path,
            directories.escape_slashes(item.relative_output_file_path),
        )
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        try:
            raster_command = raster_commands[item.output_file_type]
        except KeyError:
            logging.warning(  # pylint: disable=logging-not-lazy
                (
                    "Could not find a rastering command for file %s in directory %s "
                    + "of type %s. This file will not be rastered."
                ),
                item.relative_output_file_path,
                item.compiled_tex_path,
                item.output_file_type,
            )
            return

        args = ast.literal_eval(raster_command)
        args_resolved = [
            arg.format(output_dir=output_dir, file=item.absolute_output_file_path)
            for arg in args
        ]

        result = subprocess.run(
            args_resolved, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
        )
        if result.returncode == 0:
            logging.debug(
                "Successfully rastered pages for file %s using command %s",
                item.absolute_output_file_path,
                args_resolved,
            )
        else:
            logging.error(
                "Error rastering file %s using command %s: (Stdout: %s), (Stderr: %s)",
                item.absolute_output_file_path,
                args_resolved,
                result.stdout,
                result.stderr,
            )


class RasterPages(RasterPagesCommand):
    @staticmethod
    def get_name() -> str:
        return "raster-pages"

    @staticmethod
    def get_description() -> str:
        return "Raster images of pages from the un-colorized papers."

    def get_papers_base_dir(self) -> AbsolutePath:
        return directories.COMPILED_SOURCES_DIR

    def get_paper_dirs(self, arxiv_id: ArxivId) -> Iterator[RelativePath]:
        return iter([directories.escape_slashes(arxiv_id)])

    def get_output_base_dir(self) -> AbsolutePath:
        return directories.PAPER_IMAGES_DIR


class RasterPagesWithColorizedCitations(RasterPagesCommand):
    @staticmethod
    def get_name() -> str:
        return "raster-pages-with-colorized-citations"

    @staticmethod
    def get_description() -> str:
        return "Raster images of pages from papers with colorized citations."

    @staticmethod
    def get_entity_type() -> str:
        return "citations"

    def get_papers_base_dir(self) -> AbsolutePath:
        return directories.COMPILED_SOURCES_WITH_COLORIZED_CITATIONS_DIR

    def get_paper_dirs(self, arxiv_id: ArxivId) -> Iterator[RelativePath]:
        papers_base_dir = self.get_papers_base_dir()
        for iteration in get_iteration_names(papers_base_dir, arxiv_id):
            yield get_arxiv_id_iteration_path(arxiv_id, iteration)

    def get_output_base_dir(self) -> AbsolutePath:
        return directories.PAPER_WITH_COLORIZED_CITATIONS_IMAGES_DIR


class RasterPagesWithColorizedEquations(RasterPagesCommand):
    @staticmethod
    def get_name() -> str:
        return "raster-pages-with-colorized-equations"

    @staticmethod
    def get_description() -> str:
        return "Raster images of pages from papers with colorized equations."

    @staticmethod
    def get_entity_type() -> str:
        return "symbols"

    def get_papers_base_dir(self) -> AbsolutePath:
        return directories.COMPILED_SOURCES_WITH_COLORIZED_EQUATIONS_DIR

    def get_paper_dirs(self, arxiv_id: ArxivId) -> Iterator[RelativePath]:
        papers_base_dir = self.get_papers_base_dir()
        for iteration in get_iteration_names(papers_base_dir, arxiv_id):
            yield get_arxiv_id_iteration_path(arxiv_id, iteration)

    def get_output_base_dir(self) -> AbsolutePath:
        return directories.PAPER_WITH_COLORIZED_EQUATIONS_IMAGES_DIR


class RasterPagesWithColorizedEquationTokens(RasterPagesCommand):
    @staticmethod
    def get_name() -> str:
        return "raster-pages-with-colorized-equation-tokens"

    @staticmethod
    def get_description() -> str:
        return "Raster images of pages from papers with colorized equation tokens."

    @staticmethod
    def get_entity_type() -> str:
        return "symbols"

    def get_papers_base_dir(self) -> AbsolutePath:
        return directories.COMPILED_SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR

    def get_paper_dirs(self, arxiv_id: ArxivId) -> Iterator[RelativePath]:
        papers_base_dir = self.get_papers_base_dir()
        for iteration in get_iteration_names(papers_base_dir, arxiv_id):
            yield get_arxiv_id_iteration_path(arxiv_id, iteration)

    def get_output_base_dir(self) -> AbsolutePath:
        return directories.PAPER_WITH_COLORIZED_EQUATION_TOKENS_IMAGES_DIR
