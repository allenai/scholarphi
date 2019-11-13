from explanations.match_symbols import Match, match_symbols
from explanations.types import Symbol, SymbolId, SymbolWithId

DEFAULT_TEX_PATH = "tex-path"
DEFAULT_EQUATION_INDEX = 0


def match(symbol_index: int, mathml: str):
    return Match(symbol_id(symbol_index), mathml)


def symbol_id(symbol_index: int):
    return SymbolId(DEFAULT_TEX_PATH, DEFAULT_EQUATION_INDEX, symbol_index)


def symbol(mathml: str):
    return Symbol([], mathml, [])


def symbol_with_id(symbol_index: int, mathml: str):
    return SymbolWithId(symbol_id(symbol_index), symbol(mathml))


def test_no_match_self():
    symbols_with_ids = [symbol_with_id(0, "<mathml>")]
    matches = match_symbols(symbols_with_ids)
    assert matches == {}


def test_exact_match():
    symbols_with_ids = [
        symbol_with_id(0, "<same-mathml>"),
        symbol_with_id(1, "<same-mathml>"),
    ]
    matches = match_symbols(symbols_with_ids)
    assert matches[symbol_id(0)] == [match(1, "<same-mathml>")]
    assert matches[symbol_id(1)] == [match(0, "<same-mathml>")]


def test_match_symbols_that_match_child():
    parent = symbol("<parent-mathml>")
    child = symbol("<child-mathml>")
    parent.children.append(child)
    symbol_with_child_mathml = symbol("<child-mathml>")
    symbols_with_ids = [
        SymbolWithId(symbol_id(0), parent),
        SymbolWithId(symbol_id(1), child),
        SymbolWithId(symbol_id(2), symbol_with_child_mathml),
    ]

    matches = match_symbols(symbols_with_ids)
    assert matches[symbol_id(0)] == [match(2, "<child-mathml>")]


def test_rank_exact_matches_before_child_matches():
    parent = symbol("<parent-mathml>")
    symbol_with_parent_mathml = symbol("<parent-mathml>")
    child = symbol("<child-mathml>")
    parent.children.append(child)
    symbol_with_child_mathml = symbol("<child-mathml>")
    symbols_with_ids = [
        SymbolWithId(symbol_id(0), parent),
        SymbolWithId(symbol_id(1), symbol_with_parent_mathml),
        SymbolWithId(symbol_id(2), child),
        SymbolWithId(symbol_id(3), symbol_with_child_mathml),
    ]

    matches = match_symbols(symbols_with_ids)
    assert matches[symbol_id(0)] == [
        match(1, "<parent-mathml>"),
        match(3, "<child-mathml>"),
    ]


def test_match_symbols_that_match_descendant():
    ancestor = symbol("<ancestor-mathml>")
    child = symbol("<child-mathml>")
    ancestor.children.append(child)
    grandchild = symbol("<grandchild-mathml>")
    child.children.append(grandchild)
    symbol_with_grandchild_mathml = symbol("<grandchild-mathml>")
    symbols_with_ids = [
        SymbolWithId(symbol_id(0), ancestor),
        SymbolWithId(symbol_id(1), child),
        SymbolWithId(symbol_id(2), grandchild),
        SymbolWithId(symbol_id(3), symbol_with_grandchild_mathml),
    ]

    matches = match_symbols(symbols_with_ids)
    assert matches[symbol_id(0)] == [match(3, "<grandchild-mathml>")]
