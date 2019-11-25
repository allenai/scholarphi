import time
from typing import Iterator, Optional

from explanations.fetch_arxiv import fetch
from explanations.types import ArxivId, Path
from scripts.command import ArxivBatchCommand

""" Time to wait between consecutive requests to arXiv. """
FETCH_DELAY = 10  # seconds


class FetchArxivSources(ArxivBatchCommand[ArxivId, None]):
    @staticmethod
    def get_name() -> str:
        return "fetch-arxiv-sources"

    @staticmethod
    def get_description() -> str:
        return "Fetch TeX sources for arXiv papers."

    def get_arxiv_ids_dir(self) -> Optional[Path]:
        return None

    def load(self) -> Iterator[ArxivId]:
        for arxiv_id in self.arxiv_ids:
            yield arxiv_id

    def process(self, item: ArxivId) -> Iterator[None]:
        fetch(item)
        # This method of delaying fetches assumes that calls to 'process' will be made sequentially
        # and not in parallel. Delay mechanisms will need to be more sophisticated if we transition
        # to parallel data fetching.
        time.sleep(FETCH_DELAY)
        yield None

    def save(self, item: ArxivId, result: None) -> None:
        pass
