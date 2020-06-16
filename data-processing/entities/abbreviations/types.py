from dataclasses import dataclass

from common.types import SerializableEntity


@dataclass(frozen=True)
class Abbreviation(SerializableEntity):
    text: str
    exp_start: int
    exp_end : int
    expansion : str
