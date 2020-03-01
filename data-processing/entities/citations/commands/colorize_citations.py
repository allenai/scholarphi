import logging
import os.path
from argparse import ArgumentParser
from dataclasses import dataclass
from typing import Iterator, List

from common import directories, file_utils
from common.colorize_tex import ColorizedCitation, colorize_citations
from common.commands.base import ArxivBatchCommand, add_one_entity_at_a_time_arg
from common.types import (
    ArxivId,
    Bibitem,
    ColorizationRecord,
    FileContents,
    RelativePath,
)
from common.unpack import unpack


@dataclass(frozen=True)
class ColorizationTask:
    arxiv_id: ArxivId
    tex_path: RelativePath
    file_contents: FileContents
    bibitem_keys: List[str]


@dataclass(frozen=True)
class ColorizationResult:
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

    def get_arxiv_ids_dirkey(self) -> str:
        return "sources"

    def load(self) -> Iterator[ColorizationTask]:
        for arxiv_id in self.arxiv_ids:

            output_root = directories.arxiv_subdir(
                "sources-with-colorized-citations", arxiv_id
            )
            file_utils.clean_directory(output_root)

            bibitems_path = os.path.join(
                directories.arxiv_subdir("bibitems", arxiv_id), "bibitems.csv"
            )
            if not os.path.exists(bibitems_path):
                logging.warning(
                    "No bibitems were found for paper %s. Skipping", arxiv_id
                )
                continue

            bibitems = file_utils.load_from_csv(bibitems_path, Bibitem)
            bibitem_keys = [b.key for b in bibitems if b.key is not None]

            original_sources_path = directories.arxiv_subdir("sources", arxiv_id)
            for tex_path in file_utils.find_files(
                original_sources_path, [".tex"], relative=True
            ):
                file_contents = file_utils.read_file_tolerant(
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

        iteration_id = directories.tex_iteration(item.tex_path, str(iteration))
        output_sources_path = directories.iteration(
            "sources-with-colorized-citations", item.arxiv_id, iteration_id,
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

            hues_path = os.path.join(output_sources_path, "entity_hues.csv")

            # TODO(andrewhead): It might be better to save this CSV data with the same
            # encoding as the file the TeX was read from, for the citations, for the
            # equations, and for the symbols. There might be some gotchas for character
            # positions not lining up between the ones we save using Unicode here and the
            # positions in the intended encoding in the original files.
            for c in colorized_citations:
                record = ColorizationRecord(
                    hue=c.hue,
                    entity_id=c.key,
                    tex_path=item.tex_path,
                    iteration=iteration_id,
                )
                file_utils.append_to_csv(hues_path, record)
