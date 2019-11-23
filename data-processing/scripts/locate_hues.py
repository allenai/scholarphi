import csv
import logging
import os.path
from abc import ABC, abstractmethod
from typing import (Any, Callable, Dict, Iterator, List, NamedTuple, Optional,
                    cast)

import cv2
import numpy as np
from PyPDF2 import PdfFileReader

from explanations import directories
from explanations.bounding_box import extract_bounding_boxes
from explanations.compile import get_compiled_pdfs
from explanations.directories import (get_data_subdirectory_for_arxiv_id,
                                      get_data_subdirectory_for_iteration,
                                      get_iteration_names)
from explanations.file_utils import clean_directory
from explanations.types import (ArxivId, BoundingBoxInfo, Dimensions,
                                EquationId, Path, RasterBoundingBox, Rectangle,
                                RelativePath)
from scripts.command import ArxivBatchCommand

PageNumber = int
PdfPath = Path
Hue = float
MasksForPages = Dict[PageNumber, List[Rectangle]]


class HueSearchRegion(NamedTuple):
    hue: Hue
    region_id: Optional[Any]
    """
    Optionally filter which PDFs are searched for the hue.
    """
    relative_pdf_path: Optional[RelativePath]
    """
    Optionally filter the search for hues to certain places in those PDFs.
    """
    masks: Optional[MasksForPages]


class SearchTask(NamedTuple):
    arxiv_id: ArxivId
    iteration: str
    page_images: Dict[int, np.ndarray]
    pdf_page_dimensions: Dict[int, Dimensions]
    relative_pdf_path: RelativePath
    search: HueSearchRegion


class HueLocation(NamedTuple):
    hue: float
    box_info: BoundingBoxInfo


