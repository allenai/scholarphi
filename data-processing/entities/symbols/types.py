from dataclasses import dataclass
from typing import Dict, List

from common.types import ArxivId, BoundingBox, Matches, S2Id, SymbolId, SymbolWithId
from entities.sentences.types import Context


@dataclass(frozen=True)
class SymbolKey:
    arxiv_id: ArxivId
    tex_path: str
    equation_index: int
    token_index: int


@dataclass(frozen=True)
class SymbolData:
    arxiv_id: ArxivId
    s2_id: S2Id
    symbols_with_ids: List[SymbolWithId]
    boxes: Dict[SymbolId, BoundingBox]
    symbol_contexts: Dict[SymbolId, Context]
    matches: Matches
