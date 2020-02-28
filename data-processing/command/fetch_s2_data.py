import dataclasses
import logging
import os.path
import time
from typing import Iterator

import requests

from command.command import ArxivBatchCommand
from common import directories, file_utils
from common.types import ArxivId, Author, Reference, S2Metadata, SerializableReference

""" Time to wait between consecutive requests to S2 API. """
FETCH_DELAY = 3  # seconds


class FetchS2Metadata(ArxivBatchCommand[ArxivId, S2Metadata]):
    @staticmethod
    def get_name() -> str:
        return "fetch-s2-metadata"

    @staticmethod
    def get_description() -> str:
        return "Fetch S2 metadata for papers. Includes reference information."

    def get_arxiv_ids_dirkey(self) -> str:
        return "sources-archives"

    def load(self) -> Iterator[ArxivId]:
        for arxiv_id in self.arxiv_ids:
            yield arxiv_id

    def process(self, item: ArxivId) -> Iterator[S2Metadata]:
        # XXX(andrewhead): S2 API does not have versions of arXiv papers. I don't think this
        # will be an issue, but it's something to pay attention to.
        resp = requests.get(f"https://api.semanticscholar.org/v1/paper/arXiv:{item}")

        if resp.ok:
            data = resp.json()
            references = []
            for reference_data in data["references"]:
                authors = []
                for author_data in reference_data["authors"]:
                    authors.append(Author(author_data["authorId"], author_data["name"]))
                reference = Reference(
                    s2_id=reference_data["paperId"],
                    arxivId=reference_data["arxivId"],
                    doi=reference_data["doi"],
                    title=reference_data["title"],
                    authors=authors,
                    venue=reference_data["venue"],
                    year=reference_data["year"],
                )
                references.append(reference)

            s2_metadata = S2Metadata(s2_id=data["paperId"], references=references)
            logging.debug("Fetched S2 metadata for arXiv paper %s", item)
            yield s2_metadata

        time.sleep(FETCH_DELAY)

    def save(self, item: ArxivId, result: S2Metadata) -> None:

        s2_metadata_dir = directories.arxiv_subdir("s2-metadata", item)
        if not os.path.exists(s2_metadata_dir):
            os.makedirs(s2_metadata_dir)

        references_path = os.path.join(s2_metadata_dir, "references.csv")
        for r in result.references:
            serializable = SerializableReference(
                s2_id=r.s2_id,
                arxivId=r.arxivId,
                doi=r.doi,
                title=r.title,
                authors=str([dataclasses.asdict(a) for a in r.authors]),
                venue=r.venue,
                year=r.year,
            )
            file_utils.append_to_csv(references_path, serializable)

        s2_id_path = os.path.join(s2_metadata_dir, "s2_id")
        with open(s2_id_path, "w") as s2_id_file:
            s2_id_file.write(result.s2_id)
