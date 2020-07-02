from dataclasses import dataclass
from typing import Dict, List

from common.types import ArxivId, BoundingBox, Matches, S2Id, SymbolId, SymbolWithId

SentenceId = str


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
    symbol_sentences: Dict[SymbolId, SentenceKey]
    matches: Matches
