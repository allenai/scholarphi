from typing import cast

from common.commands.base import CommandList
from common.commands.utils import create_entity_localization_command_sequence
from common.parse_tex import EquationExtractor
from common.types import CharacterRange, Equation, SerializableEntity
from entities.common import EntityPipeline


def colorize_equation_when(entity: SerializableEntity) -> bool:
    equation = cast(Equation, entity)
    return equation.depth == 0


def get_equation_color_positions(entity: SerializableEntity) -> CharacterRange:
    equation = cast(Equation, entity)
    return CharacterRange(equation.content_start, equation.content_end)


commands = create_entity_localization_command_sequence(
    "equations",
    EquationExtractor,
    Equation,
    colorize_equation_when,
    get_equation_color_positions,
)

equations_pipeline = EntityPipeline("equations", commands)
