import csv
import logging
import os.path
from abc import ABC, abstractmethod
from typing import Dict, Iterator, List, NamedTuple

import fitz

from explanations import directories
from explanations.compile import get_compiled_pdfs
from explanations.directories import get_arxiv_ids, get_data_subdirectory_for_arxiv_id
from explanations.file_utils import clean_directory, open_pdf
from explanations.image_processing import annotate_pdf
from explanations.types import ArxivId, PdfBoundingBox
from scripts.command import Command


class PdfAndBoxes(NamedTuple):
    arxiv_id: ArxivId
    pdf: fitz.Document
    relative_pdf_path: str
    bounding_boxes: List[PdfBoundingBox]


class AnnotatePdfsCommand(Command[PdfAndBoxes, fitz.Document], ABC):
    """
    Annotate PDFs with bounding boxes.
    """

    @staticmethod
    @abstractmethod
    def get_output_base_dir() -> str:
        """
        Path to the data directory where annotated PDFs should be output.
        """

    @abstractmethod
    def load_bounding_boxes(self, arxiv_id: ArxivId) -> Dict[str, List[PdfBoundingBox]]:
        """
        Load map from PDF paths to bounding boxes for those PDFs.
        """

    def load(self) -> Iterator[PdfAndBoxes]:
        for arxiv_id in get_arxiv_ids(directories.COMPILED_SOURCES_DIR):
            output_dir = get_data_subdirectory_for_arxiv_id(
                self.get_output_base_dir(), arxiv_id
            )
            clean_directory(output_dir)

            bounding_boxes = self.load_bounding_boxes(arxiv_id)

            pdf_paths = get_compiled_pdfs(directories.compilation_results(arxiv_id))
            if len(pdf_paths) == 0:
                continue

            for relative_pdf_path in pdf_paths:
                pdf = open_pdf(
                    os.path.join(
                        directories.compilation_results(arxiv_id), relative_pdf_path
                    )
                )
                if relative_pdf_path in bounding_boxes:
                    yield PdfAndBoxes(
                        arxiv_id,
                        pdf,
                        relative_pdf_path,
                        bounding_boxes[relative_pdf_path],
                    )

    def process(self, item: PdfAndBoxes) -> Iterator[fitz.Document]:
        annotate_pdf(item.pdf, item.bounding_boxes)
        yield item.pdf

    def save(self, item: PdfAndBoxes, result: fitz.Document) -> None:
        output_dir = get_data_subdirectory_for_arxiv_id(
            self.get_output_base_dir(), item.arxiv_id
        )
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        output_pdf_path = os.path.join(output_dir, item.relative_pdf_path)
        result.save(output_pdf_path)


def common_load_bounding_boxes(
    hue_locations_dir_path: str
) -> Dict[str, List[PdfBoundingBox]]:
    box_data_path = os.path.join(hue_locations_dir_path, "hue_locations.csv")

    if not os.path.exists(box_data_path):
        logging.warning(
            "Could not find any bounding box data in directory %s",
            hue_locations_dir_path,
        )
        return {}

    boxes: Dict[str, List[PdfBoundingBox]] = {}
    with open(box_data_path) as box_data_file:
        reader = csv.reader(box_data_file)
        for row in reader:
            pdf_path = row[0]
            box = PdfBoundingBox(
                page=int(row[2]),
                left=float(row[3]),
                top=float(row[4]),
                width=float(row[5]),
                height=float(row[6]),
            )
            if not pdf_path in boxes:
                boxes[pdf_path] = []
            boxes[pdf_path].append(box)
    return boxes


class AnnotatePdfsWithCitationBoxes(AnnotatePdfsCommand):
    @staticmethod
    def get_name() -> str:
        return "annotate-pdfs-with-citation-boxes"

    @staticmethod
    def get_description() -> str:
        return "Annotate PDFs with bounding boxes for citations."

    @staticmethod
    def get_output_base_dir() -> str:
        return directories.ANNOTATED_PDFS_WITH_CITATION_BOXES_DIR

    def load_bounding_boxes(self, arxiv_id: ArxivId) -> Dict[str, List[PdfBoundingBox]]:
        return common_load_bounding_boxes(
            directories.hue_locations_for_citations(arxiv_id)
        )


class AnnotatePdfsWithEquationBoxes(AnnotatePdfsCommand):
    @staticmethod
    def get_name() -> str:
        return "annotate-pdfs-with-equation-boxes"

    @staticmethod
    def get_description() -> str:
        return "Annotate PDFs with bounding boxes for equations."

    @staticmethod
    def get_output_base_dir() -> str:
        return directories.ANNOTATED_PDFS_WITH_EQUATION_BOXES_DIR

    def load_bounding_boxes(self, arxiv_id: ArxivId) -> Dict[str, List[PdfBoundingBox]]:
        return common_load_bounding_boxes(
            directories.hue_locations_for_equations(arxiv_id)
        )
