import logging
import os
from typing import Dict, Optional, Set
from peewee import IntegrityError
import re

from common import directories, file_utils
from common.models import BoundingBox as BoundingBoxModel
from common.models import Paper, Citation, CitationPaper, Entity, EntityBoundingBox, Summary, output_database
from common.types import ArxivId, CitationLocation, CitationData

CitationKey = str
LocationIndex = int

Citations = Dict[CitationKey, Dict[LocationIndex, Set[CitationLocation]]]


def extract_ngrams(s: str, n: int = 3) -> Set[str]:
    """
    This and the 'ngram_sim' method below were provided by Kyle Lo.
    """
    s = re.sub(r"\W", "", s.lower())
    ngrams = zip(*[s[i:] for i in range(n)])
    return {"".join(ngram) for ngram in ngrams}


def ngram_sim(s1: str, s2: str) -> float:
    s1_grams = extract_ngrams(s1)
    s2_grams = extract_ngrams(s2)
    if len(s1_grams) == 0 or len(s2_grams) == 0:
        return 0
    return len(s1_grams.intersection(s2_grams)) / min(len(s1_grams), len(s2_grams))

def load_located_citations(arxiv_id: ArxivId) -> Optional[Citations]:
    citation_locations: Citations = {}
    citation_locations_path = os.path.join(
        directories.arxiv_subdir("citation-locations", arxiv_id),
        "citation_locations.csv",
    )
    if not os.path.exists(citation_locations_path):
        logging.warning("Could not find citation locations for %s. Skipping", arxiv_id)
        return None

    for location in file_utils.load_from_csv(citation_locations_path, CitationLocation):
        if not location.key in citation_locations:
            citation_locations[location.key] = {}
        if not location.cluster_index in citation_locations[location.key]:
            citation_locations[location.key][location.cluster_index] = set()
        citation_locations[location.key][location.cluster_index].add(location)

    return citation_locations

def upload_citations(item: CitationData, source: str = "tex-pipeline") -> None:
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
            cited_paper = None
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
                if cited_paper:
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
                    type="citation", source=source, entity_id=citation.id
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
