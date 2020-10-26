from dataclasses import dataclass
from typing import List, Optional

from common.string import JournaledString
from common.types import SerializableEntity, Term
from entities.sentences.types import Sentence


@dataclass(frozen=True)
class EmbellishedSentence(Sentence):
    """
    A sentence embellished with additional text to make it easier to detect definitions. For
    example, one embellishment is surrounding all top-level symbols in a clear delimiter.
    Should share the same 'tex_path' and 'id_' as the sentence it was derived from.
    All embellishments are accompanied with a JournaledString that can be used to recover
    positions of spans in the embellished sentence back to the original TeX.
    """

    with_symbols_marked: str
    " All top-level symbols replaced with (((SYMBOL:<TeX>))). "
    with_symbols_marked_journal: JournaledString

    legacy_definition_input: str
    " All equations replaced with 'SYMBOL'. "
    legacy_definition_input_journal: JournaledString


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

    definition_texs: List[str]
    " The original TeX for each definition in 'definitions'. "


@dataclass(frozen=True)
class Definiendum(TermReference):
    " A term that appears in a definition. "

    definition_id: str
    " The ID for the definiens that defines this term. "

    confidence: Optional[float]
