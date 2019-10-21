import csv
import logging
import os.path
from typing import Iterator, List, NamedTuple

from explanations import directories
from explanations.directories import (
    SOURCES_DIR,
    SOURCES_WITH_COLORIZED_EQUATIONS_DIR,
    get_arxiv_ids,
)
from explanations.file_utils import find_files
from explanations.instrument_tex import colorize_equations
from explanations.scrape_tex import TexSoupParseError
from explanations.types import ColorizedEquation, FileContents
from explanations.unpack import unpack
from scripts.command import Command


class TexWithColorizedEquations(NamedTuple):
    tex: str
    colorized_equations: List[ColorizedEquation]


class ColorizeEquations(Command[FileContents, TexWithColorizedEquations]):
    @staticmethod
    def get_name() -> str:
        return "colorize-equations"

    @staticmethod
    def get_description() -> str:
        return "Instrument TeX to colorize equations."

    def load(self) -> Iterator[FileContents]:
        for arxiv_id in get_arxiv_ids(SOURCES_DIR):
            # Unpack the sources into a new directory.
            unpack_path = unpack(arxiv_id, SOURCES_WITH_COLORIZED_EQUATIONS_DIR)
            if unpack_path is None:
                continue

            colorized_equations_path = directories.sources_with_colorized_equations(
                arxiv_id
            )
            for absolute_tex_path in find_files(colorized_equations_path, [".tex"]):
                relative_tex_path = os.path.relpath(
                    absolute_tex_path, os.path.abspath(colorized_equations_path)
                )
                with open(absolute_tex_path) as tex_file:
                    contents = tex_file.read()
                    yield FileContents(arxiv_id, relative_tex_path, contents)

    def process(self, item: FileContents) -> Iterator[TexWithColorizedEquations]:
        try:
            colorized_tex, colorized_equations = colorize_equations(item.contents)
            yield TexWithColorizedEquations(colorized_tex, colorized_equations)
        except TexSoupParseError as e:
            logging.error(
                "Failed to parse TeX file %s for arXiv ID %s: %s",
                item.path,
                item.arxiv_id,
                e,
            )

    def save(self, item: FileContents, result: TexWithColorizedEquations) -> None:
        colorized_tex = result.tex
        colorized_equations = result.colorized_equations

        tex_path = os.path.join(
            directories.sources_with_colorized_equations(item.arxiv_id), item.path
        )
        with open(tex_path, "w") as tex_file:
            tex_file.write(colorized_tex)

        hues_path = os.path.join(
            directories.sources_with_colorized_equation_tokens(item.arxiv_id),
            "equation_hues.csv",
        )
        with open(hues_path, "a") as hues_file:
            writer = csv.writer(hues_file, quoting=csv.QUOTE_ALL)
            for colorized_equation in colorized_equations:
                writer.writerow(
                    [
                        item.path,
                        colorized_equation.i,
                        colorized_equation.tex,
                        colorized_equation.hue,
                    ]
                )
