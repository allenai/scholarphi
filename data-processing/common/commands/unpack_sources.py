from typing import Iterator

from common import directories
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId
from common.unpack import unpack


class UnpackSources(ArxivBatchCommand[ArxivId, None]):
    @staticmethod
    def get_name() -> str:
        return "unpack-sources"

    @staticmethod
    def get_description() -> str:
        return "Unpack fetched TeX sources."

    def get_arxiv_ids_dirkey(self) -> str:
        return "sources-archives"

    def load(self) -> Iterator[ArxivId]:
        for arxiv_id in self.arxiv_ids:
            yield arxiv_id

    def process(self, item: ArxivId) -> Iterator[None]:
        unpack(item, directories.arxiv_subdir("sources", item))
        yield None

    def save(self, item: ArxivId, result: None) -> None:
        pass
