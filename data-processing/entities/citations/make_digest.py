import os
from typing import Optional

from common import directories, file_utils
from common.make_digest import make_default_paper_digest
from common.types import ArxivId, Bibitem, EntityProcessingDigest

from .utils import load_located_citations


def make_digest(entity_name: str, arxiv_id: ArxivId) -> EntityProcessingDigest:
    default_digest = make_default_paper_digest(entity_name, arxiv_id)
    return EntityProcessingDigest(
        num_extracted=count_entities_extracted(arxiv_id),
        num_hues_located=default_digest.num_hues_located,
        num_entities_located=count_entities_located(arxiv_id),
    )


def count_entities_located(arxiv_id: ArxivId) -> Optional[int]:
    """
    Get the number of distinct citations found in the text. One potential source of inaccuracy
    is that citations are detected as clusters of bounding boxes that were found for the same
    citation key across multiple adjacent lines in the text, however the algorithm for clustering
    these bounding boxes may sometimes cluster incorrectly (see 'LocateCitations').
    """
    citations_locations_by_key = load_located_citations(arxiv_id)
    if citations_locations_by_key is None:
        return None

    count = sum(
        [len(key_locations) for key_locations in citations_locations_by_key.values()]
    )
    return count


def count_entities_extracted(arxiv_id: ArxivId) -> Optional[int]:
    """
    This is not the same as the number of citation commands in the TeX; specifically, it's the
    number of bibitems which are colorized to enable detection of citation locations.
    """
    bibitems_path = os.path.join(
        directories.arxiv_subdir("bibitems", arxiv_id), "bibitems.csv"
    )
    if not os.path.exists(bibitems_path):
        return None
    return len(list(file_utils.load_from_csv(bibitems_path, Bibitem)))
