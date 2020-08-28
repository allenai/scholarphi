from dataclasses import dataclass
from typing import Dict, List, Set

from common.types import ArxivId, BoundingBox, Matches, S2Id, SymbolId, SymbolWithId
from entities.sentences.types import Context


@dataclass(frozen=True)
class SymbolKey:
    arxiv_id: ArxivId
    tex_path: str
    equation_index: int
    token_index: int


MathMl = str


@dataclass(frozen=True)
class DefiningFormula:
    tex: str
    tex_path: str
    equation_id: str


@dataclass(frozen=True)
class SymbolData:
    arxiv_id: ArxivId
    s2_id: S2Id
    symbols_with_ids: List[SymbolWithId]
    boxes: Dict[SymbolId, BoundingBox]
    symbol_contexts: Dict[SymbolId, Context]
    symbol_formulas: Dict[SymbolId, DefiningFormula]
    mathml_contexts: Dict[MathMl, List[Context]]
    mathml_formulas: Dict[MathMl, Set[DefiningFormula]]
    matches: Matches
