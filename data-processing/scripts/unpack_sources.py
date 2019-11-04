from typing import Iterator

from explanations import directories
from explanations.directories import SOURCE_ARCHIVES_DIR, get_arxiv_ids
from explanations.types import ArxivId
from explanations.unpack import unpack
from scripts.command import Command


class UnpackSources(Command[str, None]):
    @staticmethod
    def get_name() -> str:
        return "unpack-sources"

    @staticmethod
    def get_description() -> str:
        return "Unpack fetched TeX sources."

    def load(self) -> Iterator[ArxivId]:
        for arxiv_id in get_arxiv_ids(SOURCE_ARCHIVES_DIR):
            yield arxiv_id

    def process(self, item: ArxivId) -> Iterator[None]:
        unpack(item, directories.sources(item))
        yield None

    def save(self, item: ArxivId, result: None) -> None:
        pass
