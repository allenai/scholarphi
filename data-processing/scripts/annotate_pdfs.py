import csv
import logging
import os.path
from abc import ABC, abstractmethod
from typing import Dict, Iterator, List, NamedTuple

from explanations import directories
from explanations.compile import get_compiled_pdfs
from explanations.directories import get_data_subdirectory_for_arxiv_id
from explanations.file_utils import clean_directory
from explanations.image_processing import annotate_pdf
from explanations.types import (
    AbsolutePath,
    ArxivId,
    Path,
    PdfBoundingBox,
    PdfBoundingBoxAndHue,
    RelativePath,
)
from scripts.command import ArxivBatchCommand


class PdfAndBoxes(NamedTuple):
    arxiv_id: ArxivId
    relative_pdf_path: RelativePath
    absolute_pdf_path: AbsolutePath
    boxes_and_hues: List[PdfBoundingBoxAndHue]


class AnnotatePdfsCommand(ArxivBatchCommand[PdfAndBoxes, None], ABC):
    """
    Annotate PDFs with bounding boxes.
    """

    @staticmethod
    @abstractmethod
    def get_output_base_dir() -> str:
        """
        Path to the data directory where annotated PDFs should be output.
        """

    def get_arxiv_ids_dir(self) -> Path:
        return directories.COMPILED_SOURCES_DIR

    @abstractmethod
    def load_bounding_boxes(
        self, arxiv_id: ArxivId
    ) -> Dict[str, List[PdfBoundingBoxAndHue]]:
        """
        Load map from PDF paths to bounding boxes for those PDFs.
        """

    def load(self) -> Iterator[PdfAndBoxes]:
        for arxiv_id in self.arxiv_ids:
            output_dir = get_data_subdirectory_for_arxiv_id(
                self.get_output_base_dir(), arxiv_id
            )
            clean_directory(output_dir)

            boxes_and_hues = self.load_bounding_boxes(arxiv_id)

            pdf_paths = get_compiled_pdfs(directories.compilation_results(arxiv_id))
            if len(pdf_paths) == 0:
                continue

            for relative_pdf_path in pdf_paths:
                absolute_pdf_path = os.path.join(
                    directories.compilation_results(arxiv_id), relative_pdf_path
                )
                if relative_pdf_path in boxes_and_hues:
                    yield PdfAndBoxes(
                        arxiv_id,
                        relative_pdf_path,
                        absolute_pdf_path,
                        boxes_and_hues[relative_pdf_path],
                    )

    def process(self, _: PdfAndBoxes) -> Iterator[None]:
        yield None

    def save(self, item: PdfAndBoxes, _: None) -> None:
        output_dir = get_data_subdirectory_for_arxiv_id(
            self.get_output_base_dir(), item.arxiv_id
        )
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        output_pdf_path = os.path.join(output_dir, item.relative_pdf_path)
        annotate_pdf(item.absolute_pdf_path, output_pdf_path, item.boxes_and_hues)


def common_load_bounding_boxes(
    hue_locations_dir_path: str,
) -> Dict[str, List[PdfBoundingBoxAndHue]]:
    box_data_path = os.path.join(hue_locations_dir_path, "hue_locations.csv")

    if not os.path.exists(box_data_path):
        logging.warning(
            "Could not find any bounding box data in directory %s",
            hue_locations_dir_path,
        )
        return {}

    boxes: Dict[str, List[PdfBoundingBoxAndHue]] = {}
    with open(box_data_path) as box_data_file:
        reader = csv.reader(box_data_file)
        for row in reader:
            pdf_path = row[0]
            hue = float(row[2])
            box = PdfBoundingBox(
                page=int(row[3]),
                left=float(row[4]),
                top=float(row[5]),
                width=float(row[6]),
                height=float(row[7]),
            )
            if not pdf_path in boxes:
                boxes[pdf_path] = []
            boxes[pdf_path].append(PdfBoundingBoxAndHue(hue, box))
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

    @staticmethod
    def get_entity_type() -> str:
        return "citations"

    def load_bounding_boxes(
        self, arxiv_id: ArxivId
    ) -> Dict[str, List[PdfBoundingBoxAndHue]]:
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

    @staticmethod
    def get_entity_type() -> str:
        return "symbols"

    def load_bounding_boxes(
        self, arxiv_id: ArxivId
    ) -> Dict[str, List[PdfBoundingBoxAndHue]]:
        return common_load_bounding_boxes(
            directories.hue_locations_for_equations(arxiv_id)
        )


class AnnotatePdfsWithEquationTokenBoxes(AnnotatePdfsCommand):
    @staticmethod
    def get_name() -> str:
        return "annotate-pdfs-with-equation-token-boxes"

    @staticmethod
    def get_description() -> str:
        return "Annotate PDFs with bounding boxes for equation tokens."

    @staticmethod
    def get_output_base_dir() -> str:
        return directories.ANNOTATED_PDFS_WITH_EQUATION_TOKEN_BOXES_DIR

    @staticmethod
    def get_entity_type() -> str:
        return "symbols"

    def load_bounding_boxes(
        self, arxiv_id: ArxivId
    ) -> Dict[str, List[PdfBoundingBoxAndHue]]:
        return common_load_bounding_boxes(
            directories.hue_locations_for_equation_tokens(arxiv_id)
        )
