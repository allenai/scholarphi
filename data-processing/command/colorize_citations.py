import csv
import logging
import os.path
from argparse import ArgumentParser
from typing import Iterator, List, NamedTuple

from common import directories
from common.colorize_tex import ColorizedCitation, colorize_citations
from common.directories import (
    get_data_subdirectory_for_arxiv_id,
    get_data_subdirectory_for_iteration,
    get_iteration_id,
)
from common.file_utils import clean_directory, find_files, read_file_tolerant
from common.types import ArxivId, FileContents, Path, RelativePath
from common.unpack import unpack
from command.command import ArxivBatchCommand, add_one_entity_at_a_time_arg


class ColorizationTask(NamedTuple):
    arxiv_id: ArxivId
    tex_path: RelativePath
    file_contents: FileContents
    bibitem_keys: List[str]


class ColorizationResult(NamedTuple):
    iteration: int
    tex: str
    colorized_citations: List[ColorizedCitation]


class ColorizeCitations(ArxivBatchCommand[ColorizationTask, ColorizationResult]):
    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        super(ColorizeCitations, ColorizeCitations).init_parser(parser)
        add_one_entity_at_a_time_arg(parser)

    @staticmethod
    def get_name() -> str:
        return "colorize-citations"

    @staticmethod
    def get_description() -> str:
        return "Instrument TeX to colorize citations."

    @staticmethod
    def get_entity_type() -> str:
        return "citations"

    def get_arxiv_ids_dir(self) -> Path:
        return directories.SOURCES_DIR

    def load(self) -> Iterator[ColorizationTask]:
        for arxiv_id in self.arxiv_ids:

            output_root = get_data_subdirectory_for_arxiv_id(
                directories.SOURCES_WITH_COLORIZED_CITATIONS_DIR, arxiv_id
            )
            clean_directory(output_root)

            bibitem_keys: List[str] = []
            bibitems_path = os.path.join(directories.bibitems(arxiv_id), "bibitems.csv")
            if not os.path.exists(bibitems_path):
                logging.warning(
                    "No bibitems were found for paper %s. Skipping", arxiv_id
                )
                continue

            with open(bibitems_path, encoding="utf-8") as bibitems_file:
                reader = csv.reader(bibitems_file)
                bibitem_keys = [row[0] for row in reader]

            original_sources_path = directories.sources(arxiv_id)
            for tex_path in find_files(original_sources_path, [".tex"], relative=True):
                file_contents = read_file_tolerant(
                    os.path.join(original_sources_path, tex_path)
                )
                if file_contents is not None:
                    yield ColorizationTask(
                        arxiv_id, tex_path, file_contents, bibitem_keys
                    )

    def process(self, item: ColorizationTask) -> Iterator[ColorizationResult]:
        batch_size = 1 if self.args.one_entity_at_a_time else None
        for i, batch in enumerate(
            colorize_citations(
                item.file_contents.contents, item.bibitem_keys, batch_size=batch_size
            )
        ):
            yield ColorizationResult(i, batch.tex, batch.citations)

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
                                colorized_citation.key,
                            ]
                        )
                    except Exception:  # pylint: disable=broad-except
                        logging.warning(
                            "Couldn't write row for citation for arXiv %s: can't be converted to utf-8",
                            item.arxiv_id,
                        )
