from typing import List, Dict

from dataclasses import dataclass
from common.types import ArxivId, SymbolWithId, SymbolId, BoundingBox, Matches, S2Id

@dataclass(frozen=True)
class SymbolKey:
    arxiv_id: ArxivId
    tex_path: str
    equation_index: int
    token_index: int


@dataclass(frozen=True)
class SentenceKey:
    tex_path: str
    sentence_id: str


@dataclass(frozen=True)
class SymbolData:
    arxiv_id: ArxivId
    s2_id: S2Id
    symbols_with_ids: List[SymbolWithId]
    boxes: Dict[SymbolId, BoundingBox]
    symbol_sentence_model_ids: Dict[SymbolId, str]
    matches: Matches