class LocateHuesCommand(ArxivBatchCommand[SearchTask, HueLocation], ABC):
    """
    Locate hues in paper diffs.
    At the time of writing this comment, this script assumed that each hue will only be used to
    color a single entity, across all PDFs for an arXiv paper.
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
    def load_hues(self, arxiv_id: ArxivId, iteration: str) -> List[HueSearchRegion]:
        """
        Load a list of hues for which you need bounding box locations.
        """

    def get_arxiv_ids_dir(self) -> Path:
        return self.get_diff_images_base_dir()

    def load(self) -> Iterator[SearchTask]:
        for arxiv_id in self.arxiv_ids:
            output_dir = get_data_subdirectory_for_arxiv_id(
                self.get_output_base_dir(), arxiv_id
            )
            clean_directory(output_dir)

            # Get PDF names from results of compiling the uncolorized TeX sources.
            compiled_pdf_paths = get_compiled_pdfs(
                directories.compilation_results(arxiv_id)
            )

            for iteration in get_iteration_names(
                self.get_diff_images_base_dir(), arxiv_id
            ):

                diff_images_dir = get_data_subdirectory_for_iteration(
                    self.get_diff_images_base_dir(), arxiv_id, iteration
                )

                hue_searches = self.load_hues(arxiv_id, iteration)
                hue_searches_by_pdf: Dict[PdfPath, List[HueSearchRegion]] = {}
                for search in hue_searches:
                    pdfs_to_search = (
                        [search.relative_pdf_path]
                        if search.relative_pdf_path is not None
                        else compiled_pdf_paths
                    )
                    for pdf_path in pdfs_to_search:
                        if pdf_path not in hue_searches_by_pdf:
                            hue_searches_by_pdf[pdf_path] = []
                        hue_searches_by_pdf[pdf_path].append(search)

                for relative_pdf_path, search_regions in hue_searches_by_pdf.items():

                    # PDF reads with PyPDF2 are costly, so do them all at once.
                    pdf_page_dimensions: Dict[int, Dimensions] = {}
                    absolute_pdf_path = os.path.join(directories.compilation_results(arxiv_id), relative_pdf_path)
                    with open(absolute_pdf_path, "rb") as pdf_file:
                        pdf = PdfFileReader(pdf_file)
                        for page_number in range(pdf.getNumPages()):
                            page = pdf.getPage(page_number)
                            width = page.mediaBox.getWidth()
                            height = page.mediaBox.getHeight()
                            pdf_page_dimensions[page_number] = Dimensions(width, height)

                    diff_images_pdf_path = os.path.join(
                        diff_images_dir, relative_pdf_path
                    )
                    page_images = {}

                    for img_name in os.listdir(diff_images_pdf_path):
                        img_path = os.path.join(diff_images_pdf_path, img_name)
                        page_image = cv2.imread(img_path)
                        page_number = int(
                            os.path.splitext(img_name)[0].replace("page-", "")
                        )
                        page_images[page_number] = page_image

                    for search_region in search_regions:
                        yield SearchTask(
                            arxiv_id,
                            iteration,
                            page_images,
                            pdf_page_dimensions,
                            relative_pdf_path,
                            search_region,
                        )

    def process(self, item: SearchTask) -> Iterator[HueLocation]:
        for page_number, image in item.page_images.items():
            masks = None
            if item.search.masks:
                if page_number in item.search.masks:
                    masks = item.search.masks[page_number]
                else:
                    masks = []
            box_infos = extract_bounding_boxes(
                image, item.pdf_page_dimensions[page_number], page_number, item.search.hue, masks
            )
            for box_info in box_infos:
                yield HueLocation(item.search.hue, box_info)

    def format_region_id(
        self, region_id: Optional[Any]  # pylint: disable=unused-argument
    ) -> List[str]:
        """
        Convert a region ID into data to be included in CSV. Each element gets stored in a separate
        column. By default no data is generated. Optionally override this behavior in a child class.
        """
        return []

    def save(self, item: SearchTask, result: HueLocation) -> None:
        output_dir = get_data_subdirectory_for_arxiv_id(
            self.get_output_base_dir(), item.arxiv_id
        )
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        output_path = os.path.join(output_dir, "hue_locations.csv")
        with open(output_path, "a") as output_file:
            writer = csv.writer(output_file, quoting=csv.QUOTE_ALL)
            row_data = [item.relative_pdf_path, item.iteration, result.hue]
            logging.debug(
                "Found bounding box for %s, iteration %s, hue %f",
                item.relative_pdf_path,
                item.iteration,
                result.hue,
            )
            row_data.extend(
                [
                    result.box_info.pdf_box.page,
                    result.box_info.pdf_box.left,
                    result.box_info.pdf_box.top,
                    result.box_info.pdf_box.width,
                    result.box_info.pdf_box.height,
                    result.box_info.raster_box.left,
                    result.box_info.raster_box.top,
                    result.box_info.raster_box.width,
                    result.box_info.raster_box.height,
                ]
            )
            row_data.extend(self.format_region_id(item.search.region_id))
            writer.writerow(row_data)


def common_read_hues(
    hues_path: str,
    column_index: int,
    extract_region_id: Optional[Callable[[List[str]], Any]] = None,
) -> List[HueSearchRegion]:
    if not os.path.exists(hues_path):
        logging.warning("Could not find any hues at %s", hues_path)
        return []

    hues = []
    with open(hues_path) as hues_file:
        reader = csv.reader(hues_file)
        for row in reader:
            hues.append(
                HueSearchRegion(
                    hue=float(row[column_index]),
                    region_id=None
                    if extract_region_id is None
                    else extract_region_id(row),
                    relative_pdf_path=None,
                    masks=None,
                )
            )
    return hues


class LocateCitationHues(LocateHuesCommand):
    @staticmethod
    def get_name() -> str:
        return "locate-citation-hues"

    @staticmethod
    def get_description() -> str:
        return "Find bounding boxes of citations by hue."

    def load_hues(self, arxiv_id: ArxivId, iteration: str) -> List[HueSearchRegion]:
        return common_read_hues(
            hues_path=os.path.join(
                get_data_subdirectory_for_iteration(
                    directories.SOURCES_WITH_COLORIZED_CITATIONS_DIR,
                    arxiv_id,
                    iteration,
                ),
                "citation_hues.csv",
            ),
            column_index=2,
        )

    @staticmethod
    def get_diff_images_base_dir() -> str:
        return directories.DIFF_IMAGES_WITH_COLORIZED_CITATIONS_DIR

    @staticmethod
    def get_output_base_dir() -> str:
        return directories.HUE_LOCATIONS_FOR_CITATIONS_DIR


class LocateEquationHues(LocateHuesCommand):
    @staticmethod
    def get_name() -> str:
        return "locate-equation-hues"

    @staticmethod
    def get_description() -> str:
        return "Find bounding boxes of equations by hue."

    def load_hues(self, arxiv_id: ArxivId, iteration: str) -> List[HueSearchRegion]:
        return common_read_hues(
            hues_path=os.path.join(
                get_data_subdirectory_for_iteration(
                    directories.SOURCES_WITH_COLORIZED_EQUATIONS_DIR,
                    arxiv_id,
                    iteration,
                ),
                "equation_hues.csv",
            ),
            column_index=3,
            extract_region_id=lambda row: [row[0], row[1]],
        )

    @staticmethod
    def get_diff_images_base_dir() -> str:
        return directories.DIFF_IMAGES_WITH_COLORIZED_EQUATIONS_DIR

    @staticmethod
    def get_output_base_dir() -> str:
        return directories.HUE_LOCATIONS_FOR_EQUATIONS_DIR

    def format_region_id(self, region_id: Optional[Any]) -> List[str]:
        return cast(List[str], region_id)


class TokenId(NamedTuple):
    tex_path: str
    equation_index: int
    token_index: int


BoundingBoxesByPdf = Dict[PdfPath, List[RasterBoundingBox]]


class LocateEquationTokenHues(LocateHuesCommand):
    @staticmethod
    def get_name() -> str:
        return "locate-equation-token-hues"

    @staticmethod
    def get_description() -> str:
        return (
            "Find bounding boxes of token equations using hues. Before running this command,"
            + "bounding boxes must be found for equations using '"
            + LocateEquationHues.get_name()
            + "'"
        )

    def load_hues(self, arxiv_id: ArxivId, iteration: str) -> List[HueSearchRegion]:

        equation_boxes_path = os.path.join(
            directories.hue_locations_for_equations(arxiv_id), "hue_locations.csv"
        )
        bounding_boxes: Dict[EquationId, BoundingBoxesByPdf] = {}
        with open(equation_boxes_path) as hue_boxes_file:
            reader = csv.reader(hue_boxes_file)
            for row in reader:
                equation_id = EquationId(row[-2], int(row[-1]))
                if equation_id not in bounding_boxes:
                    bounding_boxes[equation_id] = {}

                pdf_path = row[0]
                if pdf_path not in bounding_boxes[equation_id]:
                    bounding_boxes[equation_id][pdf_path] = []

                box = RasterBoundingBox(
                    page=int(row[3]),
                    left=int(row[8]),
                    top=int(row[9]),
                    width=int(row[10]),
                    height=int(row[11]),
                )
                bounding_boxes[equation_id][pdf_path].append(box)

        token_hues_by_equation: Dict[EquationId, Dict[int, Hue]] = {}
        token_hues_path = os.path.join(
            get_data_subdirectory_for_iteration(
                directories.SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR,
                arxiv_id,
                iteration,
            ),
            "token_hues.csv",
        )
        with open(token_hues_path) as token_hues_file:
            reader = csv.reader(token_hues_file)
            for row in reader:
                equation_id = EquationId(tex_path=row[0], equation_index=int(row[1]))
                token_index = int(row[2])
                hue = float(row[3])
                if equation_id not in token_hues_by_equation:
                    token_hues_by_equation[equation_id] = {}
                token_hues_by_equation[equation_id][token_index] = hue

        hue_searches = []
        for equation_id, boxes_by_pdf in bounding_boxes.items():
            for pdf_path, boxes in boxes_by_pdf.items():
                masks_by_page: MasksForPages = {}
                for box in boxes:
                    if box.page not in masks_by_page:
                        masks_by_page[box.page] = []
                    masks_by_page[box.page].append(
                        Rectangle(box.left, box.top, box.width, box.height)
                    )

                if equation_id in token_hues_by_equation:
                    for token_index, hue in token_hues_by_equation[equation_id].items():
                        region_id = TokenId(
                            equation_id.tex_path,
                            equation_id.equation_index,
                            token_index,
                        )
                        hue_searches.append(
                            HueSearchRegion(
                                hue=hue,
                                region_id=region_id,
                                relative_pdf_path=pdf_path,
                                masks=masks_by_page,
                            )
                        )

        return hue_searches

    def format_region_id(
        self, region_id: Optional[Any]  # pylint: disable=unused-argument
    ) -> List[str]:
        region_id = cast(TokenId, region_id)
        return [
            region_id.tex_path,
            str(region_id.equation_index),
            str(region_id.token_index),
        ]

    @staticmethod
    def get_diff_images_base_dir() -> str:
        return directories.DIFF_IMAGES_WITH_COLORIZED_EQUATION_TOKENS_DIR

    @staticmethod
    def get_output_base_dir() -> str:
        return directories.HUE_LOCATIONS_FOR_EQUATION_TOKENS_DIR
