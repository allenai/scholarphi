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

    is_clean: bool
    """
    Another guess as to whether the sentence is a text sentence. Based entirely on the contents of
    the sentence (for example, whether it ends with punctuation, or includes English words).
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
class TexWrapper:
    " Instructions for how to wrap an entity appearance in extracted TeX. "

    before: str
    " Substring to insert before the entity. "

    after: str
    " Substring to insert after the entity. "

    braces: bool = False
    " Whether to wrap the entity in braces. Braces are placed outside 'before' and 'end'. "
