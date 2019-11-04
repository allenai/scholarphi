import csv
import json
import logging
import os.path
from typing import Dict, Iterator, List, NamedTuple, Tuple, cast

import explanations.directories as directories
from explanations.directories import (
    SOURCES_DIR,
    get_arxiv_ids,
    get_data_subdirectory_for_iteration,
    get_iteration_names,
)
from explanations.types import ArxivId, Author, PdfBoundingBox, Reference
from models.models import (
    BoundingBox,
    Citation,
    CitationPaper,
    Entity,
    EntityBoundingBox,
    Paper,
    Summary,
    create_tables,
)
from scripts.command import Command

CitationKey = str
CitationKeys = Tuple[CitationKey]
S2Id = str


class HueIteration(NamedTuple):
    hue: float
    iteration: str


class CitationData(NamedTuple):
    arxiv_id: ArxivId
    s2_id: S2Id
    boxes_by_hue_iteration: Dict[HueIteration, List[PdfBoundingBox]]
    citations_by_hue_iteration: Dict[HueIteration, CitationKeys]
    key_s2_ids: Dict[CitationKey, S2Id]
    s2_data: Dict[S2Id, Reference]


class UploadCitations(Command[CitationData, None]):
    """
    TODO(andrewhead): Ensure that the LaTeX compiler never produces more than one PDF. If so,
    we need to discover which PDF is the 'main' one that will get posted to arXiv.
    """

    @staticmethod
    def get_name() -> str:
        return "upload-citations"

    @staticmethod
    def get_description() -> str:
        return "Upload citation information to the database."

    def load(self) -> Iterator[CitationData]:
        for arxiv_id in get_arxiv_ids(SOURCES_DIR):

            boxes_by_hue_iteration: Dict[HueIteration, List[PdfBoundingBox]] = {}
            bounding_boxes_path = os.path.join(
                directories.hue_locations_for_citations(arxiv_id), "hue_locations.csv"
            )
            if not os.path.exists(bounding_boxes_path):
                logging.warning(
                    "Could not find bounding boxes information for %s. Skipping",
                    arxiv_id,
                )
                continue
            with open(bounding_boxes_path) as bounding_boxes_file:
                reader = csv.reader(bounding_boxes_file)
                for row in reader:
                    iteration = row[1]
                    hue = float(row[2])
                    box = PdfBoundingBox(
                        page=int(row[3]),
                        left=float(row[4]),
                        top=float(row[5]),
                        width=float(row[6]),
                        height=float(row[7]),
                    )
                    hue_iteration = HueIteration(hue, iteration)
                    if hue not in boxes_by_hue_iteration:
                        boxes_by_hue_iteration[hue_iteration] = []
                    boxes_by_hue_iteration[hue_iteration].append(box)

            citations_by_hue_iteration: Dict[HueIteration, CitationKeys] = {}
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
                        citation_keys = cast(Tuple[str], tuple(json.loads(row[3])))
                        hue = float(row[2])
                        iteration = row[1]
                        hue_iteration = HueIteration(hue, iteration)
                        citations_by_hue_iteration[hue_iteration] = citation_keys

            key_s2_ids: Dict[CitationKey, S2Id] = {}
            key_resolutions_path = os.path.join(
                directories.bibitem_resolutions(arxiv_id), "resolutions.csv"
            )
            if not os.path.exists(key_resolutions_path):
                logging.warning(
                    "Could not find citation resolutions for %s. Skipping", arxiv_id
                )
                continue
            with open(key_resolutions_path) as key_resolutions_file:
                reader = csv.reader(key_resolutions_file)
                for row in reader:
                    key = row[0]
                    s2_id = row[1]
                    key_s2_ids[key] = s2_id

            s2_id_path = os.path.join(directories.s2_metadata(arxiv_id), "s2_id")
            if not os.path.exists(s2_id_path):
                logging.warning("Could not find S2 ID file for %s. Skipping", arxiv_id)
                continue
            with open(s2_id_path) as s2_id_file:
                s2_id = s2_id_file.read()

            s2_data: Dict[S2Id, Reference] = {}
            s2_metadata_path = os.path.join(
                directories.s2_metadata(arxiv_id), "references.csv"
            )
            if not os.path.exists(s2_metadata_path):
                logging.warning(
                    "Could not find S2 metadata file for citations for %s. Skipping",
                    arxiv_id,
                )
                continue
            with open(s2_metadata_path) as s2_metadata_file:
                reader = csv.reader(s2_metadata_file)
                for row in reader:
                    s2_data[row[0]] = Reference(
                        s2Id=row[0],
                        arxivId=row[1] if row[1] is not "" else None,
                        doi=row[2] if row[2] is not "" else None,
                        title=row[3],
                        authors=[Author(id=None, name=nm) for nm in row[4].split(",")],
                        venue=row[5],
                        year=int(row[6]) if row[6] is not "" else None,
                    )

            yield CitationData(
                arxiv_id,
                s2_id,
                boxes_by_hue_iteration,
                citations_by_hue_iteration,
                key_s2_ids,
                s2_data,
            )

    def process(self, _: CitationData) -> Iterator[None]:
        yield None

    def save(self, item: CitationData, _: None) -> None:

        arxiv_id = item.arxiv_id
        s2_id = item.s2_id
        boxes_by_hue_iteration = item.boxes_by_hue_iteration
        citations_by_hue_iteration = item.citations_by_hue_iteration
        key_s2_ids = item.key_s2_ids
        s2_data = item.s2_data

        create_tables()

        try:
            paper = Paper.get(Paper.s2_id == s2_id)
        except Paper.DoesNotExist:
            paper = Paper.create(s2_id=s2_id, arxiv_id=arxiv_id)

        for hue_iteration, citation_keys in citations_by_hue_iteration.items():

            # Sometimes bounding boxes won't be found for a citation.
            if not hue_iteration in boxes_by_hue_iteration:
                continue

            bounding_boxes = boxes_by_hue_iteration[hue_iteration]

            cited_papers = []

            for citation_key in citation_keys:

                if citation_key in key_s2_ids:
                    s2_id = key_s2_ids[citation_key]
                    if s2_id in s2_data:
                        paper_data = s2_data[s2_id]

                        try:
                            cited_paper = Paper.get(Paper.s2_id == s2_id)
                        except Paper.DoesNotExist:
                            cited_paper = Paper.create(
                                s2_id=s2_id, arxiv_id=paper_data.arxivId
                            )
                        cited_papers.append(cited_paper)

                        try:
                            Summary.get(Summary.paper == cited_paper)
                        except Summary.DoesNotExist:
                            Summary.create(
                                paper=cited_paper,
                                title=paper_data.title,
                                authors=",".join(
                                    [author.name for author in paper_data.authors]
                                ),
                                doi=paper_data.doi,
                                venue=paper_data.venue,
                                year=paper_data.year,
                            )

            citation = Citation.create(paper=paper)
            for cited_paper in cited_papers:
                CitationPaper.create(paper=cited_paper, citation=citation)

            entity = Entity.create(type="citation", entity_id=citation.id)

            for box in bounding_boxes:
                bounding_box = BoundingBox.create(
                    page=box.page,
                    left=box.left,
                    top=box.top,
                    width=box.width,
                    height=box.height,
                )

                EntityBoundingBox.create(bounding_box=bounding_box, entity=entity)
