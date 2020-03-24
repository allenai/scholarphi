import logging
import os.path
from dataclasses import dataclass
from typing import Dict, FrozenSet, Iterator, List, Tuple

from common import directories, file_utils
from common.bounding_box import compute_accuracy, iou, iou_per_rectangle, sum_areas
from common.commands.database import DatabaseReadCommand
from common.models import Annotation, Paper
from common.types import ArxivId, BoundingBox, FloatRectangle

CitationKey = str
CitationKeys = Tuple[CitationKey]
S2Id = str


@dataclass(frozen=True)
class EntityKeyPair:
    pipeline_key: str
    " Name of entity in the pipeline output data directory. "

    database_key: str
    " Name of entity in the database models. "


@dataclass(frozen=True)
class IouJob:
    arxiv_id: ArxivId
    actual: List[FrozenSet[FloatRectangle]]
    expected: List[FloatRectangle]
    page: int
    entity_type: str


@dataclass(frozen=True)
class IouResults:
    page_iou: float
    precision: float
    recall: float
    rectangle_ious: Dict[FrozenSet[FloatRectangle], float]


@dataclass(frozen=True)
class IouAccuracySummary:
    arxiv_id: str
    entity_type: str
    page: int
    page_iou: float
    precision: float
    recall: float
    num_actual: int
    num_expected: int


@dataclass(frozen=True)
class EntityMatchInfo:
    arxiv_id: str
    entity_type: str
    page: int
    i: int
    rect_set: str
    sum_areas: float
    rectangle_ious: str


PageNumber = int
EntityType = str


class ComputeIou(DatabaseReadCommand[IouJob, IouResults]):
    @staticmethod
    def get_name() -> str:
        return "compute-iou"

    @staticmethod
    def get_description() -> str:
        return (
            "Compute intersection-over-union for bounding boxes extracted from papers."
        )

    def get_arxiv_ids_dirkey(self) -> str:
        return "sources"

    def load(self) -> Iterator[IouJob]:
        for arxiv_id in self.arxiv_ids:

            output_root = directories.arxiv_subdir("bounding-box-accuracies", arxiv_id)
            file_utils.clean_directory(output_root)

            actual: Dict[
                Tuple[PageNumber, EntityType], List[FrozenSet[FloatRectangle]]
            ] = {}

            entity_types = [
                EntityKeyPair("citations", "citation"),
                EntityKeyPair("equations", "equation"),
                EntityKeyPair("equation-tokens", "symbol"),
            ]
            for type_ in entity_types:
                entity_locations = file_utils.load_hue_locations(
                    arxiv_id, type_.pipeline_key
                )
                if entity_locations is None:
                    continue
                for bounding_boxes in entity_locations.values():
                    # Entities may cross pages. For instance, citations may be detected on multiple
                    # pages, as we give all instances of a citation for the same reference the same
                    # color. Here, we group entity bounding boxes by page so that we know what
                    # truth bounding boxes to compare them to.
                    by_page: Dict[PageNumber, List[BoundingBox]] = {}
                    for box in bounding_boxes:
                        if not box.page in by_page:
                            by_page[box.page] = []
                        by_page[box.page].append(box)

                    for page, page_boxes in by_page.items():
                        key = (page, type_.database_key)
                        if key not in actual:
                            actual[key] = []
                        rectangles = frozenset(
                            [
                                FloatRectangle(b.left, b.top, b.width, b.height)
                                for b in page_boxes
                            ]
                        )
                        # XXX(andrewhead): we may want to unpack citations; a citation may appear
                        # multiple times on the same page, and we're currently grouping all of those
                        # appearances of the citation together as 'one citation'.
                        actual[key].append(rectangles)

            annotation_models = (
                Annotation.select().join(Paper).where(Paper.arxiv_id == arxiv_id)
            )
            expected: Dict[Tuple[PageNumber, EntityType], List[FloatRectangle]] = {}
            for annotation in annotation_models:
                key = (annotation.page, annotation.type)
                if key not in expected:
                    expected[key] = []
                expected[key].append(
                    FloatRectangle(
                        annotation.left,
                        annotation.top,
                        annotation.width,
                        annotation.height,
                    )
                )

            for key in expected:
                page_number, entity_type = key
                if key not in actual:
                    logging.warning(
                        "No bounding boxes found on page %d of paper %s with type %s. Won't be able to compute accuracy for this page.",
                        page_number,
                        arxiv_id,
                        entity_type,
                    )
                    continue
                yield IouJob(
                    arxiv_id, actual[key], expected[key], page_number, entity_type
                )

    def process(self, job: IouJob) -> Iterator[IouResults]:
        all_actual_rects = [r for rect_set in job.actual for r in rect_set]
        page_iou = iou(all_actual_rects, job.expected)
        precision, recall = compute_accuracy(job.actual, job.expected, minimum_iou=0.35)
        rectangle_ious = iou_per_rectangle(job.actual, job.expected)
        logging.debug(
            "Computed accuracy for paper %s page %d entity type %s: Precision: %f, Recall: %f, Page IOU: %f",
            job.arxiv_id,
            job.page,
            job.entity_type,
            precision,
            recall,
            page_iou,
        )
        yield IouResults(page_iou, precision, recall, rectangle_ious)

    def save(self, item: IouJob, result: IouResults) -> None:

        arxiv_id = item.arxiv_id

        bounding_box_accuracies_path = directories.arxiv_subdir(
            "bounding-box-accuracies", arxiv_id
        )
        if not os.path.exists(bounding_box_accuracies_path):
            os.makedirs(bounding_box_accuracies_path)

        page_iou_path = os.path.join(bounding_box_accuracies_path, "page_accuracy.csv")
        file_utils.append_to_csv(
            page_iou_path,
            IouAccuracySummary(
                arxiv_id=item.arxiv_id,
                entity_type=item.entity_type,
                page=item.page,
                page_iou=result.page_iou,
                precision=result.precision,
                recall=result.recall,
                num_actual=len(item.actual),
                num_expected=len(item.expected),
            ),
        )

        entity_iou_path = os.path.join(bounding_box_accuracies_path, "entity_ious.csv")
        for i, rect_set in enumerate(item.actual):
            file_utils.append_to_csv(
                entity_iou_path,
                EntityMatchInfo(
                    arxiv_id=item.arxiv_id,
                    entity_type=item.entity_type,
                    page=item.page,
                    i=i,
                    rect_set=str(rect_set),
                    sum_areas=sum_areas(rect_set),
                    rectangle_ious=str(result.rectangle_ious[rect_set]),
                ),
            )
