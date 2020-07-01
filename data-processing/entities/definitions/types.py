from dataclasses import dataclass

from common.types import SerializableEntity


@dataclass(frozen=True)
class Definition(SerializableEntity):
    text: str
