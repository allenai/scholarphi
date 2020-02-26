import csv
import logging
import os.path
from abc import abstractmethod
from argparse import ArgumentParser
from dataclasses import dataclass
from typing import Any, Iterator, List

from common.colorize_tex import ColorizedEntity, colorize_equations
from common.directories import (
    get_data_subdirectory_for_arxiv_id,
    get_data_subdirectory_for_iteration,
    get_iteration_id,
)
from common.file_utils import clean_directory, find_files, read_file_tolerant
from common.types import AbsolutePath, ArxivId, FileContents, Path, RelativePath
from common.unpack import unpack
from common import directories
from command.command import ArxivBatchCommand, add_one_entity_at_a_time_arg


@dataclass(frozen=True)
class ColorizationTask:
    arxiv_id: ArxivId
    tex_path: RelativePath
    file_contents: FileContents


@dataclass(frozen=True)
class ColorizationResult:
    iteration: int
    tex: str
    colorized_entities: List[ColorizedEntity]


class ColorizeEntitiesCommand(ArxivBatchCommand[ColorizationTask, ColorizationResult]):
    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        super(ColorizeEntitiesCommand, ColorizeEntitiesCommand).init_parser(parser)
        add_one_entity_at_a_time_arg(parser)

    def get_arxiv_ids_dir(self) -> Path:
        return directories.SOURCES_DIR

    @abstractmethod
    def get_output_base_dir(self) -> AbsolutePath:
        """
        Path to the data directory where colorized TeX and results should be written.
        """

    @abstractmethod
    def get_entity_identifier(self, entity: ColorizedEntity) -> List[Any]:
        """
        Get identifying information for a colorized entity that will be written to CSV row.
        """

    @abstractmethod
    def get_entity_info(self, entity: ColorizedEntity) -> List[Any]:
        """
        Create a list of additional fields that will be written to CSV for this entity.
        """

    def load(self) -> Iterator[ColorizationTask]:
        for arxiv_id in self.arxiv_ids:

            output_root = get_data_subdirectory_for_arxiv_id(
                self.get_output_base_dir(), arxiv_id
            )
            clean_directory(output_root)

            original_sources_path = directories.sources(arxiv_id)
            for tex_path in find_files(original_sources_path, [".tex"], relative=True):
                file_contents = read_file_tolerant(
                    os.path.join(original_sources_path, tex_path)
                )
                if file_contents is not None:
                    yield ColorizationTask(arxiv_id, tex_path, file_contents)

    def save(self, item: ColorizationTask, result: ColorizationResult) -> None:
        iteration = result.iteration
        colorized_tex = result.tex
        colorized_entities = result.colorized_entities

        iteration_id = get_iteration_id(item.tex_path, iteration)
        output_sources_path = get_data_subdirectory_for_iteration(
            self.get_output_base_dir(), item.arxiv_id, iteration_id,
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
            with open(hues_path, "a", encoding="utf-8") as hues_file:
                writer = csv.writer(hues_file, quoting=csv.QUOTE_ALL)
                for entity in colorized_entities:
                    try:
                        writer.writerow(
                            [item.tex_path]
                            + self.get_entity_identifier(entity)
                            + [str(entity.hue), entity.tex]
                            + self.get_entity_info(entity)
                        )
                    except Exception:  # pylint: disable=broad-except
                        logging.warning(
                            "Couldn't write row for equation for arXiv %s: can't be converted to utf-8",
                            item.arxiv_id,
                        )


class ColorizeSentencesCommand(ColorizeEntitiesCommand):
    @staticmethod
    def get_name() -> str:
        return "colorize-sentences"

    @staticmethod
    def get_description() -> str:
        return "Instrument TeX to colorize sentences."

    @staticmethod
    def get_entity_type() -> str:
        return "symbols"

    def get_output_base_dir(self) -> AbsolutePath:
        return directories.SOURCES_WITH_COLORIZED_SENTENCES_DIR

    def process(self, item: ColorizationTask) -> Iterator[ColorizationResult]:
        batch_size = 1 if self.args.one_entity_at_a_time else None
        for i, batch in enumerate(
            colorize_equations(item.file_contents.contents, batch_size=batch_size)
        ):
            yield ColorizationResult(i, batch.tex, batch.entities)

    def get_entity_identifier(self, entity: ColorizedEntity) -> List[Any]:
        return list(entity.identifier.values())

    @abstractmethod
    def get_entity_info(self, entity: ColorizedEntity) -> List[Any]:
        return [entity.data["start"], entity.data["end"], entity.data["text"]]
