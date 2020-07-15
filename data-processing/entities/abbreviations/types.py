from dataclasses import dataclass

from common.types import SerializableEntity


@dataclass(frozen=True)
class Abbreviation(SerializableEntity):
    """
    For this entity, the ID tells us whether it is a full form or short form,
    by the prefix, which will be 'abbreviation' or 'expansion'. If it's an abbreviation
    the ID is "abbreviation-{expansion-index}-{abbreviation-index}". If it's an expansion,
    the ID is "expansion-{expansion-index}".
    """

    text: str
    expansion: str
