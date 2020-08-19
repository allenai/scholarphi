import logging
import os.path
from dataclasses import dataclass
from typing import Dict, Iterator, List

from common import directories, file_utils
from common.bounding_box import cluster_boxes
from common.commands.base import ArxivBatchCommand
from common.types import (
    ArxivId,
    BoundingBox,
    CitationLocation,
    ColorizationRecord,
    HueIteration,
)


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

    def get_arxiv_ids_dirkey(self) -> str:
        return "citations-locations"

    def load(self) -> Iterator[LocationTask]:

        for arxiv_id in self.arxiv_ids:

            output_dir = directories.arxiv_subdir("citation-cluster-locations", arxiv_id)
            file_utils.clean_directory(output_dir)

            boxes_by_hue_iteration = file_utils.load_citation_hue_locations(arxiv_id)
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
                    "entity_hues.csv",
                )
                if not os.path.exists(citation_hues_path):
                    logging.warning(
                        "Could not find citation hue colors for %s iteration %s. Skipping",
                        arxiv_id,
                        iteration,
                    )
                    continue
                for record in file_utils.load_from_csv(
                    citation_hues_path, ColorizationRecord
                ):
                    key = record.entity_id
                    if key not in boxes_by_citation_key:
                        boxes_by_citation_key[key] = []
                    hue_iteration = HueIteration(record.hue, iteration)
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
            for box in cluster:
                yield CitationLocation(
                    key=item.citation_key,
                    cluster_index=i,
                    page=box.page,
                    left=box.left,
                    top=box.top,
                    width=box.width,
                    height=box.height,
                )

    def save(self, item: LocationTask, result: CitationLocation) -> None:
        output_dir = directories.arxiv_subdir("citation-cluster-locations", item.arxiv_id)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        locations_path = os.path.join(output_dir, "citation_locations.csv")
        file_utils.append_to_csv(locations_path, result)
