import os
import re

from common.parse_equation import Character, get_characters, get_symbols
from tests.util import get_test_path


def test_get_characters():
    with open(get_test_path(os.path.join("mathml", "x_plus_y.xml"))) as mathml_file:
        mathml = mathml_file.read()
        characters = get_characters(mathml)
        assert len(characters) == 2
        assert Character("x", 0, 0, 1) in characters
        assert Character("y", 2, 4, 5) in characters


def test_get_characters_omits_error_nodes():
    with open(get_test_path(os.path.join("mathml", "x_plus_error.xml"))) as mathml_file:
        mathml = mathml_file.read()
        characters = get_characters(mathml)
        assert len(characters) == 1
        assert Character("x", 0, 0, 1) in characters


def test_get_symbols_for_characters():
    with open(get_test_path(os.path.join("mathml", "x_plus_y.xml"))) as mathml_file:
        mathml = mathml_file.read()
        symbols = get_symbols(mathml)

    assert len(symbols) == 2

    x = list(filter(lambda s: s.characters == [0], symbols))[0]
    assert x.mathml.strip() == "<mi>x</mi>"

    y = list(filter(lambda s: s.characters == [2], symbols))[0]
    assert y.mathml.strip() == "<mi>y</mi>"


def test_get_symbols_omits_error_nodes():
    with open(get_test_path(os.path.join("mathml", "x_plus_error.xml"))) as mathml_file:
        mathml = mathml_file.read()
        symbols = get_symbols(mathml)

    assert len(symbols) == 1

    x = list(filter(lambda s: s.characters == [0], symbols))[0]
    assert x.mathml.strip() == "<mi>x</mi>"


def test_get_symbols_for_subscript():
    with open(get_test_path(os.path.join("mathml", "x_sub_i.xml"))) as mathml_file:
        mathml = mathml_file.read()
        symbols = get_symbols(mathml)

    assert len(symbols) == 3
    x_sub_i = list(filter(lambda s: "msub" in s.mathml, symbols))[0]
    assert re.search(r"<msub>\s*<mi>x</mi>\s*<mi>i</mi>\s*</msub>", x_sub_i.mathml)
    assert len(x_sub_i.characters) == 2
    assert 0 in x_sub_i.characters
    assert 1 in x_sub_i.characters


def test_get_symbol_children():
    with open(
        get_test_path(os.path.join("mathml", "x_sub_t_sub_i.xml"))
    ) as mathml_file:
        mathml = mathml_file.read()
        symbols = get_symbols(mathml)

    assert len(symbols) == 5
    x_sub_t_sub_i = list(
        filter(lambda s: "msub" in s.mathml and "x" in s.mathml, symbols)
    )[0]
    t_sub_i = list(
        filter(lambda s: "msub" in s.mathml and s is not x_sub_t_sub_i, symbols)
    )[0]
    x = list(filter(lambda s: s.mathml == "<mi>x</mi>", symbols))[0]
    t = list(filter(lambda s: s.mathml == "<mi>t</mi>", symbols))[0]
    i = list(filter(lambda s: s.mathml == "<mi>i</mi>", symbols))[0]

    assert len(x_sub_t_sub_i.children) == 2
    assert x in x_sub_t_sub_i.children
    assert t_sub_i in x_sub_t_sub_i.children

    assert len(t_sub_i.children) == 2
    assert t in t_sub_i.children
    assert i in t_sub_i.children
