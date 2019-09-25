import os

import requests

from explanations.directories import SOURCE_ARCHIVES_DIR

USER_AGENT = "Andrew Head, for academic research on dissemination of scientific insight <head.andrewm@gmail.com>"


def save_source_archive(arxiv_id: str, content: bytes):
    if not os.path.exists(SOURCE_ARCHIVES_DIR):
        os.makedirs(SOURCE_ARCHIVES_DIR)
    archive_path = os.path.join(SOURCE_ARCHIVES_DIR, arxiv_id)
    with open(archive_path, "wb") as archive:
        archive.write(content)


def fetch(arxiv_id: str):
    uri = "https://arxiv.org/e-print/%s" % (arxiv_id,)
    response = requests.get(uri, headers={"User-Agent": USER_AGENT})
    save_source_archive(arxiv_id, response.content)
