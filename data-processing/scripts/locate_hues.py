import csv
import logging
import os.path
from abc import ABC, abstractmethod
from argparse import ArgumentParser
from dataclasses import dataclass
from typing import Any, Callable, Dict, Iterator, List, NamedTuple, Optional, cast

import cv2
import numpy as np

from explanations import directories
from explanations.bounding_box import extract_bounding_boxes
from explanations.compile import get_output_files
from explanations.directories import (
    get_data_subdirectory_for_arxiv_id,
    get_data_subdirectory_for_iteration,
    get_iteration_names,
)
from explanations.file_utils import clean_directory
from explanations.image_processing import contains_black_pixels
from explanations.types import ArxivId, BoundingBox, EquationId
from explanations.types import FloatRectangle as Rectangle
from explanations.types import Path, RelativePath
from scripts.command import ArxivBatchCommand

PageNumber = int
Hue = float
MasksForPages = Dict[PageNumber, List[Rectangle]]


@dataclass(frozen=True)
class HueSearchRegion:
    hue: Hue
    region_id: Optional[Any]
    relative_file_path: Optional[RelativePath]
    " Optionally filter which output files are searched for the hue. "
    masks: Optional[MasksForPages]
    " Optionally filter the search for hues to certain places in those PDFs. "


@dataclass(frozen=True)
class SearchTask:
    arxiv_id: ArxivId
    iteration: str
    page_images: Dict[int, np.ndarray]
    relative_file_path: RelativePath
    search: HueSearchRegion


@dataclass(frozen=True)
class HueLocation:
    hue: float
    box: BoundingBox


class LocateHuesCommand(ArxivBatchCommand[SearchTask, HueLocation], ABC):
    """
    Locate hues in paper diffs.
    At the time of writing this comment, this script assumed that each hue will only be used to
    color a single entity, across all PDFs for an arXiv paper.
    """

    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        super(LocateHuesCommand, LocateHuesCommand).init_parser(parser)
        parser.add_argument(
            "--skip-visual-validation",
            action="store_true",
            help=(
                "Whether to skip visual validation. When visual validation is enabled, the "
                + "paper diff will be checked for black pixels before hues are located. Black "
                + "pixels indicate that the layout of the page changed based on changes made to "
                + "the TeX. If visual validation fails for a diff for a paper, that diff will "
                + "not be processed. Set this flag to skip visual validation and therefore "
                + "process all diffs of all papers regardless of evidence of layout shift."
            ),
        )

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

            # Get output file names from results of compiling the uncolorized TeX sources.
            output_files = get_output_files(directories.compilation_results(arxiv_id))

            for iteration in get_iteration_names(
                self.get_diff_images_base_dir(), arxiv_id
            ):

                diff_images_dir = get_data_subdirectory_for_iteration(
                    self.get_diff_images_base_dir(), arxiv_id, iteration
                )

                hue_searches = self.load_hues(arxiv_id, iteration)
                hue_searches_by_file: Dict[Path, List[HueSearchRegion]] = {}
                for search in hue_searches:
                    output_paths = [f.path for f in output_files]
                    files_to_search = (
                        [search.relative_file_path]
                        if search.relative_file_path is not None
                        else output_paths
                    )
                    for path in files_to_search:
                        if path not in hue_searches_by_file:
                            hue_searches_by_file[path] = []
                        hue_searches_by_file[path].append(search)

                for relative_file_path, search_regions in hue_searches_by_file.items():

                    diff_images_file_path = os.path.join(
                        diff_images_dir, relative_file_path
                    )
                    page_images = {}

                    colorization_error_detected = False
                    for img_name in os.listdir(diff_images_file_path):
                        img_path = os.path.join(diff_images_file_path, img_name)
                        page_image = cv2.imread(img_path)

                        if not self.args.skip_visual_validation:
                            if contains_black_pixels(page_image):
                                logging.warning(
                                    "Black pixels found in image diff %s", img_path
                                )
                                colorization_error_detected = True

                        page_number = (
                            int(os.path.splitext(img_name)[0].replace("page-", "")) - 1
                        )
                        page_images[page_number] = page_image

                    if colorization_error_detected:
                        logging.warning(  # pylint: disable=logging-not-lazy
                            "Colorization error detected. Skipping hue location for "
                            + "iteration %s for arXiv paper %s",
                            iteration,
                            arxiv_id,
                        )
                        break

                    for search_region in search_regions:
                        yield SearchTask(
                            arxiv_id,
                            iteration,
                            page_images,
                            relative_file_path,
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
            boxes = extract_bounding_boxes(image, page_number, item.search.hue, masks,)
            for box in boxes:
                yield HueLocation(item.search.hue, box)

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
            row_data = [item.relative_file_path, item.iteration, result.hue]
            logging.debug(
                "Found bounding box for %s, iteration %s, hue %f",
                item.relative_file_path,
                item.iteration,
                result.hue,
            )
            row_data.extend(
                [
                    result.box.page,
                    result.box.left,
                    result.box.top,
                    result.box.width,
                    result.box.height,
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
    with open(hues_path, encoding="utf-8") as hues_file:
        reader = csv.reader(hues_file)
        for row in reader:
            hues.append(
                HueSearchRegion(
                    hue=float(row[column_index]),
                    region_id=None
                    if extract_region_id is None
                    else extract_region_id(row),
                    relative_file_path=None,
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

    @staticmethod
    def get_entity_type() -> str:
        return "citations"

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

    @staticmethod
    def get_entity_type() -> str:
        return "symbols"

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


BoundingBoxesByFile = Dict[Path, List[BoundingBox]]


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

    @staticmethod
    def get_entity_type() -> str:
        return "symbols"

    def load_hues(self, arxiv_id: ArxivId, iteration: str) -> List[HueSearchRegion]:

        equation_boxes_path = os.path.join(
            directories.hue_locations_for_equations(arxiv_id), "hue_locations.csv"
        )
        bounding_boxes: Dict[EquationId, BoundingBoxesByFile] = {}
        with open(equation_boxes_path) as hue_boxes_file:
            reader = csv.reader(hue_boxes_file)
            for row in reader:
                equation_id = EquationId(row[-2], int(row[-1]))
                if equation_id not in bounding_boxes:
                    bounding_boxes[equation_id] = {}

                file_path = row[0]
                if file_path not in bounding_boxes[equation_id]:
                    bounding_boxes[equation_id][file_path] = []

                box = BoundingBox(
                    page=int(row[3]),
                    left=float(row[8]),
                    top=float(row[9]),
                    width=float(row[10]),
                    height=float(row[11]),
                )
                bounding_boxes[equation_id][file_path].append(box)

        token_hues_by_equation: Dict[EquationId, Dict[int, Hue]] = {}
        token_hues_path = os.path.join(
            get_data_subdirectory_for_iteration(
                directories.SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR,
                arxiv_id,
                iteration,
            ),
            "token_hues.csv",
        )
        with open(token_hues_path, encoding="utf-8") as token_hues_file:
            reader = csv.reader(token_hues_file)
            for row in reader:
                equation_id = EquationId(tex_path=row[0], equation_index=int(row[1]))
                token_index = int(row[2])
                hue = float(row[3])
                if equation_id not in token_hues_by_equation:
                    token_hues_by_equation[equation_id] = {}
                token_hues_by_equation[equation_id][token_index] = hue

        hue_searches = []
        for equation_id, boxes_by_file in bounding_boxes.items():
            for file_path, boxes in boxes_by_file.items():
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
                                relative_file_path=file_path,
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
