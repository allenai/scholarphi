import logging
import os.path
from abc import ABC, abstractmethod
from typing import Iterator, List, NamedTuple

import cv2
import numpy as np

from explanations import directories
from explanations.compile import get_compiled_pdfs
from explanations.directories import (
    get_arxiv_id_iteration_path,
    get_arxiv_ids,
    get_iteration_names,
)
from explanations.file_utils import clean_directory
from explanations.image_processing import get_cv2_images
from explanations.types import AbsolutePath, ArxivId, RelativePath
from scripts.command import Command


class RasterTask(NamedTuple):
    compiled_tex_path: RelativePath  # relative to directory for arXiv ID
    relative_pdf_path: RelativePath  # relative to iteration path
    absolute_pdf_path: AbsolutePath


class RasterPagesCommand(Command[RasterTask, None], ABC):
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

    def load(self) -> Iterator[RasterTask]:

        papers_base_dir = self.get_papers_base_dir()
        for arxiv_id in get_arxiv_ids(papers_base_dir):

            # Clean all past output for this arXiv ID.
            output_dir_for_arxiv_id = directories.get_data_subdirectory_for_arxiv_id(
                self.get_output_base_dir(), arxiv_id
            )
            clean_directory(output_dir_for_arxiv_id)

            for paper_dir in self.get_paper_dirs(arxiv_id):
                paper_abs_path = os.path.join(self.get_papers_base_dir(), paper_dir)
                pdf_paths = get_compiled_pdfs(paper_abs_path)
                for path in pdf_paths:
                    yield RasterTask(
                        paper_dir, path, os.path.join(paper_abs_path, path)
                    )

    def process(self, _: RasterTask) -> Iterator[None]:
        yield None

    def save(self, item: RasterTask, _: None) -> None:
        output_dir = os.path.join(
            self.get_output_base_dir(),
            item.compiled_tex_path,
            directories.escape_slashes(item.relative_pdf_path),
        )
        images = get_cv2_images(item.absolute_pdf_path)
        self._save_images_to_directory(images, output_dir)

    def _save_images_to_directory(
        self, images: List[np.ndarray], dest_dir: str
    ) -> None:
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
        for page_index, image in enumerate(images):
            image_path = os.path.join(dest_dir, "page-%d.png" % (page_index,))
            cv2.imwrite(image_path, image)
            logging.debug("Rastered page to %s", image_path)


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

    def get_papers_base_dir(self) -> AbsolutePath:
        return directories.COMPILED_SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR

    def get_paper_dirs(self, arxiv_id: ArxivId) -> Iterator[RelativePath]:
        papers_base_dir = self.get_papers_base_dir()
        for iteration in get_iteration_names(papers_base_dir, arxiv_id):
            yield get_arxiv_id_iteration_path(arxiv_id, iteration)

    def get_output_base_dir(self) -> AbsolutePath:
        return directories.PAPER_WITH_COLORIZED_EQUATION_TOKENS_IMAGES_DIR
