from typing import Iterator

from explanations import directories
from explanations.types import ArxivId, Path
from explanations.unpack import unpack
from scripts.command import ArxivBatchCommand


class UnpackSources(ArxivBatchCommand[ArxivId, None]):
    @staticmethod
    def get_name() -> str:
        return "unpack-sources"

    @staticmethod
    def get_description() -> str:
        return "Unpack fetched TeX sources."

    def get_arxiv_ids_dir(self) -> Path:
        return directories.SOURCE_ARCHIVES_DIR

    def load(self) -> Iterator[ArxivId]:
        for arxiv_id in self.arxiv_ids:
            yield arxiv_id

    def process(self, item: ArxivId) -> Iterator[None]:
        unpack(item, directories.sources(item))
        yield None

    def save(self, item: ArxivId, result: None) -> None:
        pass
