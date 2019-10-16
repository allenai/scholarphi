import time
from argparse import ArgumentParser
from typing import Iterator

from explanations.fetch_arxiv import fetch
from scripts.command import Command

arxiv_id = str


""" Time to wait between consecutive requests to arXiv. """
FETCH_DELAY = 10  # seconds


class FetchArxivSources(Command[str, None]):
    @staticmethod
    def get_name() -> str:
        return "fetch-arxiv-sources"

    @staticmethod
    def get_description() -> str:
        return "Fetch TeX sources for arXiv papers."

    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        parser.add_argument(
            "arxiv_ids",
            help="File containing list of arXiv IDs "
            + " for which to fetch sources, with one ID per line.",
        )

    def load(self) -> Iterator[arxiv_id]:
        with open(self.args.arxiv_ids) as arxiv_ids_file:
            for line in arxiv_ids_file:
                arxivId = line.strip()
                yield arxivId

    def process(self, item: arxiv_id) -> Iterator[None]:
        fetch(item)
        # This method of delaying fetches assumes that calls to 'process' will be made sequentially
        # and not in parallel. Delay mechanisms will need to be more sophisticated if we transition
        # to parallel data fetching.
        time.sleep(FETCH_DELAY)
        yield None

    def save(self, item: arxiv_id, result: None) -> None:
        pass
