import os.path
from abc import ABC, abstractmethod
from typing import Iterator, List, NamedTuple

import cv2
import fitz
import numpy as np

from explanations import directories
from explanations.compile import get_compiled_pdfs
from explanations.directories import get_data_subdirectory_for_arxiv_id
from explanations.file_utils import clean_directory, open_pdf
from explanations.image_processing import get_cv2_images
from explanations.types import ArxivId
from scripts.command import Command


class PdfPath(NamedTuple):
    arxiv_id: ArxivId
    relative_path: str


class RasterPagesCommand(Command[PdfPath, fitz.Document], ABC):
    """
    Raster images of pages from a paper.
    """

    @staticmethod
    @abstractmethod
    def get_papers_base_dir() -> str:
        """
        Path to data directory containing all compiled TeX papers.
        """

    @staticmethod
    @abstractmethod
    def get_output_base_dir() -> str:
        """
        Path to the data directory where images of the paper should be output.
        """

    def load(self) -> Iterator[PdfPath]:
        for arxiv_id in os.listdir(self.get_papers_base_dir()):
            output_dir = get_data_subdirectory_for_arxiv_id(
                self.get_output_base_dir(), arxiv_id
            )
            clean_directory(output_dir)

            pdf_paths = get_compiled_pdfs(
                get_data_subdirectory_for_arxiv_id(self.get_papers_base_dir(), arxiv_id)
            )
            for path in pdf_paths:
                yield PdfPath(arxiv_id, path)

    def process(self, item: PdfPath) -> Iterator[fitz.Document]:
        papers_dir = get_data_subdirectory_for_arxiv_id(
            self.get_papers_base_dir(), item.arxiv_id
        )
        pdf_absolute_path = os.path.join(papers_dir, item.relative_path)
        yield open_pdf(pdf_absolute_path)

    def _save_images_to_directory(
        self, images: List[np.ndarray], dest_dir: str
    ) -> None:
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
        for page_index, image in enumerate(images):
            image_path = os.path.join(dest_dir, "page-%d.png" % (page_index,))
            cv2.imwrite(image_path, image)

    def save(self, item: PdfPath, result: fitz.Document) -> None:
        output_dir = get_data_subdirectory_for_arxiv_id(
            self.get_output_base_dir(), item.arxiv_id
        )

        images = get_cv2_images(result)
        self._save_images_to_directory(
            images, os.path.join(output_dir, item.relative_path)
        )


class RasterPages(RasterPagesCommand):
    @staticmethod
    def get_name() -> str:
        return "raster-pages"

    @staticmethod
    def get_description() -> str:
        return "Raster images of pages from the un-colorized papers."

    @staticmethod
    def get_papers_base_dir() -> str:
        return directories.COMPILED_SOURCES_DIR

    @staticmethod
    def get_output_base_dir() -> str:
        return directories.PAPER_IMAGES_DIR


class RasterPagesWithColorizedCitations(RasterPagesCommand):
    @staticmethod
    def get_name() -> str:
        return "raster-pages-with-colorized-citations"

    @staticmethod
    def get_description() -> str:
        return "Raster images of pages from papers with colorized citations."

    @staticmethod
    def get_papers_base_dir() -> str:
        return directories.COMPILED_SOURCES_WITH_COLORIZED_CITATIONS_DIR

    @staticmethod
    def get_output_base_dir() -> str:
        return directories.PAPER_WITH_COLORIZED_CITATIONS_IMAGES_DIR


class RasterPagesWithColorizedEquations(RasterPagesCommand):
    @staticmethod
    def get_name() -> str:
        return "raster-pages-with-colorized-equations"

    @staticmethod
    def get_description() -> str:
        return "Raster images of pages from papers with colorized equations."

    @staticmethod
    def get_papers_base_dir() -> str:
        return directories.COMPILED_SOURCES_WITH_COLORIZED_EQUATIONS_DIR

    @staticmethod
    def get_output_base_dir() -> str:
        return directories.PAPER_WITH_COLORIZED_EQUATIONS_IMAGES_DIR


class RasterPagesWithColorizedEquationTokens(RasterPagesCommand):
    @staticmethod
    def get_name() -> str:
        return "raster-pages-with-colorized-equation-tokens"

    @staticmethod
    def get_description() -> str:
        return "Raster images of pages from papers with colorized equation tokens."

    @staticmethod
    def get_papers_base_dir() -> str:
        return directories.COMPILED_SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR

    @staticmethod
    def get_output_base_dir() -> str:
        return directories.PAPER_WITH_COLORIZED_EQUATION_TOKENS_IMAGES_DIR
