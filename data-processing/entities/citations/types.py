from dataclasses import dataclass

from common.types import SerializableEntity


@dataclass(frozen=True)
class Bibitem(SerializableEntity):
    """
    The 'id_' field of a Bibitem should be the key of the bibitem.

    For bibitems, the start and end position in TeX should be set to -1 (an invalid value)
    because they don't have a position in the TeX. This doesn't cause errors in the
    pipeline because a custom colorization function is used for citations. A custom
    colorization function is desired because citations are colorized dynamically by running
    some setup commands in the document preamble, instead of surrounding ranges of text
    for each entity with colorization commands.
    """

    text: str
    " Plaintext extracted for bibitem. "


@dataclass(frozen=True)
class BibitemMatch:
    key: str
    bibitem_text: str
    s2_id: str
    s2_title: str
    similarity_score: float
