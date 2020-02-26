import csv
import logging
import os.path
from dataclasses import dataclass
from typing import Dict, Iterator, List

from command.command import ArxivBatchCommand
from common import directories
from common.bounding_box import cluster_boxes
from common.file_utils import clean_directory, load_citation_hue_locations
from common.types import ArxivId, BoundingBox, CitationLocation, HueIteration


@dataclass(frozen=True)
class LocationTask:
    arxiv_id: ArxivId
    boxes: List[BoundingBox]
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

    def get_arxiv_ids_dirkey(self) -> str:
        return "hue-locations-for-citations"

    def load(self) -> Iterator[LocationTask]:

        for arxiv_id in self.arxiv_ids:

            output_dir = directories.arxiv_subdir("citation-locations", arxiv_id)
            clean_directory(output_dir)

            boxes_by_hue_iteration = load_citation_hue_locations(arxiv_id)
            if boxes_by_hue_iteration is None:
                continue

            boxes_by_citation_key: Dict[str, List[BoundingBox]] = {}
            for iteration in directories.iteration_names(
                "sources-with-colorized-citations", arxiv_id
            ):
                citation_hues_path = os.path.join(
                    directories.iteration(
                        "sources-with-colorized-citations", arxiv_id, iteration,
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
            logging.debug(
                "Found cluster of %d box(es) for citations of key %s for paper %s",
                len(cluster),
                item.citation_key,
                item.arxiv_id,
            )
            yield CitationLocation(i, cluster)

    def save(self, item: LocationTask, result: CitationLocation) -> None:
        output_dir = directories.arxiv_subdir("citation-locations", item.arxiv_id)
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
