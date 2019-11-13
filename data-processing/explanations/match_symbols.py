from typing import List

from explanations.types import Match, Matches, Symbol, SymbolId, SymbolWithId


def match_symbols(symbols_with_ids: List[SymbolWithId]) -> Matches:
    matches: Matches = {}
    for symbol_with_id in symbols_with_ids:
        symbol_id = symbol_with_id.symbol_id
        symbol = symbol_with_id.symbol
        _find_matches(symbol_id, symbol, symbols_with_ids, matches)

    return matches


def _find_matches(
    ancestor_id: SymbolId,
    descendant: Symbol,
    symbols_with_ids: List[SymbolWithId],
    matches: Matches,
) -> None:
    for other_symbol_with_id in symbols_with_ids:
        other_symbol_id = other_symbol_with_id.symbol_id
        other_symbol = other_symbol_with_id.symbol
        if other_symbol is descendant:
            continue

        if other_symbol.mathml == descendant.mathml:
            _add_match(matches, ancestor_id, other_symbol_id, other_symbol.mathml)

    for descendant_child in descendant.children:
        _find_matches(ancestor_id, descendant_child, symbols_with_ids, matches)


def _add_match(
    matches: Matches, symbol_id: SymbolId, matching_symbol_id: SymbolId, mathml: str
) -> None:
    if not symbol_id in matches:
        matches[symbol_id] = []
    matches[symbol_id].append(Match(matching_symbol_id, mathml))
