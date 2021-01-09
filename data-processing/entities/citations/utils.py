import logging
import os
import re
from typing import Dict, Optional, Set

from common import directories, file_utils
from common.types import ArxivId, EntityLocationInfo

CitationKey = str
LocationIndex = int

Citations = Dict[CitationKey, Dict[LocationIndex, Set[EntityLocationInfo]]]


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
        directories.arxiv_subdir("citations-locations", arxiv_id),
        "entity_locations.csv",
    )
    if not os.path.exists(citation_locations_path):
        logging.warning("Could not find citation locations for %s. Skipping", arxiv_id)
        return None

    for location in file_utils.load_from_csv(
        citation_locations_path, EntityLocationInfo
    ):
        id_tokens = location.entity_id.rsplit("-", maxsplit=1)
        key = id_tokens[0]
        cluster_index = int(id_tokens[1])
        if key not in citation_locations:
            citation_locations[key] = {}
        if not cluster_index in citation_locations[key]:
            citation_locations[key][cluster_index] = set()
        citation_locations[key][cluster_index].add(location)

    return citation_locations
