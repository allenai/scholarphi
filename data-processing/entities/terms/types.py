from dataclasses import dataclass
from typing import List, Union

from common.types import SerializableEntity


@dataclass(frozen=True)
class Term(SerializableEntity):
    name: str
    definition: str


@dataclass(frozen=True)
class GlossaryTerm:
    name: str
    definition: str
    source: str
