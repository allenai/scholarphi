import csv
import logging
import os.path
from abc import ABC, abstractmethod
from typing import Dict, Iterator, List, NamedTuple

import cv2
import fitz
import numpy as np

from explanations import directories
from explanations.bounding_box import extract_bounding_boxes
from explanations.compile import get_compiled_pdfs
from explanations.directories import get_arxiv_ids, get_data_subdirectory_for_arxiv_id
from explanations.file_utils import clean_directory, open_pdf
from explanations.types import ArxivId, PdfBoundingBox
from scripts.command import Command


class Task(NamedTuple):
    arxiv_id: ArxivId
    page_images: Dict[int, np.ndarray]
    pdf: fitz.Document
    relative_pdf_path: str
    hues: List[float]


class HueLocation(NamedTuple):
    hue: float
    box: PdfBoundingBox


class LocateHues(Command[Task, HueLocation], ABC):
    """
    Locate hues in paper diffs.
    """

    @staticmethod
    @abstractmethod
    def get_diff_images_base_dir() -> str:
        """
        Path to data directory containing diffs of colorized pages with uncolorized pages for all papers.
        """

    @staticmethod
    @abstractmethod
    def get_output_base_dir() -> str:
        """
        Path to the data directory where hue bounding boxes should be output.
        """

    @abstractmethod
    def load_hues(self, arxiv_id: ArxivId) -> List[float]:
        """
        Load a list of hues for which you need bounding box locations.
        """

    def load(self) -> Iterator[Task]:
        for arxiv_id in get_arxiv_ids(self.get_diff_images_base_dir()):
            output_dir = get_data_subdirectory_for_arxiv_id(
                self.get_output_base_dir(), arxiv_id
            )
            clean_directory(output_dir)

            hues = self.load_hues(arxiv_id)

            pdf_paths = get_compiled_pdfs(directories.compilation_results(arxiv_id))
            if len(pdf_paths) == 0:
                continue

            diff_images_dir = get_data_subdirectory_for_arxiv_id(
                self.get_diff_images_base_dir(), arxiv_id
            )

            for relative_pdf_path in pdf_paths:
                pdf = open_pdf(
                    os.path.join(
                        directories.compilation_results(arxiv_id), relative_pdf_path
                    )
                )
                diff_images_pdf_path = os.path.join(diff_images_dir, relative_pdf_path)
                page_images = {}

                for img_name in os.listdir(diff_images_pdf_path):
                    img_path = os.path.join(diff_images_pdf_path, img_name)
                    page_image = cv2.imread(img_path)
                    page_number = int(
                        os.path.splitext(img_name)[0].replace("page-", "")
                    )
                    page_images[page_number] = page_image

                yield Task(arxiv_id, page_images, pdf, relative_pdf_path, hues)

    def process(self, item: Task) -> Iterator[HueLocation]:
        for page_number, image in item.page_images.items():
            boxes_by_hue = extract_bounding_boxes(
                image, page_number, item.hues, item.pdf
            )
            for hue, boxes in boxes_by_hue.items():
                for box in boxes:
                    yield HueLocation(hue, box)

    def save(self, item: Task, result: HueLocation) -> None:
        output_dir = get_data_subdirectory_for_arxiv_id(
            self.get_output_base_dir(), item.arxiv_id
        )
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        output_path = os.path.join(output_dir, "hue_locations.csv")
        with open(output_path, "a") as output_file:
            writer = csv.writer(output_file, quoting=csv.QUOTE_ALL)
            writer.writerow(
                [
                    item.relative_pdf_path,
                    result.hue,
                    result.box.page,
                    result.box.left,
                    result.box.top,
                    result.box.width,
                    result.box.height,
                ]
            )


class LocateCitationHues(LocateHues):
    @staticmethod
    def get_name() -> str:
        return "locate-citation-hues"

    @staticmethod
    def get_description() -> str:
        return "Find bounding boxes of citations by hue."

    def load_hues(self, arxiv_id: ArxivId) -> List[float]:
        hues_path = os.path.join(
            directories.sources_with_colorized_citations(arxiv_id), "citation_hues.csv"
        )
        if not os.path.exists(hues_path):
            logging.warning("Could not find any citation hues for %s", arxiv_id)
            return []

        hues = []
        with open(hues_path) as hues_file:
            reader = csv.reader(hues_file)
            for row in reader:
                hues.append(float(row[1]))
        return hues

    @staticmethod
    def get_diff_images_base_dir() -> str:
        return directories.DIFF_IMAGES_WITH_COLORIZED_CITATIONS_DIR

    @staticmethod
    def get_output_base_dir() -> str:
        return directories.HUE_LOCATIONS_FOR_CITATIONS_DIR
