from dataclasses import dataclass
from typing import List, Optional

from common.types import SerializableEntity


@dataclass(frozen=True)
class Sentence(SerializableEntity):
    text: str
    sanitized_text: str
    section_name: Optional[str]
    in_figure: bool
    in_table: bool
    in_itemize: bool
    label: List[str]
    ref: List[str]
    cite: List[str]
    symbol: List[str]
    url: List[str]
    others: List[str]
