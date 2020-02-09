import csv
import logging
import os.path
from dataclasses import dataclass
from typing import Dict, Iterator, List, Set

from explanations import directories
from explanations.bounding_box import cluster_boxes
from explanations.directories import (
    get_data_subdirectory_for_iteration,
    get_iteration_names,
)
from explanations.file_utils import clean_directory, load_citation_hue_locations
from explanations.types import (
    ArxivId,
    CitationLocation,
    HueIteration,
    Path,
    PdfBoundingBox,
)
from scripts.command import ArxivBatchCommand


@dataclass(frozen=True)
class LocationTask:
    arxiv_id: ArxivId
    boxes: List[PdfBoundingBox]
    citation_key: str


class LocateCitations(ArxivBatchCommand[LocationTask, CitationLocation]):
    @staticmethod
    def get_name() -> str:
        return "locate-citations"

    @staticmethod
    def get_description() -> str:
        return "Find locations of citations. Requires 'locate-citation-hues' to have been run."

    @staticmethod
    def get_entity_type() -> str:
        return "citations"

    def get_arxiv_ids_dir(self) -> Path:
        return directories.HUE_LOCATIONS_FOR_CITATIONS_DIR

    def load(self) -> Iterator[LocationTask]:

        for arxiv_id in self.arxiv_ids:

            output_dir = directories.citation_locations(arxiv_id)
            clean_directory(output_dir)

            boxes_by_hue_iteration = load_citation_hue_locations(arxiv_id)
            if boxes_by_hue_iteration is None:
                continue

            boxes_by_citation_key: Dict[str, List[PdfBoundingBox]] = {}
            for iteration in get_iteration_names(
                directories.SOURCES_WITH_COLORIZED_CITATIONS_DIR, arxiv_id
            ):
                citation_hues_path = os.path.join(
                    get_data_subdirectory_for_iteration(
                        directories.SOURCES_WITH_COLORIZED_CITATIONS_DIR,
                        arxiv_id,
                        iteration,
                    ),
                    "citation_hues.csv",
                )
                if not os.path.exists(citation_hues_path):
                    logging.warning(
                        "Could not find citation hue colors for %s iteration %s. Skipping",
                        arxiv_id,
                        iteration,
                    )
                    continue
                with open(citation_hues_path) as citation_hues_file:
                    reader = csv.reader(citation_hues_file)
                    for row in reader:
                        key = str(row[3])
                        hue = float(row[2])
                        if key not in boxes_by_citation_key:
                            boxes_by_citation_key[key] = []
                        hue_iteration = HueIteration(hue, iteration)
                        boxes_by_citation_key[key].extend(
                            boxes_by_hue_iteration.get(hue_iteration, [])
                        )

            for key, boxes in boxes_by_citation_key.items():
                yield LocationTask(
                    arxiv_id=arxiv_id, citation_key=key, boxes=boxes,
                )

    def process(self, item: LocationTask) -> Iterator[CitationLocation]:
        for i, cluster in enumerate(cluster_boxes(item.boxes)):
            yield CitationLocation(i, cluster)

    def save(self, item: LocationTask, result: CitationLocation) -> None:
        output_dir = directories.citation_locations(item.arxiv_id)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        locations_path = os.path.join(output_dir, "citation_locations.csv")
        with open(locations_path, "a", encoding="utf-8") as locations_file:
            writer = csv.writer(locations_file, quoting=csv.QUOTE_ALL)
            for box in result.boxes:
                writer.writerow(
                    [
                        item.citation_key,
                        result.location_index,
                        box.page,
                        box.left,
                        box.top,
                        box.width,
                        box.height,
                    ]
                )
