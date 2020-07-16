from dataclasses import dataclass
from typing import List

from common.types import SerializableEntity


@dataclass(frozen=True)
class Term(SerializableEntity):
    name: str
    definitions: List[str]
    " List of definitions, each coming from a different source. "
    sources: List[str]
    """
    List of sources, one per definition. To find the source for a definition, look for the source
    with the same index as the definition.
    """


@dataclass(frozen=True)
class GlossaryTerm:
    name: str
    definition: str
    source: str
