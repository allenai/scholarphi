import time
from argparse import ArgumentParser
from typing import Iterator, Optional

from common.commands.base import ArxivBatchCommand
from common.fetch_arxiv import fetch_from_arxiv, fetch_from_s3
from common.types import ArxivId

DEFAULT_S3_ARXIV_SOURCES_BUCKET = "s2-arxiv-sources"

""" Time to wait between consecutive requests to arXiv. """
FETCH_DELAY = 10  # seconds


class FetchArxivSources(ArxivBatchCommand[ArxivId, None]):
    @staticmethod
    def get_name() -> str:
        return "fetch-arxiv-sources"

    @staticmethod
    def get_description() -> str:
        return "Fetch TeX sources for arXiv papers."

    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        super(FetchArxivSources, FetchArxivSources).init_parser(parser)
        parser.add_argument(
            "--source",
            choices=["arxiv", "s3"],
            default="s3",
            help=(
                "Where to download sources from. If 'arxiv', download sources from arXiv.org. If "
                + "'s3', download from S2's S3 bucket for arXiv sources."
            ),
        )
        parser.add_argument(
            "--s3-bucket",
            type=str,
            default=DEFAULT_S3_ARXIV_SOURCES_BUCKET,
            help="If '--source' is 's3', this is the S3 bucket sources will be downloaded from.",
        )

    def get_arxiv_ids_dirkey(self) -> Optional[str]:
        return None

    def load(self) -> Iterator[ArxivId]:
        for arxiv_id in self.arxiv_ids:
            yield arxiv_id

    def process(self, item: ArxivId) -> Iterator[None]:
        if self.args.source == "arxiv":
            fetch_from_arxiv(item)
            # This method of delaying fetches assumes that calls to 'process' will be made sequentially
            # and not in parallel. Delay mechanisms will need to be more sophisticated if we transition
            # to parallel data fetching.
            time.sleep(FETCH_DELAY)
            yield None
        elif self.args.source == "s3":
            fetch_from_s3(item, self.args.s3_bucket)
            yield None

    def save(self, item: ArxivId, result: None) -> None:
        pass
