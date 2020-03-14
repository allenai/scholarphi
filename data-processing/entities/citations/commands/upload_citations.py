import ast
import dataclasses
import logging
import os.path
from dataclasses import dataclass
from typing import Dict, Iterator, Set

from peewee import IntegrityError

from common import directories, file_utils
from common.commands.database import DatabaseUploadCommand
from common.models import BoundingBox as BoundingBoxModel
from common.models import (Citation, CitationPaper, Entity, EntityBoundingBox,
                           Paper, Summary, output_database)
from common.types import (ArxivId, BibitemMatch, CitationLocation,
                          SerializableReference)

from ..utils import load_located_citations

CitationKey = str
LocationIndex = int
S2Id = str


@dataclass(frozen=True)
class CitationData:
    arxiv_id: ArxivId
    s2_id: S2Id
    citation_locations: Dict[CitationKey, Dict[LocationIndex, Set[CitationLocation]]]
    key_s2_ids: Dict[CitationKey, S2Id]
    s2_data: Dict[S2Id, SerializableReference]


class UploadCitations(DatabaseUploadCommand[CitationData, None]):
    @staticmethod
    def get_name() -> str:
        return "upload-citations"

    @staticmethod
    def get_description() -> str:
        return "Upload citation information to the database."

    def get_arxiv_ids_dirkey(self) -> str:
        return "sources"

    def load(self) -> Iterator[CitationData]:
        for arxiv_id in self.arxiv_ids:

            # Load citation locations
            citation_locations = load_located_citations(arxiv_id)
            if citation_locations is None:
                continue

            # Load metadata for bibitems
            key_s2_ids: Dict[CitationKey, S2Id] = {}
            key_resolutions_path = os.path.join(
                directories.arxiv_subdir("bibitem-resolutions", arxiv_id),
                "resolutions.csv",
            )
            if not os.path.exists(key_resolutions_path):
                logging.warning(
                    "Could not find citation resolutions for %s. Skipping", arxiv_id
                )
                continue
            for resolution in file_utils.load_from_csv(
                key_resolutions_path, BibitemMatch
            ):
                if resolution.key is not None:
                    key_s2_ids[resolution.key] = resolution.s2_id

            s2_id_path = os.path.join(
                directories.arxiv_subdir("s2-metadata", arxiv_id), "s2_id"
            )
            if not os.path.exists(s2_id_path):
                logging.warning("Could not find S2 ID file for %s. Skipping", arxiv_id)
                continue
            with open(s2_id_path) as s2_id_file:
                s2_id = s2_id_file.read()

            s2_data: Dict[S2Id, SerializableReference] = {}
            s2_metadata_path = os.path.join(
                directories.arxiv_subdir("s2-metadata", arxiv_id), "references.csv"
            )
            if not os.path.exists(s2_metadata_path):
                logging.warning(
                    "Could not find S2 metadata file for citations for %s. Skipping",
                    arxiv_id,
                )
                continue
            for metadata in file_utils.load_from_csv(
                s2_metadata_path, SerializableReference
            ):
                # Convert authors field to comma-delimited list of authors
                author_string = ",".join(
                    [a["name"] for a in ast.literal_eval(metadata.authors)]
                )
                metadata = dataclasses.replace(metadata, authors=author_string)
                s2_data[metadata.s2_id] = metadata

            yield CitationData(
                arxiv_id, s2_id, citation_locations, key_s2_ids, s2_data,
            )

    def process(self, _: CitationData) -> Iterator[None]:
        yield None

    def save(self, item: CitationData, _: None) -> None:

        arxiv_id = item.arxiv_id
        s2_id = item.s2_id
        citation_locations = item.citation_locations
        key_s2_ids = item.key_s2_ids
        s2_data = item.s2_data

        try:
            paper = Paper.get(Paper.s2_id == s2_id)
        except Paper.DoesNotExist:
            paper = Paper.create(s2_id=s2_id, arxiv_id=arxiv_id)

        for citation_key, locations in citation_locations.items():

            if citation_key in key_s2_ids:
                s2_id = key_s2_ids[citation_key]
                if s2_id in s2_data:
                    paper_data = s2_data[s2_id]

                    try:
                        cited_paper = Paper.get(Paper.s2_id == s2_id)
                    except Paper.DoesNotExist:
                        cited_paper = Paper.create(
                            s2_id=s2_id, arxiv_id=paper_data.arxivId or None
                        )

                    try:
                        Summary.get(Summary.paper == cited_paper)
                    except Summary.DoesNotExist:
                        Summary.create(
                            paper=cited_paper,
                            title=paper_data.title,
                            authors=paper_data.authors,
                            doi=paper_data.doi or None,
                            venue=paper_data.venue or None,
                            year=paper_data.year,
                        )

            for location_set in locations.values():
                citation = Citation.create(paper=paper)
                try:
                    with output_database.atomic():
                        CitationPaper.create(paper=cited_paper, citation=citation)
                except IntegrityError:
                    logging.warning(  # pylint: disable=logging-not-lazy
                        (
                            "Cited paper %s and citation %s are already linked. This suggests a bug in "
                            + "the citation resolution code; perhaps multiple citation keys were "
                            + "matched to the same paper?"
                        ),
                        cited_paper.arxiv_id,
                        citation.id,
                    )

                entity = Entity.create(
                    type="citation", source="tex-pipeline", entity_id=citation.id
                )

                for location in location_set:
                    bounding_box = BoundingBoxModel.create(
                        page=location.page,
                        left=location.left,
                        top=location.top,
                        width=location.width,
                        height=location.height,
                    )

                    EntityBoundingBox.create(bounding_box=bounding_box, entity=entity)
