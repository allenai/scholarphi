from dataclasses import dataclass
from typing import List, Optional

from common.types import SerializableEntity, Term


@dataclass(frozen=True)
class Definition(SerializableEntity):
    """
    A passage that defines a term. In many cases, this will only include the definiens---the
    part of a passage that defines the term, and not the defined term itself.
    IDs for definitions should include the 'tex_path', because terms will need to have
    unique references to definitions by their IDs, and terms will not always appear in the
    same TeX file as the definition.
    """

    text: str
    sentence_id: str

    definiendum: str
    " The name of the term that this definition defines. "

    type_: Optional[str]
    " Type of definition (e.g., nickname, expansion, definition). "

    intent: bool
    " Whether this definition is high enough quality to extract. "

    confidence: Optional[float]


@dataclass(frozen=True)
class TermReference(Term):
    " A reference to a defined term in the text. "

    definition_ids: List[str]
    " A list of IDs of definitions found in the text that define this term. "


@dataclass(frozen=True)
class Definiendum(TermReference):
    " A term that appears in a definition. "

    definition_id: str
    " The ID for the definiens that defines this term. "

    confidence: Optional[float]
