import logging
import os.path
from abc import ABC, abstractmethod
from argparse import ArgumentParser
from dataclasses import dataclass
from typing import Iterator, List, Optional, Tuple, Type, cast

from command.command import ArxivBatchCommand, add_one_entity_at_a_time_arg
from common import directories, file_utils
from common.colorize_tex import ColorPositionsFunc, ColorWhenFunc, colorize_entities
from common.types import (
    ArxivId,
    CharacterRange,
    ColorizationRecord,
    Equation,
    FileContents,
    Hue,
    RelativePath,
    SerializableEntity,
)
from common.unpack import unpack


@dataclass(frozen=True)
class ColorizationTask:
    arxiv_id: ArxivId
    tex_path: RelativePath
    file_contents: FileContents
    entities: List[SerializableEntity]


@dataclass(frozen=True)
class ColorizationResult:
    iteration: int
    tex: str
    entity_hues: List[Tuple[Hue, SerializableEntity]]


class ColorizeTexCommand(ArxivBatchCommand[ColorizationTask, ColorizationResult], ABC):
    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        super(ColorizeTexCommand, ColorizeTexCommand).init_parser(parser)
        add_one_entity_at_a_time_arg(parser)

    @abstractmethod
    def get_detected_entities_dirkey(self) -> str:
        """
        Key for the data directory containing a list of detected entities to colorize.
        """

    @abstractmethod
    def get_output_base_dirkey(self) -> str:
        """
        Key for the data directory where colorized TeX and entity hues should be written.
        """

    @staticmethod
    def get_detected_entity_type() -> Type[SerializableEntity]:
        """
        Override this method if you need access to entity data that are present on a subclass of
        'SerializableEntity'. For example, if you need colorization to occur only when equations
        have a specific depth, this function should return the 'Equation' type, so that the 'when'
        colorization callback can have access to the 'depth' property.
        """
        return SerializableEntity

    @staticmethod
    def when(entity: SerializableEntity) -> bool:  # pylint: disable=unused-argument
        """
        Override this to set a custom filter for when to colorize entities. One example is that
        for equations, you may only want to colorize outer equations, and not nested equations.
        """
        return True

    @staticmethod
    def get_color_positions(entity: SerializableEntity) -> CharacterRange:
        """
        Override this when you want to set custom positions for inserting color commands. One
        example is for equations, where color commands should be inserted inside the bounds of
        the equation, rather than outside of it.
        """
        return CharacterRange(start=entity.start, end=entity.end)

    def load(self) -> Iterator[ColorizationTask]:
        for arxiv_id in self.arxiv_ids:
            output_root = directories.arxiv_subdir(
                self.get_output_base_dirkey(), arxiv_id
            )
            file_utils.clean_directory(output_root)

            entities_path = os.path.join(
                directories.arxiv_subdir(self.get_detected_entities_dirkey(), arxiv_id),
                "entities.csv",
            )
            entities = list(
                file_utils.load_from_csv(entities_path, self.get_detected_entity_type())
            )

            original_sources_path = directories.arxiv_subdir("sources", arxiv_id)
            for tex_path in file_utils.find_files(
                original_sources_path, [".tex"], relative=True
            ):
                file_contents = file_utils.read_file_tolerant(
                    os.path.join(original_sources_path, tex_path)
                )
                entities_for_tex_path = [e for e in entities if e.tex_path == tex_path]
                if file_contents is not None:
                    yield ColorizationTask(
                        arxiv_id, tex_path, file_contents, entities_for_tex_path
                    )

    def process(self, item: ColorizationTask) -> Iterator[ColorizationResult]:
        batch_size = 1 if self.args.one_entity_at_a_time else None
        for i, batch in enumerate(
            colorize_entities(
                tex=item.file_contents.contents,
                when=self.when,
                get_color_positions=self.get_color_positions,
                entities=item.entities,
                batch_size=batch_size,
            )
        ):
            yield ColorizationResult(i, batch.tex, batch.entity_hues)

    def save(self, item: ColorizationTask, result: ColorizationResult) -> None:
        iteration = result.iteration
        colorized_tex = result.tex
        entity_hues = result.entity_hues

        iteration_id = directories.tex_iteration(item.tex_path, str(iteration))
        output_sources_path = directories.iteration(
            self.get_output_base_dirkey(), item.arxiv_id, iteration_id,
        )
        logging.debug("Outputting to %s", output_sources_path)

        # Each colorization batch gets a new sources directory.
        unpack_path = unpack(item.arxiv_id, output_sources_path)
        sources_unpacked = unpack_path is not None
        if unpack_path is None:
            logging.warning("Could not unpack sources into %s", output_sources_path)

        if sources_unpacked:
            # Rewrite the TeX with the colorized TeX.
            tex_path = os.path.join(output_sources_path, item.tex_path)
            with open(tex_path, "w", encoding=item.file_contents.encoding) as tex_file:
                tex_file.write(colorized_tex)

            # Save a log of which hues were assigned to which entities.
            hues_path = os.path.join(output_sources_path, "entity_hues.csv")
            for (hue, entity) in entity_hues:
                file_utils.append_to_csv(
                    hues_path,
                    ColorizationRecord(
                        tex_path=item.tex_path,
                        iteration=str(iteration),
                        hue=hue,
                        entity_id=entity.id_,
                    ),
                )


def make_colorize_tex_command(
    entity_name: str,
    entity_type: str,
    detected_entity_type: Optional[Type[SerializableEntity]] = None,
    when: Optional[ColorWhenFunc] = None,
    get_color_positions: Optional[ColorPositionsFunc] = None,
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

        @staticmethod
        def get_detected_entity_type() -> Type[SerializableEntity]:
            if detected_entity_type is None:
                return super(C, C).get_detected_entity_type()
            return detected_entity_type

        @staticmethod
        def when(entity: SerializableEntity) -> bool:
            if when is None:
                return super(C, C).when(entity)
            return when(entity)

        @staticmethod
        def get_color_positions(entity: SerializableEntity) -> CharacterRange:
            if get_color_positions is None:
                return super(C, C).get_color_positions(entity)
            return get_color_positions(entity)

        def get_arxiv_ids_dirkey(self) -> str:
            return self.get_detected_entities_dirkey()

        def get_detected_entities_dirkey(self) -> str:
            return f"detected-{entity_name}"

        def get_output_base_dirkey(self) -> str:
            return f"sources-with-colorized-{entity_name}"

    return C


def colorize_equation_when(entity: SerializableEntity) -> bool:
    equation = cast(Equation, entity)
    return equation.depth == 0


def get_equation_color_positions(entity: SerializableEntity) -> CharacterRange:
    equation = cast(Equation, entity)
    return CharacterRange(equation.content_start, equation.content_end)


ColorizeEquations = make_colorize_tex_command(
    entity_name="equations",
    entity_type="symbols",
    detected_entity_type=Equation,
    when=colorize_equation_when,
    get_color_positions=get_equation_color_positions,
)
