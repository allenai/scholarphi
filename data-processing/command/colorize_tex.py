import logging
import os.path
from abc import abstractmethod
from argparse import ArgumentParser
from dataclasses import dataclass
from typing import Iterator, List, Type

from command.command import ArxivBatchCommand, add_one_entity_at_a_time_arg
from common import directories, file_utils
from common.colorize_tex import ColorizedEntity, colorize_entities
from common.parse_tex import EntityExtractor
from common.types import ArxivId, FileContents, RelativePath
from common.unpack import unpack


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


class ColorizeTexCommand(ArxivBatchCommand[ColorizationTask, ColorizationResult]):
    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        super(ColorizeTexCommand, ColorizeTexCommand).init_parser(parser)
        add_one_entity_at_a_time_arg(parser)

    @abstractmethod
    def get_output_base_dirkey(self) -> str:
        """
        Key for the data directory where colorized TeX and results should be written.
        """

    @abstractmethod
    def get_extractor_type(self) -> Type[EntityExtractor]:
        """
        Class for extractor for finding entities in the TeX.
        """

    def load(self) -> Iterator[ColorizationTask]:
        for arxiv_id in self.arxiv_ids:
            output_root = directories.arxiv_subdir(
                self.get_output_base_dirkey(), arxiv_id
            )
            file_utils.clean_directory(output_root)

            original_sources_path = directories.arxiv_subdir("sources", arxiv_id)
            for tex_path in file_utils.find_files(
                original_sources_path, [".tex"], relative=True
            ):
                file_contents = file_utils.read_file_tolerant(
                    os.path.join(original_sources_path, tex_path)
                )
                if file_contents is not None:
                    yield ColorizationTask(arxiv_id, tex_path, file_contents)

    def process(self, item: ColorizationTask) -> Iterator[ColorizationResult]:
        extractor = self.get_extractor_type()()
        batch_size = 1 if self.args.one_entity_at_a_time else None
        for i, batch in enumerate(
            colorize_entities(
                tex=item.file_contents.contents,
                entity_extractor=extractor,
                batch_size=batch_size,
            )
        ):
            yield ColorizationResult(i, batch.tex, batch.entities)

    def save(self, item: ColorizationTask, result: ColorizationResult) -> None:
        iteration = result.iteration
        colorized_tex = result.tex
        colorized_entities = result.colorized_entities

        iteration_id = directories.tex_iteration(item.tex_path, str(iteration))
        output_sources_path = directories.iteration(
            self.get_output_base_dirkey(), item.arxiv_id, iteration_id,
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
            for entity in colorized_entities:
                file_utils.append_to_csv(hues_path, entity)


def make_colorize_tex_command(
    entity_name: str, entity_type: str, ExtractorType: Type[EntityExtractor]
) -> Type[ColorizeTexCommand]:
    class C(ColorizeTexCommand):
        @staticmethod
        def get_name() -> str:
            return f"colorize-{entity_name}"

        @staticmethod
        def get_description() -> str:
            return f"Instrument TeX to colorize {entity_name}."

        @staticmethod
        def get_entity_type() -> str:
            return entity_type

        def get_output_base_dirkey(self) -> str:
            return f"sources-with-colorized-{entity_name}"

        def get_extractor_type(self) -> Type[EntityExtractor]:
            return ExtractorType

    return C
