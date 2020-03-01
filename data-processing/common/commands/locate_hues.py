import logging
import os.path
from abc import ABC, abstractmethod
from argparse import ArgumentParser
from dataclasses import dataclass
from typing import Dict, Iterator, List, Optional, Type

import cv2
import numpy as np

from common import directories, file_utils
from common.bounding_box import extract_bounding_boxes
from common.commands.base import ArxivBatchCommand
from common.compile import get_output_files
from common.image_processing import contains_black_pixels
from common.types import ArxivId, BoundingBox, ColorizationRecord
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

        file_utils.append_to_csv(
            output_path,
            HueLocationInfo(
                tex_path=item.search.record.tex_path,
                iteration=item.iteration,
                hue=result.hue,
                entity_id=item.search.record.entity_id,
                page=result.box.page,
                left=result.box.left,
                top=result.box.top,
                width=result.box.width,
                height=result.box.height,
                relative_file_path=item.relative_file_path,
            ),
        )


def make_locate_hues_command(entity_name: str) -> Type[LocateHuesCommand]:
    class C(LocateHuesCommand):
        @staticmethod
        def get_name() -> str:
            return f"locate-hues-for-{entity_name}"

        @staticmethod
        def get_description() -> str:
            return f"Find bounding boxes of {entity_name} by hue."

        def load_hues(self, arxiv_id: ArxivId, iteration: str) -> List[HueSearchRegion]:
            hues_path = os.path.join(
                directories.iteration(
                    f"sources-with-colorized-{entity_name}", arxiv_id, iteration,
                ),
                "entity_hues.csv",
            )
            if not os.path.exists(hues_path):
                logging.warning("Could not find any hues at %s", hues_path)
                return []

            searches = []
            for record in file_utils.load_from_csv(hues_path, ColorizationRecord):
                searches.append(
                    HueSearchRegion(
                        hue=record.hue,
                        record=record,
                        relative_file_path=None,
                        masks=None,
                    )
                )

            return searches

        @staticmethod
        def get_diff_images_base_dirkey() -> str:
            return f"diff-images-with-colorized-{entity_name}"

        @staticmethod
        def get_output_base_dirkey() -> str:
            return f"hue-locations-for-{entity_name}"

    return C
