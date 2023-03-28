import dataclasses
import logging
import os
import os.path
import time
from typing import Any, Iterator

import requests

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId, Author, Reference, S2Metadata, SerializableReference


logger = logging.getLogger(__name__)


""" Time to wait between consecutive requests to S2 API. """
FETCH_DELAY = 3  # seconds


class S2ApiException(Exception):
    """Generic exception related to calling the S2 API"""


class S2ApiRateLimitingException(S2ApiException):
    """
    Caller has been rate-limited by S2's Public/Partner API.
    """

class S2MetadataException(S2ApiException):
    """
    Represents data availability issues when calling the S2 API.
    """

class S2PaperNotFoundException(S2MetadataException):
    """
    The target arxiv paper could not be found on the S2 public api,
    which is a requirement for processing.
    """

class S2ReferencesNotFoundException(S2MetadataException):
    """
    The target arxiv paper did not have any references available via the S2 public api.
    """


class FetchS2Metadata(ArxivBatchCommand[ArxivId, S2Metadata]):
    def __init__(self, args: Any) -> None:
        super().__init__(args)
        # self._partner_api_token = os.getenv("S2_PARTNER_API_TOKEN", None) # TODO: is this used anywhere else though???

    def _mk_api_request(self, arxivId: ArxivId) -> requests.Response:
        # XXX(andrewhead): S2 API does not have versions of arXiv papers. I don't think this
        # will be an issue, but it's something to pay attention to.
        versionless_id = self._strip_arxiv_version(arxivId)

        base_url = "api.semanticscholar.org"
        headers = None

        # if self._partner_api_token:
        #     base_url = "partner.semanticscholar.org"
        #     headers = {"x-api-key": self._partner_api_token}

        logger.info(f"Issuing request to S2 @ {base_url}")

        return requests.get(
            f"https://{base_url}/v1/paper/arXiv:{versionless_id}",
            headers=headers
        )

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
        try:
            resp = self._mk_api_request(item)

        except Exception as e:
            # Exceptions here could reflect temporary service availability
            # or slowdown issues with S2's API.
            logging.error("Error encountered attempting to call S2's API", e)
            raise S2ApiException()

        else:
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

                if not references:
                    # References are required to process citations, mark job as failed
                    raise S2ReferencesNotFoundException()

                s2_metadata = S2Metadata(s2_id=data["paperId"], references=references)
                logging.debug("Fetched S2 metadata for arXiv paper %s", item)
                yield s2_metadata
            elif resp.status_code == 404:
                # Paper is unavailable in Public API -- potential race condition.
                raise S2PaperNotFoundException()
            elif resp.status_code == 429:
                # Request rate limit has been exceeded for this account or client IP.
                raise S2ApiRateLimitingException()
            else:
                raise S2ApiException(f"Failed to retrieve paper data from S2 with HTTP error code {resp.status_code}")

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

    def _strip_arxiv_version(self, item: ArxivId) -> ArxivId:
        """Remove any version identifier from the passed ArXiv ID.
        Looks for the last 'v' (case-insensitive) and strips beyond it.
        Reference: https://arxiv.org/help/arxiv_identifier_for_services

        >>> c._strip_arxiv_version("1703.03400")
        1703.03400
        >>> c._strip_arxiv_version("1703.03400v0")
        1703.03400
        >>> c._strip_arxiv_version("1703.03400v3")
        1703.03400
        >>> c._strip_arxiv_version("1703.03400vasdfa")
        1703.03400
        >>> c._strip_arxiv_version("1703.03400asdfa")
        1703.03400asdfa
        >>> c._strip_arxiv_version("1703.03400V0")
        1703.03400
        >>> c._strip_arxiv_version("1703.03400V0v1")
        1703.03400V0
        >>> c._strip_arxiv_version("math.GT/0309123")
        math.GT/0309123
        >>> c._strip_arxiv_version("math.GT/0309123v1")
        math.GT/0309123
        >>> c._strip_arxiv_version("math.VT/0309123")
        math.VT/030912
        >>> c._strip_arxiv_version("math.VT/0309123v1")
        math.VT/03091233
        """

        # Don't strip from any field name values (e.g., math.VT above)
        start_index = max(0, item.find("/"))

        lower_v = item.rfind("v", start_index)
        upper_v = item.rfind("V", start_index)

        found_index = max(lower_v, upper_v)

        if found_index == -1:
            return item

        return item[0:found_index]
