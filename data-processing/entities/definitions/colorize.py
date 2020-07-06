import re
from typing import cast

from common.types import CharacterRange, SerializableEntity

from .types import Definition


def get__color_positions(entity: SerializableEntity) -> CharacterRange:
    """
    TBW
    """
    definition = cast(Definition, entity)
    # TODO This needs to be implmeented
    return None
