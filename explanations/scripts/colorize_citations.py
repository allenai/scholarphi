import csv
import json
import logging
import os.path
from typing import Iterator, List, NamedTuple

from explanations import directories
from explanations.directories import (
    SOURCES_DIR,
    SOURCES_WITH_COLORIZED_CITATIONS_DIR,
    get_arxiv_ids,
)
from explanations.file_utils import find_files
from explanations.instrument_tex import colorize_citations
from explanations.scrape_tex import TexSoupParseError
from explanations.types import ColorizedCitation, FileContents
from explanations.unpack import unpack
from scripts.command import Command


class TexWithColorizedCitations(NamedTuple):
    tex: str
    colorized_citations: List[ColorizedCitation]


class ColorizeCitations(Command[FileContents, TexWithColorizedCitations]):
    @staticmethod
    def get_name() -> str:
        return "colorize-citations"

    @staticmethod
    def get_description() -> str:
        return "Instrument TeX to colorize citations."

    def load(self) -> Iterator[FileContents]:
        for arxiv_id in get_arxiv_ids(SOURCES_DIR):
            # Unpack the sources into a new directory.
            unpack_path = unpack(arxiv_id, SOURCES_WITH_COLORIZED_CITATIONS_DIR)
            if unpack_path is None:
                continue

            colorized_equations_path = directories.sources_with_colorized_citations(
                arxiv_id
            )
            for absolute_tex_path in find_files(colorized_equations_path, [".tex"]):
                relative_tex_path = os.path.relpath(
                    absolute_tex_path, os.path.abspath(colorized_equations_path)
                )
                with open(absolute_tex_path) as tex_file:
                    contents = tex_file.read()
                    yield FileContents(arxiv_id, relative_tex_path, contents)

    def process(self, item: FileContents) -> Iterator[TexWithColorizedCitations]:
        try:
            colorized_tex, colorized_citations = colorize_citations(item.contents)
            yield TexWithColorizedCitations(colorized_tex, colorized_citations)
        except TexSoupParseError as e:
            logging.error(
                "Failed to parse TeX file %s for arXiv ID %s: %s",
                item.path,
                item.arxiv_id,
                e,
            )

    def save(self, item: FileContents, result: TexWithColorizedCitations) -> None:
        colorized_tex = result.tex
        colorized_citations = result.colorized_citations

        tex_path = os.path.join(
            directories.sources_with_colorized_citations(item.arxiv_id), item.path
        )
        with open(tex_path, "w") as tex_file:
            tex_file.write(colorized_tex)

        hues_path = os.path.join(
            directories.sources_with_colorized_citations(item.arxiv_id),
            "citation_hues.csv",
        )
        with open(hues_path, "a") as hues_file:
            writer = csv.writer(hues_file, quoting=csv.QUOTE_ALL)
            for colorized_citation in colorized_citations:
                writer.writerow(
                    [
                        item.path,
                        colorized_citation.hue,
                        json.dumps(colorized_citation.keys),
                    ]
                )
