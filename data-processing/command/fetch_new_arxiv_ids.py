import logging
import os
from argparse import ArgumentParser
from typing import Any, Iterator

from common.fetch_arxiv import fetch_new_arxiv_ids
from common.types import ArxivId
from common import directories
from models.models import init_database_connections
from command.command import Command


class FetchNewArxivIds(Command[ArxivId, ArxivId]):
    def __init__(self, args: Any) -> None:
        super().__init__(args)
        init_database_connections()

    @staticmethod
    def get_name() -> str:
        return "fetch-new-arxiv-ids"

    @staticmethod
    def get_description() -> str:
        return "Fetch arXiv IDs for papers newly added to arXiv."

    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        parser.add_argument(
            "--days",
            type=int,
            help="Number of days in the past for which to fetch arXiv IDs",
        )
        parser.add_argument(
            "--output-file",
            type=str,
            help="Path to file where fetched arXiv IDs will be written",
        )

    def load(self) -> Iterator[ArxivId]:
        if self.args.days is not None:
            arxiv_ids = fetch_new_arxiv_ids(days=self.args.days)
        else:
            arxiv_ids = fetch_new_arxiv_ids()

        if self.args.output_file is not None:
            if os.path.exists(self.args.output_file):
                logging.warning(
                    "Output file %s already exists. Overwriting.", self.args.output_file
                )
                with open(self.args.output_file, "w") as output_file:
                    output_file.write("")

        for arxiv_id in arxiv_ids:
            yield arxiv_id

    def process(self, item: ArxivId) -> Iterator[ArxivId]:
        yield item

    def save(self, item: ArxivId, _: ArxivId) -> None:
        if not os.path.exists(directories.ARXIV_IDS_DIR):
            os.makedirs(directories.ARXIV_IDS_DIR)
        with open(directories.arxiv_ids(item), "w") as arxiv_ids_stamp:
            arxiv_ids_stamp.write("")

        if self.args.output_file is not None:
            with open(self.args.output_file, "a") as output_file:
                output_file.write(item + "\n")
