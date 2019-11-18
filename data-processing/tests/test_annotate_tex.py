from explanations.annotate_tex import annotate_symbols_and_equations_for_file
from explanations.types import Character, CharacterId, Symbol, SymbolId

TEX_PATH = "tex-path"
ARBITRARY_MATHML = "<mathml>"


def test_annotate_one_symbol():
    tex = "some text... $x$"
    symbols = {SymbolId(TEX_PATH, 0, 0): Symbol([0], ARBITRARY_MATHML, [])}
    characters = {CharacterId(TEX_PATH, 0, 0): Character("x", 0, 0, 1)}
    annotated_file = annotate_symbols_and_equations_for_file(
        tex, TEX_PATH, symbols, characters
    )
    assert (
        annotated_file.annotated_tex
        == "some text... <<equation>>$<<symbol>>x<</symbol>>$<</equation>>"
    )


def test_annotate_nested_symbols():
    tex = "$x_i$"

    x = Symbol([0], ARBITRARY_MATHML, [])
    i = Symbol([1], ARBITRARY_MATHML, [])
    x_i = Symbol([0, 1], ARBITRARY_MATHML, children=[x, i])

    symbols = {
        SymbolId(TEX_PATH, 0, 0): x_i,
        SymbolId(TEX_PATH, 0, 1): x,
        SymbolId(TEX_PATH, 0, 2): i,
    }
    characters = {
        CharacterId(TEX_PATH, 0, 0): Character("x", 0, 0, 1),
        CharacterId(TEX_PATH, 0, 1): Character("i", 1, 2, 3),
    }
    annotated_file = annotate_symbols_and_equations_for_file(
        tex, TEX_PATH, symbols, characters
    )
    assert annotated_file.annotated_tex == (
        "<<equation>>$"
        + "<<symbol>>"
        + "<<symbol>>x<</symbol>>"
        + "_"
        + "<<symbol>>i<</symbol>>"
        + "<</symbol>>"
        + "$<</equation>>"
    )
