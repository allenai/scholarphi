from dataclasses import dataclass
from typing import Optional

from common.types import SerializableEntity


@dataclass(frozen=True)
class Term(SerializableEntity):
    text: str
    sentence_id: str

    type_: Optional[str]
    " Type of term (e.g., symbol, protologism, abbreviation). "

    confidence: Optional[float]


@dataclass(frozen=True)
class Definition(SerializableEntity):
    text: str
    sentence_id: str

    definiendum: str
    " The term that this definition defines. "

    term_id: str
    " ID of the term this definition defines. "

    type_: Optional[str]
    " Type of definition (e.g., nickname, expansion, definition). "

    intent: bool
    " Whether this definition is high enough quality to extract. "

    confidence: Optional[float]
