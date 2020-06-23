from dataclasses import dataclass

from common.types import SerializableEntity


@dataclass(frozen=True)
class Abbreviation(SerializableEntity):
    text: str
    expansion : str
    str_id : str
