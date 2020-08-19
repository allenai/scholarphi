import ast
import configparser
import logging
import os.path
import subprocess
from dataclasses import dataclass
from typing import Dict, Iterator

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.compile import get_output_files
from common.types import ArxivId, RelativePath

"""
Load commands for rastering TeX outputs.
"""
RASTER_CONFIG = "config.ini"


@dataclass(frozen=True)
class RasterTask:
    arxiv_id: ArxivId
    output_file_type: str
    relative_output_file_path: RelativePath
    " Relative to LaTeX compilation directory. "


class RasterPages(ArxivBatchCommand[RasterTask, None]):
    """
    Raster images of pages from a paper.
    Rasters are save to a directory parallel to the one from which the PDF was read.
    If a PDF was rendered at:
      /path/to/<compiled-papers-dir>/relative/path/1/<file.pdf>
    The rastser will be written to:
      /path/to/<output-dir>/relative/path/1/file.pdf/[0-N].png
    """

    @staticmethod
    def get_name() -> str:
        return "raster-pages"

    @staticmethod
    def get_description() -> str:
        return "Raster images of pages from the un-colorized papers."

    def get_arxiv_ids_dirkey(self) -> str:
        return "compiled-sources"

    def load(self) -> Iterator[RasterTask]:

        for arxiv_id in self.arxiv_ids:

            # Clean all past output for this arXiv ID.
            output_dir_for_arxiv_id = directories.arxiv_subdir("paper-images", arxiv_id)
            file_utils.clean_directory(output_dir_for_arxiv_id)

            paper_abs_path = directories.arxiv_subdir("compiled-sources", arxiv_id)
            output_files = get_output_files(paper_abs_path)
            for output_file in output_files:
                yield RasterTask(
                    arxiv_id, output_file.output_type, output_file.path,
                )

    def process(self, _: RasterTask) -> Iterator[None]:
        yield None

    def save(self, item: RasterTask, _: None) -> None:
        raster_pages(
            directories.arxiv_subdir("compiled-sources", item.arxiv_id),
            os.path.join(
                directories.arxiv_subdir("paper-images", item.arxiv_id),
                directories.escape_slashes(item.relative_output_file_path),
            ),
            item.relative_output_file_path,
            item.output_file_type,
        )


def raster_pages(
    compiled_tex_dir: RelativePath,
    raster_output_dir: RelativePath,
    compiled_file_path: RelativePath,
    compiled_file_type: str,
) -> bool:
    if not os.path.exists(raster_output_dir):
        os.makedirs(raster_output_dir)

    config = configparser.ConfigParser()
    config.read(RASTER_CONFIG)

    raster_commands: Dict[str, str] = {}
    if "rasterers" in config:
        raster_commands = dict(config["rasterers"])

    try:
        raster_command = raster_commands[compiled_file_type]
    except KeyError:
        logging.warning(  # pylint: disable=logging-not-lazy
            (
                "Could not find a rastering command for file %s in directory %s "
                + "of type %s. This file will not be rastered."
            ),
            compiled_file_path,
            compiled_tex_dir,
            compiled_file_type,
        )
        return False

    args = ast.literal_eval(raster_command)
    resolved_compiled_file_path = os.path.join(compiled_tex_dir, compiled_file_path)
    args_resolved = [
        arg.format(output_dir=raster_output_dir, file=resolved_compiled_file_path)
        for arg in args
    ]

    result = subprocess.run(
        args_resolved, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
    )
    if result.returncode == 0:
        logging.debug(
            "Successfully rastered pages for file %s using command %s",
            resolved_compiled_file_path,
            args_resolved,
        )
    else:
        logging.error(
            "Error rastering file %s using command %s: (Stdout: %s), (Stderr: %s)",
            resolved_compiled_file_path,
            args_resolved,
            result.stdout,
            result.stderr,
        )
        return False

    return True
