from dataclasses import dataclass
from typing import List, Optional

from common.string import JournaledString
from common.types import SerializableEntity


@dataclass(frozen=True)
class Sentence(SerializableEntity):
    text: str
    text_journal: JournaledString
    sanitized: str
    sanitized_journal: JournaledString
    """
    Both 'text' and 'sanitized' are stored in plaintext format, and as a journal that tracks the
    transformations applied to the TeX to turn it into the sentence. This allows later consumers
    of sentences to map back character offsets in each to precise character offsets in the original
    TeX, even if they appear in the middle of the string.
    """

    validity_guess: bool
    """
    A guess as to whether this sentence is really a text sentence. It's a guess, because the
    current heuristics used are not always accurate.
    """

    section_name: Optional[str]
    in_figure: bool
    in_table: bool
    in_itemize: bool
    label: List[str]
    ref: List[str]
    cite: List[str]
    url: List[str]
    others: List[str]


@dataclass(frozen=True)
class Context:
    " A context that an entity appears in within a paper. "
    tex_path: str
    entity_id: str
    " Together, 'tex_path' and 'entity_id' specify the entity that the context is for. "

    sentence_id: str
    " ID of the sentence that the entity appears in. "

    snippet: str
    """
    A snippet of human-readable text optimized to show the entity in context. This may include HTML
    or LaTeX, depending on the context the snippet is meant to appear in.
    """

    neighbor_entity_ids: List[str]
    """
    A list of entity IDs for entities of the same type that also appear in the same sentence. For
    example, this could include IDs of other symbols of the same name in the same sentence.
    """
