import csv
import json
import logging
import os.path
from typing import Iterator, List, NamedTuple

from explanations import directories
from explanations.colorize_tex import ColorizedEntity, colorize_citations
from explanations.directories import (
    get_data_subdirectory_for_arxiv_id,
    get_data_subdirectory_for_iteration,
    get_iteration_id,
)
from explanations.file_utils import clean_directory, find_files, read_file_tolerant
from explanations.types import ArxivId, FileContents, Path, RelativePath
from explanations.unpack import unpack
from scripts.command import ArxivBatchCommand


class ColorizationTask(NamedTuple):
    arxiv_id: ArxivId
    tex_path: RelativePath
    file_contents: FileContents


class ColorizationResult(NamedTuple):
    iteration: int
    tex: str
    colorized_citations: List[ColorizedEntity]


class ColorizeCitations(ArxivBatchCommand[ColorizationTask, ColorizationResult]):
    @staticmethod
    def get_name() -> str:
        return "colorize-citations"

    @staticmethod
    def get_description() -> str:
        return "Instrument TeX to colorize citations."

    def get_arxiv_ids_dir(self) -> Path:
        return directories.SOURCES_DIR

    def load(self) -> Iterator[ColorizationTask]:
        for arxiv_id in self.arxiv_ids:

            output_root = get_data_subdirectory_for_arxiv_id(
                directories.SOURCES_WITH_COLORIZED_CITATIONS_DIR, arxiv_id
            )
            clean_directory(output_root)

            original_sources_path = directories.sources(arxiv_id)
            for tex_path in find_files(original_sources_path, [".tex"], relative=True):
                file_contents = read_file_tolerant(
                    os.path.join(original_sources_path, tex_path)
                )
                if file_contents is not None:
                    yield ColorizationTask(arxiv_id, tex_path, file_contents)

    def process(self, item: ColorizationTask) -> Iterator[ColorizationResult]:
        for i, batch in enumerate(colorize_citations(item.file_contents.contents)):
            yield ColorizationResult(i, batch.tex, batch.entities)

    def save(self, item: ColorizationTask, result: ColorizationResult) -> None:
        iteration = result.iteration
        colorized_tex = result.tex
        colorized_citations = result.colorized_citations

        iteration_id = get_iteration_id(item.tex_path, iteration)
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
            tex_path = os.path.join(output_sources_path, item.tex_path)
            with open(tex_path, "w", encoding=item.file_contents.encoding) as tex_file:
                tex_file.write(colorized_tex)

            hues_path = os.path.join(output_sources_path, "citation_hues.csv")
            with open(hues_path, "a", encoding="utf-8") as hues_file:
                writer = csv.writer(hues_file, quoting=csv.QUOTE_ALL)
                for colorized_citation in colorized_citations:
                    # TODO(andrewhead): It might be better to save this CSV data with the same
                    # encoding as the file the TeX was read from, for the citations, for the
                    # equations, and for the symbols. There might be some gotchas for character
                    # positions not lining up between the ones we save using Unicode here and the
                    # positions in the intended encoding in the original files.
                    try:
                        writer.writerow(
                            [
                                item.tex_path,
                                iteration_id,
                                colorized_citation.hue,
                                json.dumps(colorized_citation.data["keys"]),
                            ]
                        )
                    except Exception:  # pylint: disable=broad-except
                        logging.warning(
                            "Couldn't write row for citation for arXiv %s: can't be converted to utf-8",
                            item.arxiv_id,
                        )
