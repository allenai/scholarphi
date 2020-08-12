from dataclasses import dataclass
from typing import List

from common.types import SerializableEntity


@dataclass(frozen=True)
class Sentence(SerializableEntity):
    text: str
    cleaned_text: str
    extended_tex: str
    is_sentence: bool # TODO @dykang this field should be deleted once we have a stable extractor
    current_section: str
    # is_iffalse: bool
    is_sentence_in_figure: str
    is_sentence_in_table: str
    is_sentence_in_itemize: str
    #commented below for errors in cast typing in line 128 in common/file_utils.py

    # label: List[str]
    # ref: List[str]
    # cite: List[str]
    # symbol: List[str]
    # url: List[str]
    # others: List[str]
