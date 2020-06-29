from dataclasses import dataclass

from common.types import SerializableEntity


@dataclass(frozen=True)
class Sentence(SerializableEntity):
    text: str
    extended_tex: str
    is_sentence: bool # TODO @dykang this field should be deleted once we have a stable extractor
    current_section: str
    is_sentence_in_figure: str
    is_sentence_in_table: str
    label: str
    ref: str
    cite: str
    symbol: str
    others: str
