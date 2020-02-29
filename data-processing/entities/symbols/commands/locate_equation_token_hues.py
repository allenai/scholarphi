import os
from dataclasses import dataclass
from typing import Dict, List

from common import directories, file_utils
from common.commands.locate_hues import (
    HueSearchRegion,
    LocateHuesCommand,
    MasksForPages,
)
from common.types import (
    ArxivId,
    BoundingBox,
    EquationId,
    EquationTokenColorizationRecord,
)
from common.types import FloatRectangle as Rectangle
from common.types import HueLocationInfo, Path


@dataclass(frozen=True)
class TokenId:
    tex_path: str
    equation_index: int
    token_index: int


BoundingBoxesByFile = Dict[Path, List[BoundingBox]]


class LocateEquationTokenHues(LocateHuesCommand):
    @staticmethod
    def get_name() -> str:
        return "locate-hues-for-equation-tokens"

    @staticmethod
    def get_description() -> str:
        return (
            "Find bounding boxes of token equations using hues. Before running this command,"
            + "bounding boxes must be detected for all equations.'"
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
            equation_boxes_path, HueLocationInfo
        ):
            equation_id = EquationId(
                tex_path=location_info.tex_path,
                equation_index=int(location_info.entity_id),
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
            "entity_hues.csv",
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

    @staticmethod
    def get_diff_images_base_dirkey() -> str:
        return "diff-images-with-colorized-equation-tokens"

    @staticmethod
    def get_output_base_dirkey() -> str:
        return "hue-locations-for-equation-tokens"
