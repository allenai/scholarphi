import logging
import os.path
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Iterator

import cv2
import numpy as np

from command.command import ArxivBatchCommand
from common import directories
from common.compile import get_output_files
from common.file_utils import clean_directory
from common.image_processing import diff_images
from common.types import ArxivId


@dataclass(frozen=True)
class PageRasterPair:
    arxiv_id: ArxivId
    iteration: str
    relative_path: str
    image_name: str
    original: np.ndarray
    modified: np.ndarray


class DiffImagesCommand(ArxivBatchCommand[PageRasterPair, np.ndarray], ABC):
    """
    Diff images from a modified rendering of TeX files with the original rendering.
    """

    @staticmethod
    @abstractmethod
    def get_raster_base_dirkey() -> str:
        """
        Key for the data directory containing modified renderings for all papers.
        """

    @staticmethod
    @abstractmethod
    def get_output_base_dirkey() -> str:
        """
        Key for the data directory where diff images should be output.
        """

    def get_arxiv_ids_dirkey(self) -> str:
        return "paper-images"

    def load(self) -> Iterator[PageRasterPair]:
        for arxiv_id in self.arxiv_ids:
            output_dir = directories.arxiv_subdir(
                self.get_output_base_dirkey(), arxiv_id
            )
            clean_directory(output_dir)

            # Get output file names from results of compiling the uncolorized TeX sources.
            output_files = get_output_files(
                directories.arxiv_subdir("compiled-sources", arxiv_id)
            )
            if len(output_files) == 0:
                continue

            for iteration in directories.iteration_names(
                self.get_raster_base_dirkey(), arxiv_id
            ):

                original_images_dir = directories.arxiv_subdir("paper-images", arxiv_id)
                modified_images_dir = directories.iteration(
                    self.get_raster_base_dirkey(), arxiv_id, iteration
                )

                for output_file in output_files:
                    relative_file_path = output_file.path
                    original_images_path = os.path.join(
                        original_images_dir, relative_file_path
                    )
                    for img_name in os.listdir(original_images_path):
                        original_img_path = os.path.join(original_images_path, img_name)
                        modified_img_path = os.path.join(
                            modified_images_dir, relative_file_path, img_name
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
                            iteration,
                            relative_file_path,
                            img_name,
                            original_img,
                            modified_img,
                        )

    def process(self, item: PageRasterPair) -> Iterator[np.ndarray]:
        # Colorized images is the first parameter: this means that original_images will be
        # subtracted from colorized_images where the two are the same.
        yield diff_images(item.modified, item.original)

    def save(self, item: PageRasterPair, result: np.ndarray) -> None:
        output_dir = directories.iteration(
            self.get_output_base_dirkey(), item.arxiv_id, item.iteration
        )
        image_path = os.path.join(output_dir, item.relative_path, item.image_name)
        image_dir = os.path.dirname(image_path)
        if not os.path.exists(image_dir):
            os.makedirs(image_dir)
        cv2.imwrite(image_path, result)
        logging.debug("Diffed images and stored result at %s", image_path)


class DiffImagesWithColorizedCitations(DiffImagesCommand):
    @staticmethod
    def get_name() -> str:
        return "diff-images-with-colorized-citations"

    @staticmethod
    def get_description() -> str:
        return "Diff images of pages with colorized citations with uncolorized images."

    @staticmethod
    def get_entity_type() -> str:
        return "citations"

    @staticmethod
    def get_raster_base_dirkey() -> str:
        return "paper-with-colorized-citations-images"

    @staticmethod
    def get_output_base_dirkey() -> str:
        return "diff-images-with-colorized-citations"


class DiffImagesWithColorizedEquations(DiffImagesCommand):
    @staticmethod
    def get_name() -> str:
        return "diff-images-with-colorized-equations"

    @staticmethod
    def get_description() -> str:
        return "Diff images of pages with colorized equations with uncolorized images."

    @staticmethod
    def get_entity_type() -> str:
        return "symbols"

    @staticmethod
    def get_raster_base_dirkey() -> str:
        return "paper-with-colorized-equations-images"

    @staticmethod
    def get_output_base_dirkey() -> str:
        return "diff-images-with-colorized-equations"


class DiffImagesWithColorizedEquationTokens(DiffImagesCommand):
    @staticmethod
    def get_name() -> str:
        return "diff-images-with-colorized-equation-tokens"

    @staticmethod
    def get_description() -> str:
        return "Diff images of pages with colorized equation tokens with uncolorized images."

    @staticmethod
    def get_entity_type() -> str:
        return "symbols"

    @staticmethod
    def get_raster_base_dirkey() -> str:
        return "paper-with-colorized-equation-tokens-images"

    @staticmethod
    def get_output_base_dirkey() -> str:
        return "diff-images-with-colorized-equation-tokens"
