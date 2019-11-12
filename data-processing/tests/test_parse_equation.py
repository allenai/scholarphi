import os
import re

from explanations.parse_equation import Character, get_characters, get_symbols
from tests.util import get_test_path


def test_extract_characters():
    with open(get_test_path(os.path.join("mathml", "x_plus_y.xml"))) as mathml_file:
        mathml = mathml_file.read()
        characters = get_characters(mathml)
        assert len(characters) == 2
        assert Character("x", 0, 0, 1) in characters
        assert Character("y", 2, 4, 5) in characters


def test_extract_symbols_for_characters():
    with open(get_test_path(os.path.join("mathml", "x_plus_y.xml"))) as mathml_file:
        mathml = mathml_file.read()
        symbols = get_symbols(mathml)

    assert len(symbols) == 2

    x = list(filter(lambda s: s.characters == [0], symbols))[0]
    assert x.mathml.strip() == "<mi>x</mi>"

    y = list(filter(lambda s: s.characters == [2], symbols))[0]
    assert y.mathml.strip() == "<mi>y</mi>"


def test_extract_symbols_for_subscript():
    with open(get_test_path(os.path.join("mathml", "x_sub_i.xml"))) as mathml_file:
        mathml = mathml_file.read()
        symbols = get_symbols(mathml)

    assert len(symbols) == 3
    x_sub_i = list(filter(lambda s: "msub" in s.mathml, symbols))[0]
    assert re.search(r"<msub>\s*<mi>x</mi>\s*<mi>i</mi>\s*</msub>", x_sub_i.mathml)
    assert len(x_sub_i.characters) == 2
    assert 0 in x_sub_i.characters
    assert 1 in x_sub_i.characters
