import logging
import os.path
from abc import ABC, abstractmethod
from typing import Iterator, NamedTuple

import cv2
import fitz
import numpy as np

from explanations import directories
from explanations.compile import get_compiled_pdfs
from explanations.directories import get_arxiv_ids, get_data_subdirectory_for_arxiv_id
from explanations.file_utils import clean_directory
from explanations.image_processing import diff_images
from explanations.types import ArxivId
from scripts.command import Command


class PageRasterPair(NamedTuple):
    arxiv_id: ArxivId
    relative_path: str
    image_name: str
    original: np.ndarray
    modified: np.ndarray


class DiffImagesCommand(Command[PageRasterPair, fitz.Document], ABC):
    """
    Diff images from a modified rendering of TeX files with the original rendering.
    """

    @staticmethod
    @abstractmethod
    def get_raster_base_dir() -> str:
        """
        Path to data directory containing modified renderings for all papers.
        """

    @staticmethod
    @abstractmethod
    def get_output_base_dir() -> str:
        """
        Path to the data directory where diff images should be output.
        """

    def load(self) -> Iterator[PageRasterPair]:
        for arxiv_id in get_arxiv_ids(directories.PAPER_IMAGES_DIR):
            output_dir = get_data_subdirectory_for_arxiv_id(
                self.get_output_base_dir(), arxiv_id
            )
            clean_directory(output_dir)

            pdf_paths = get_compiled_pdfs(directories.compilation_results(arxiv_id))
            if len(pdf_paths) == 0:
                continue

            original_images_dir = directories.paper_images(arxiv_id)
            modified_images_dir = get_data_subdirectory_for_arxiv_id(
                self.get_raster_base_dir(), arxiv_id
            )

            for relative_pdf_path in pdf_paths:
                original_pdf_images_path = os.path.join(
                    original_images_dir, relative_pdf_path
                )
                for img_name in os.listdir(original_pdf_images_path):
                    original_img_path = os.path.join(original_pdf_images_path, img_name)
                    modified_img_path = os.path.join(
                        modified_images_dir, relative_pdf_path, img_name
                    )
                    if not os.path.exists(modified_img_path):
                        logging.warning(
                            "Could not find expected image %s. Skipping diff for this paper.",
                            modified_img_path,
                        )
                        break

                    original_img = cv2.imread(original_img_path)
                    modified_img = cv2.imread(modified_img_path)
                    yield PageRasterPair(
                        arxiv_id,
                        relative_pdf_path,
                        img_name,
                        original_img,
                        modified_img,
                    )

    def process(self, item: PageRasterPair) -> Iterator[np.ndarray]:
        # Colorized images is the first parameter: this means that original_images will be
        # subtracted from colorized_images where the two are the same.
        yield diff_images(item.modified, item.original)

    def save(self, item: PageRasterPair, result: np.ndarray) -> None:
        output_dir = get_data_subdirectory_for_arxiv_id(
            self.get_output_base_dir(), item.arxiv_id
        )
        image_path = os.path.join(output_dir, item.relative_path, item.image_name)
        image_dir = os.path.dirname(image_path)
        if not os.path.exists(image_dir):
            os.makedirs(image_dir)
        print(image_path)
        cv2.imwrite(image_path, result)


class DiffImagesWithColorizedCitations(DiffImagesCommand):
    @staticmethod
    def get_name() -> str:
        return "diff-images-with-colorized-citations"

    @staticmethod
    def get_description() -> str:
        return "Diff images of pages with colorized citations with uncolorized images."

    @staticmethod
    def get_raster_base_dir() -> str:
        return directories.PAPER_WITH_COLORIZED_CITATIONS_IMAGES_DIR

    @staticmethod
    def get_output_base_dir() -> str:
        return directories.DIFF_IMAGES_WITH_COLORIZED_CITATIONS_DIR


class DiffImagesWithColorizedEquations(DiffImagesCommand):
    @staticmethod
    def get_name() -> str:
        return "diff-images-with-colorized-equations"

    @staticmethod
    def get_description() -> str:
        return "Diff images of pages with colorized equations with uncolorized images."

    @staticmethod
    def get_raster_base_dir() -> str:
        return directories.PAPER_WITH_COLORIZED_EQUATIONS_IMAGES_DIR

    @staticmethod
    def get_output_base_dir() -> str:
        return directories.DIFF_IMAGES_WITH_COLORIZED_EQUATIONS_DIR
