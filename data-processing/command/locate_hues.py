import logging
import os.path
from abc import ABC, abstractmethod
from argparse import ArgumentParser
from dataclasses import dataclass
from typing import Dict, Iterator, List, NamedTuple, Optional, cast

import cv2
import numpy as np

from command.command import ArxivBatchCommand
from common import directories, file_utils
from common.bounding_box import extract_bounding_boxes
from common.compile import get_output_files
from common.image_processing import contains_black_pixels
from common.types import (
    ArxivId,
    BoundingBox,
    ColorizationRecord,
    EquationColorizationRecord,
    EquationHueLocationInfo,
    EquationId,
    EquationTokenColorizationRecord,
    EquationTokenHueLocationInfo,
)
from common.types import FloatRectangle as Rectangle
from common.types import HueLocationInfo, Path, RelativePath

PageNumber = int
Hue = float
MasksForPages = Dict[PageNumber, List[Rectangle]]


@dataclass(frozen=True)
class HueSearchRegion:
    hue: Hue
    record: ColorizationRecord
    " Record of entity that was colorized, for accessing entity information. "
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
    def get_diff_images_base_dirkey() -> str:
        """
        Key for the data directory containing diffs of colorized pages with uncolorized pages for all papers.
        """

    @staticmethod
    @abstractmethod
    def get_output_base_dirkey() -> str:
        """
        Key for the data directory where hue bounding boxes should be output.
        """

    @abstractmethod
    def load_hues(self, arxiv_id: ArxivId, iteration: str) -> List[HueSearchRegion]:
        """
        Load a list of hues for which you need bounding box locations.
        """

    def get_arxiv_ids_dirkey(self) -> str:
        return self.get_diff_images_base_dirkey()

    def load(self) -> Iterator[SearchTask]:
        for arxiv_id in self.arxiv_ids:
            output_dir = directories.arxiv_subdir(
                self.get_output_base_dirkey(), arxiv_id
            )
            file_utils.clean_directory(output_dir)

            # Get output file names from results of compiling the uncolorized TeX sources.
            output_files = get_output_files(
                directories.arxiv_subdir("compiled-sources", arxiv_id)
            )

            for iteration in directories.iteration_names(
                self.get_diff_images_base_dirkey(), arxiv_id
            ):

                diff_images_dir = directories.iteration(
                    self.get_diff_images_base_dirkey(), arxiv_id, iteration
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

    def get_hue_location_info(
        self, item: SearchTask, result: HueLocation
    ) -> HueLocationInfo:
        """
        Create a object that can be logged, with the results of searching for a hue.
        Override this method in your command if you want to log unique data for a
        your specific type of entity.
        """
        return HueLocationInfo(
            relative_file_path=item.relative_file_path,
            iteration=item.iteration,
            hue=result.hue,
            page=result.box.page,
            left=result.box.left,
            top=result.box.top,
            width=result.box.width,
            height=result.box.height,
        )

    def save(self, item: SearchTask, result: HueLocation) -> None:

        logging.debug(
            "Found bounding box for %s, iteration %s, hue %f",
            item.relative_file_path,
            item.iteration,
            result.hue,
        )

        output_dir = directories.arxiv_subdir(
            self.get_output_base_dirkey(), item.arxiv_id
        )
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        output_path = os.path.join(output_dir, "hue_locations.csv")

        hue_location_info = self.get_hue_location_info(item, result)
        file_utils.append_to_csv(output_path, hue_location_info)


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
        hues_path = os.path.join(
            directories.iteration(
                "sources-with-colorized-citations", arxiv_id, iteration,
            ),
            "citation_hues.csv",
        )
        if not os.path.exists(hues_path):
            logging.warning("Could not find any hues at %s", hues_path)
            return []

        searches = []
        for record in file_utils.load_from_csv(hues_path, ColorizationRecord):
            searches.append(
                HueSearchRegion(
                    hue=record.hue, record=record, relative_file_path=None, masks=None
                )
            )

        return searches

    @staticmethod
    def get_diff_images_base_dirkey() -> str:
        return "diff-images-with-colorized-citations"

    @staticmethod
    def get_output_base_dirkey() -> str:
        return "hue-locations-for-citations"


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
        hues_path = os.path.join(
            directories.iteration(
                "sources-with-colorized-equations", arxiv_id, iteration,
            ),
            "equation_hues.csv",
        )
        if not os.path.exists(hues_path):
            logging.warning("Could not find any hues at %s", hues_path)
            return []

        searches = []
        for record in file_utils.load_from_csv(hues_path, EquationColorizationRecord):
            searches.append(
                HueSearchRegion(
                    hue=record.hue, record=record, relative_file_path=None, masks=None,
                )
            )

        return searches

    def get_hue_location_info(
        self, item: SearchTask, result: HueLocation
    ) -> EquationHueLocationInfo:
        """
        Create a object that can be logged, with the results of searching for a hue.
        Override this method in your command if you want to log unique data for a
        your specific type of entity.
        """
        equation_record = cast(EquationColorizationRecord, item.search.record)
        return EquationHueLocationInfo(
            relative_file_path=item.relative_file_path,
            iteration=item.iteration,
            hue=result.hue,
            page=result.box.page,
            left=result.box.left,
            top=result.box.top,
            width=result.box.width,
            height=result.box.height,
            tex_path=equation_record.tex_path,
            equation_index=equation_record.i,
        )

    @staticmethod
    def get_diff_images_base_dirkey() -> str:
        return "diff-images-with-colorized-equations"

    @staticmethod
    def get_output_base_dirkey() -> str:
        return "hue-locations-for-equations"


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
            directories.arxiv_subdir("hue-locations-for-equations", arxiv_id),
            "hue_locations.csv",
        )
        bounding_boxes: Dict[EquationId, BoundingBoxesByFile] = {}

        for location_info in file_utils.load_from_csv(
            equation_boxes_path, EquationHueLocationInfo
        ):
            equation_id = EquationId(
                tex_path=location_info.tex_path,
                equation_index=location_info.equation_index,
            )
            if equation_id not in bounding_boxes:
                bounding_boxes[equation_id] = {}

            file_path = location_info.relative_file_path
            if file_path not in bounding_boxes[equation_id]:
                bounding_boxes[equation_id][file_path] = []

            box = BoundingBox(
                page=location_info.page,
                left=location_info.left,
                top=location_info.top,
                width=location_info.width,
                height=location_info.height,
            )
            bounding_boxes[equation_id][file_path].append(box)

        token_records_by_equation: Dict[
            EquationId, Dict[int, EquationTokenColorizationRecord]
        ] = {}
        token_hues_path = os.path.join(
            directories.iteration(
                "sources-with-colorized-equation-tokens", arxiv_id, iteration,
            ),
            "token_hues.csv",
        )
        for record in file_utils.load_from_csv(
            token_hues_path, EquationTokenColorizationRecord
        ):
            equation_id = EquationId(
                tex_path=record.tex_path, equation_index=record.equation_index
            )
            token_index = int(record.token_index)

            if equation_id not in token_records_by_equation:
                token_records_by_equation[equation_id] = {}
            token_records_by_equation[equation_id][token_index] = record

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

                if equation_id in token_records_by_equation:
                    for token_index, record in token_records_by_equation[
                        equation_id
                    ].items():
                        hue_searches.append(
                            HueSearchRegion(
                                hue=record.hue,
                                record=record,
                                relative_file_path=file_path,
                                masks=masks_by_page,
                            )
                        )

        return hue_searches

    def get_hue_location_info(
        self, item: SearchTask, result: HueLocation
    ) -> EquationTokenHueLocationInfo:
        """
        Create a object that can be logged, with the results of searching for a hue.
        Override this method in your command if you want to log unique data for a
        your specific type of entity.
        """
        token_record = cast(EquationTokenColorizationRecord, item.search.record)
        return EquationTokenHueLocationInfo(
            relative_file_path=item.relative_file_path,
            iteration=item.iteration,
            hue=result.hue,
            page=result.box.page,
            left=result.box.left,
            top=result.box.top,
            width=result.box.width,
            height=result.box.height,
            tex_path=token_record.tex_path,
            equation_index=token_record.equation_index,
            character_index=token_record.token_index,
        )

    @staticmethod
    def get_diff_images_base_dirkey() -> str:
        return "diff-images-with-colorized-equation-tokens"

    @staticmethod
    def get_output_base_dirkey() -> str:
        return "hue-locations-for-equation-tokens"
