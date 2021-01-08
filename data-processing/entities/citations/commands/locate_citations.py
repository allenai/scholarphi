import logging
import os.path
from dataclasses import dataclass
from typing import Iterator, List

from common import directories, file_utils
from common.bounding_box import cluster_boxes
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId, BoundingBox, CitationLocation


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

            output_dir = directories.arxiv_subdir(
                "citation-cluster-locations", arxiv_id
            )
            file_utils.clean_directory(output_dir)

            boxes_by_citation_key = file_utils.load_citation_locations(arxiv_id)
            if boxes_by_citation_key is None:
                continue

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
        output_dir = directories.arxiv_subdir(
            "citation-cluster-locations", item.arxiv_id
        )
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        locations_path = os.path.join(output_dir, "citation_locations.csv")
        file_utils.append_to_csv(locations_path, result)
