import ast
import configparser
import logging
import os.path
import subprocess
from abc import ABC, abstractmethod
from typing import Dict, Iterator, NamedTuple, Type

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.compile import get_output_files
from common.types import AbsolutePath, ArxivId, RelativePath

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
    def get_papers_base_dirkey(self) -> str:
        """
        Key for the data directory containing all compiled TeX papers.
        """

    @abstractmethod
    def get_paper_dirs(self, arxiv_id: ArxivId) -> Iterator[RelativePath]:
        """
        Get all directories containing compiled TeX sources that should be rastered, for a given
        arXiv ID. Paths should be relative to the papers base dir.
        """

    @abstractmethod
    def get_output_base_dirkey(self) -> str:
        """
        Key for the data directory where images of the paper should be output.
        """

    def get_arxiv_ids_dirkey(self) -> str:
        return self.get_papers_base_dirkey()

    def load(self) -> Iterator[RasterTask]:

        for arxiv_id in self.arxiv_ids:

            # Clean all past output for this arXiv ID.
            output_dir_for_arxiv_id = directories.arxiv_subdir(
                self.get_output_base_dirkey(), arxiv_id
            )
            file_utils.clean_directory(output_dir_for_arxiv_id)

            for paper_dir in self.get_paper_dirs(arxiv_id):
                paper_abs_path = os.path.join(
                    directories.dirpath(self.get_papers_base_dirkey()), paper_dir
                )
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
            directories.dirpath(self.get_output_base_dirkey()),
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

    def get_papers_base_dirkey(self) -> str:
        return "compiled-sources"

    def get_paper_dirs(self, arxiv_id: ArxivId) -> Iterator[RelativePath]:
        return iter([directories.escape_slashes(arxiv_id)])

    def get_output_base_dirkey(self) -> str:
        return "paper-images"


def make_raster_pages_command(
    entity_name: str, entity_type: str
) -> Type[RasterPagesCommand]:
    class C(RasterPagesCommand):
        @staticmethod
        def get_name() -> str:
            return f"raster-pages-with-colorized-{entity_name}"

        @staticmethod
        def get_description() -> str:
            return f"Raster images of pages from papers with colorized {entity_name}."

        @staticmethod
        def get_entity_type() -> str:
            return entity_type

        def get_papers_base_dirkey(self) -> str:
            return f"compiled-sources-with-colorized-{entity_name}"

        def get_paper_dirs(self, arxiv_id: ArxivId) -> Iterator[RelativePath]:
            for iteration in directories.iteration_names(
                self.get_papers_base_dirkey(), arxiv_id
            ):
                yield directories.relpath_arxiv_id_iteration(arxiv_id, iteration)

        def get_output_base_dirkey(self) -> str:
            return f"paper-with-colorized-{entity_name}-images"

    return C


RasterPagesWithColorizedEquationTokens = make_raster_pages_command(
    "equation-tokens", "symbols"
)
