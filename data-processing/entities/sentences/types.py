from dataclasses import dataclass

from common.types import SerializableEntity


@dataclass(frozen=True)
class Sentence(SerializableEntity):
    text: str
    cleaned_text: str
    is_sentence: bool
    current_section: str
    current_figure: str
    current_table: str
    label: str
    ref: str
    cite: str
    symbol: str
    others: str

