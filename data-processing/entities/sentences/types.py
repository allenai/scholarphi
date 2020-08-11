from dataclasses import dataclass
from typing import List, Optional

from common.string import JournaledString
from common.types import SerializableEntity


@dataclass(frozen=True)
class Sentence(SerializableEntity):
    text: JournaledString
    """
    'text' is specified as a mutable string rather than a string so that the history of how
    the TeX has been mutated into the text can be saved with the string. This is important
    for mapping back entities found in the sentence text back to locations in the original TeX.
    """

    sanitized_text: JournaledString
    section_name: Optional[str]
    in_figure: bool
    in_table: bool
    in_itemize: bool
    label: List[str]
    ref: List[str]
    cite: List[str]
    url: List[str]
    others: List[str]
