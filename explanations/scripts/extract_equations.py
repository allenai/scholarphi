import csv
import os.path
from typing import Iterator, NamedTuple

from TexSoup import TexSoup

import explanations.directories as directories
from explanations.directories import SOURCES_DIR
from explanations.file_utils import clean_directory
from scripts.command import Command


class Equation(NamedTuple):
    i: int
    tex: str


class FileContents(NamedTuple):
    arxiv_id: str
    """
    Absolute path to the TeX file.
    """
    path: str
    contents: str


class ExtractEquations(Command[FileContents, Equation]):
    @staticmethod
    def get_name() -> str:
        return "extract-equations"

    @staticmethod
    def get_description() -> str:
        return "Extract all equations from arXiv sources"

    def load(self) -> Iterator[FileContents]:
        for arxiv_id in os.listdir(SOURCES_DIR):
            sources_dir = os.path.join(SOURCES_DIR, arxiv_id)
            clean_directory(directories.equations(arxiv_id))
            for (dirpath, _, filenames) in os.walk(sources_dir):
                for filename in filenames:
                    if filename.endswith(".tex"):
                        path = os.path.join(dirpath, filename)
                        with open(path, "r") as tex_file:
                            contents = tex_file.read()
                            yield FileContents(arxiv_id, path, contents)

    def process(self, item: FileContents) -> Iterator[Equation]:
        soup = TexSoup(item.contents)
        # TODO(andrewhead): also find all begin / end equation environments.
        equations = list(soup.find_all("$"))
        for i, equation in enumerate(equations):
            yield Equation(i, equation)

    def save(self, item: FileContents, result: Equation) -> None:
        results_dir = directories.equations(item.arxiv_id)
        if not os.path.exists(results_dir):
            os.makedirs(results_dir)
        results_path = os.path.join(results_dir, "equations.csv")
        with open(results_path, "a") as results_file:
            writer = csv.writer(results_file, quoting=csv.QUOTE_ALL)
            writer.writerow([item.path, result.i, result.tex])
