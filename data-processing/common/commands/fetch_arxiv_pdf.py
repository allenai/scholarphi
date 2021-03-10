import time
from argparse import ArgumentParser
import logging
from typing import Iterator, Optional

from common import directories
from common.commands.base import ArxivBatchCommand
from common.fetch_arxiv import FetchFromArxivPDFException, fetch_pdf_from_arxiv
from common.types import ArxivId


"""Constants for dealing with retries and delays between call attempts"""
DEFAULT_FETCH_DELAY = 10  # seconds
BACKOFF_FETCH_DELAY = 60  # seconds
MAX_FETCH_ATTEMPTS = 3


logger = logging.getLogger(__name__)


class FetchArxivPdf(ArxivBatchCommand[ArxivId, None]):
    @staticmethod
    def get_name() -> str:
        return "fetch-arxiv-pdf"

    @staticmethod
    def get_description() -> str:
        return "Fetch PDF for arXiv papers."

    def get_arxiv_ids_dirkey(self) -> Optional[str]:
        return None

    def load(self) -> Iterator[ArxivId]:
        for arxiv_id in self.arxiv_ids:
            yield arxiv_id

    def process(
        self,
        item: ArxivId
    ) -> Iterator[None]:
        attempt = 0

        while True:
            try:
                result = fetch_pdf_from_arxiv(item, dest=directories.arxiv_subdir(dirkey='arxiv-pdfs',
                                                                                  arxiv_id=item))
                yield result
                break
            except FetchFromArxivPDFException as e:
                if attempt < MAX_FETCH_ATTEMPTS - 1:
                    logger.warning("Trouble getting data from ArXiv. Backing off and trying again.")
                    attempt += 1
                    time.sleep(BACKOFF_FETCH_DELAY)
                else:
                    logger.warning("Exceed maximum retries to ArXiv.")
                    time.sleep(BACKOFF_FETCH_DELAY)
                    raise e

        # This method of delaying fetches assumes that calls to 'process' will be made sequentially
        # and not in parallel. Delay mechanisms will need to be more sophisticated if we transition
        # to parallel data fetching.
        time.sleep(DEFAULT_FETCH_DELAY)
        yield None


    def save(self, item: ArxivId, result: None) -> None:
        pass
