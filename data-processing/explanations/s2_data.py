import logging
import os.path
from typing import Optional

from explanations import directories


def get_s2_id(arxiv_id: str) -> Optional[str]:
    s2_id_path = os.path.join(directories.get_data_subdirectory_for_arxiv_id(directories.S2_METADATA_DIR, arxiv_id), "s2_id")
    if not os.path.exists(s2_id_path):
        logging.warning("Could not find S2 ID file for %s. Skipping", arxiv_id)
        return None
    with open(s2_id_path) as s2_id_file:
        return s2_id_file.read()
