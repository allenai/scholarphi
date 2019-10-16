import os.path
from typing import Iterator

from explanations.compile import compile_tex
from explanations.directories import SOURCES_DIR
from scripts.command import Command

sources_path = str


class CompileTex(Command[str, None]):
    @staticmethod
    def get_name() -> str:
        return "compile-tex"

    @staticmethod
    def get_description() -> str:
        return "Compile TeX sources."

    def load(self) -> Iterator[sources_path]:
        for arxiv_id in os.listdir(SOURCES_DIR):
            sources_dir = os.path.join(SOURCES_DIR, arxiv_id)
            yield sources_dir

    def process(self, item: sources_path) -> Iterator[None]:
        compile_tex(item)
        yield None

    def save(self, item: sources_path, result: None) -> None:
        pass
