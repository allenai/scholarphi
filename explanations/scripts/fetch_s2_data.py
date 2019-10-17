import csv
import logging
import os.path
import time
from typing import Iterator

import requests

from explanations import directories
from explanations.directories import SOURCE_ARCHIVES_DIR, get_arxiv_ids
from explanations.types import ArxivId, Author, Reference, S2Metadata
from scripts.command import Command

""" Time to wait between consecutive requests to S2 API. """  # pylint: disable=pointless-string-statement
FETCH_DELAY = 3  # seconds


class FetchS2Metadata(Command[ArxivId, S2Metadata]):
    @staticmethod
    def get_name() -> str:
        return "fetch-s2-metadata"

    @staticmethod
    def get_description() -> str:
        return "Fetch S2 metadata for papers. Includes reference information."

    def load(self) -> Iterator[ArxivId]:
        for arxiv_id in get_arxiv_ids(SOURCE_ARCHIVES_DIR):
            yield arxiv_id

    def process(self, item: ArxivId) -> Iterator[S2Metadata]:
        # XXX(andrewhead): S2 API does not have versions of arXiv papers. I don't think this
        # will practically be an issue, but it's something to pay attention to.
        resp = requests.get(f"https://api.semanticscholar.org/v1/paper/arXiv:{item}")
        data = resp.json()

        references = []
        for reference_data in data["references"]:
            authors = []
            for author_data in reference_data["authors"]:
                authors.append(Author(author_data["authorId"], author_data["name"]))
            reference = Reference(
                s2Id=reference_data["paperId"],
                arxivId=reference_data["arxivId"],
                doi=reference_data["doi"],
                title=reference_data["title"],
                authors=authors,
                venue=reference_data["venue"],
                year=reference_data["year"],
            )
            references.append(reference)

        s2_metadata = S2Metadata(s2id=data["paperId"], references=references)
        logging.debug("Fetched S2 metadata for arXiv paper %s", item)
        yield s2_metadata
        time.sleep(FETCH_DELAY)

    def save(self, item: ArxivId, result: S2Metadata) -> None:

        s2_metadata_dir = directories.s2_metadata(item)
        if not os.path.exists(s2_metadata_dir):
            os.makedirs(s2_metadata_dir)

        references_path = os.path.join(s2_metadata_dir, "references.csv")
        with open(references_path, "w") as references_file:
            writer = csv.writer(references_file, quoting=csv.QUOTE_ALL)
            for reference in result.references:
                authors_string = ", ".join([a.name for a in reference.authors])
                writer.writerow(
                    [
                        reference.s2Id,
                        reference.arxivId,
                        reference.doi,
                        reference.title,
                        authors_string,
                        reference.venue,
                        reference.year,
                    ]
                )
