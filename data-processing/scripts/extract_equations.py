import csv
import logging
import os.path
from typing import Iterator

import explanations.directories as directories
from explanations.directories import SOURCES_DIR, get_arxiv_ids, sources
from explanations.file_utils import clean_directory, find_files, read_file_tolerant
from explanations.instrument_tex import EquationExtractor, walk_tex_parse_tree
from explanations.scrape_tex import TexSoupParseError
from explanations.types import Equation, FileContents
from scripts.command import Command


class ExtractEquations(Command[FileContents, Equation]):
    @staticmethod
    def get_name() -> str:
        return "extract-equations"

    @staticmethod
    def get_description() -> str:
        return "Extract all equations from TeX sources"

    def load(self) -> Iterator[FileContents]:
        for arxiv_id in get_arxiv_ids(SOURCES_DIR):
            sources_dir = sources(arxiv_id)
            clean_directory(directories.equations(arxiv_id))
            for path in find_files(sources_dir, [".tex"]):
                contents = read_file_tolerant(path)
                if contents is None:
                    continue
                relative_path = os.path.relpath(path, sources_dir)
                yield FileContents(arxiv_id, relative_path, contents)

    def process(self, item: FileContents) -> Iterator[Equation]:
        # TODO(andrewhead): also find all begin / end equation environments.
        equation_extractor = EquationExtractor()
        try:
            walk_tex_parse_tree(item.contents, [equation_extractor])
            for equation in equation_extractor.equations:
                yield Equation(equation.i, equation.content_tex)
        except TexSoupParseError as e:
            logging.error("Could not parse TeX file %s with TexSoup: %s", item.path, e)

    def save(self, item: FileContents, result: Equation) -> None:
        results_dir = directories.equations(item.arxiv_id)
        if not os.path.exists(results_dir):
            os.makedirs(results_dir)
        results_path = os.path.join(results_dir, "equations.csv")
        with open(results_path, "a") as results_file:
            writer = csv.writer(results_file, quoting=csv.QUOTE_ALL)
            writer.writerow([item.path, result.i, result.tex])
