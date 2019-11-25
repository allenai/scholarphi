import datetime
import logging
import os
from typing import List

import requests

from explanations.directories import SOURCE_ARCHIVES_DIR, source_archives
from explanations.types import ArxivId
from models.models import Metadata

USER_AGENT = "Andrew Head, for academic research on dissemination of scientific insight <head.andrewm@gmail.com>"


def save_source_archive(arxiv_id: ArxivId, content: bytes) -> None:
    if not os.path.exists(SOURCE_ARCHIVES_DIR):
        os.makedirs(SOURCE_ARCHIVES_DIR)
    archive_path = source_archives(arxiv_id)
    with open(archive_path, "wb") as archive:
        archive.write(content)


def fetch(arxiv_id: ArxivId) -> None:
    logging.debug("Fetching sources.")
    uri = "https://arxiv.org/e-print/%s" % (arxiv_id,)
    response = requests.get(uri, headers={"User-Agent": USER_AGENT})
    save_source_archive(arxiv_id, response.content)


def fetch_new_arxiv_ids(days: int = 1) -> List[ArxivId]:
    threshold_timestamp = datetime.datetime.now() - datetime.timedelta(days=days)
    metadata_models = Metadata.select(Metadata.metadata_id).where(
        Metadata.created_ts > threshold_timestamp
    )
    arxiv_ids = [m.metadata_id for m in metadata_models]
    return arxiv_ids
