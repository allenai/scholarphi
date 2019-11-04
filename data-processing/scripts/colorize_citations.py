import csv
import json
import logging
import os.path
from typing import Iterator, List, NamedTuple

from explanations import directories
from explanations.colorize_tex import colorize_citations
from explanations.directories import (
    get_arxiv_ids,
    get_data_subdirectory_for_arxiv_id,
    get_data_subdirectory_for_iteration,
    get_iteration_id,
)
from explanations.file_utils import clean_directory, find_files, read_file_tolerant
from explanations.parse_tex import TexSoupParseError
from explanations.types import ColorizedCitation, FileContents
from explanations.unpack import unpack
from scripts.command import Command


class ColorizationResult(NamedTuple):
    iteration: int
    tex: str
    colorized_citations: List[ColorizedCitation]


class ColorizeCitations(Command[FileContents, ColorizationResult]):
    @staticmethod
    def get_name() -> str:
        return "colorize-citations"

    @staticmethod
    def get_description() -> str:
        return "Instrument TeX to colorize citations."

    def load(self) -> Iterator[FileContents]:
        for arxiv_id in get_arxiv_ids(directories.SOURCES_DIR):

            output_root = get_data_subdirectory_for_arxiv_id(
                directories.SOURCES_WITH_COLORIZED_CITATIONS_DIR, arxiv_id
            )
            clean_directory(output_root)

            original_sources_path = directories.sources(arxiv_id)
            for text_path in find_files(original_sources_path, [".tex"], relative=True):
                contents = read_file_tolerant(
                    os.path.join(original_sources_path, text_path)
                )
                if contents is not None:
                    yield FileContents(arxiv_id, text_path, contents)

    def process(self, item: FileContents) -> Iterator[ColorizationResult]:
        try:
            for i, batch in enumerate(colorize_citations(item.contents)):
                yield ColorizationResult(i, batch.tex, batch.colorized_citations)
        except TexSoupParseError as e:
            logging.error(
                "Failed to parse TeX file %s for arXiv ID %s: %s",
                item.path,
                item.arxiv_id,
                e,
            )

    def save(self, item: FileContents, result: ColorizationResult) -> None:
        iteration = result.iteration
        colorized_tex = result.tex
        colorized_citations = result.colorized_citations

        iteration_id = get_iteration_id(item.path, iteration)
        output_sources_path = get_data_subdirectory_for_iteration(
            directories.SOURCES_WITH_COLORIZED_CITATIONS_DIR,
            item.arxiv_id,
            iteration_id,
        )
        logging.debug("Outputting to %s", output_sources_path)

        # Create new directory for each colorization iteration for each TeX file.
        unpack_path = unpack(item.arxiv_id, output_sources_path)
        sources_unpacked = unpack_path is not None
        if unpack_path is None:
            logging.warning("Could not unpack sources into %s", output_sources_path)

        if sources_unpacked:
            tex_path = os.path.join(output_sources_path, item.path)
            with open(tex_path, "w") as tex_file:
                tex_file.write(colorized_tex)

            hues_path = os.path.join(output_sources_path, "citation_hues.csv")
            with open(hues_path, "a") as hues_file:
                writer = csv.writer(hues_file, quoting=csv.QUOTE_ALL)
                for colorized_citation in colorized_citations:
                    writer.writerow(
                        [
                            item.path,
                            iteration_id,
                            colorized_citation.hue,
                            json.dumps(colorized_citation.keys),
                        ]
                    )
