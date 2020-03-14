import logging
import os
from typing import Dict, Optional, Set

from common import directories, file_utils
from common.types import ArxivId, CitationLocation

CitationKey = str
LocationIndex = int

Citations = Dict[CitationKey, Dict[LocationIndex, Set[CitationLocation]]]


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
