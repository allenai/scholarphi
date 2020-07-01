import re
from typing import cast

from common.parse_tex import EquationExtractor
from common.types import CharacterRange, SerializableEntity

from .types import Definition


def get__color_positions(entity: SerializableEntity) -> CharacterRange:
    """
    Color commands sometimes introduce unwanted space when added right before or after an equation.
    One solution is to put color commands right inside the equation.
    """

    definition = cast(Definition, entity)

    equation_extractor = EquationExtractor()

    #TODO This needs to be implmeented
    return None
