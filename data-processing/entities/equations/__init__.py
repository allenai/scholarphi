from typing import cast

from common.colorize_tex import ColorizeOptions
from common.commands.base import CommandList
from common.parse_tex import EquationExtractor
from common.types import CharacterRange, Equation, SerializableEntity
from entities.common import create_entity_localization_command_sequence
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from .upload import upload_equations


def colorize_equation_when(entity: SerializableEntity) -> bool:
    equation = cast(Equation, entity)
    return equation.depth == 0


def adjust_color_positions(entity: SerializableEntity) -> CharacterRange:
    equation = cast(Equation, entity)
    return CharacterRange(equation.content_start, equation.content_end)


commands = create_entity_localization_command_sequence(
    "equations",
    EquationExtractor,
    Equation,
    colorize_options=ColorizeOptions(
        when=colorize_equation_when, adjust_color_positions=adjust_color_positions
    ),
    upload_func=upload_equations,
)

equations_pipeline = EntityPipeline("equations", commands)
register_entity_pipeline(equations_pipeline)
