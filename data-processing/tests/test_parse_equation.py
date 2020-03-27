import os

from bs4 import BeautifulSoup, Tag

from common.parse_equation import parse_element, parse_equation
from common.types import Token
from tests.util import get_test_path


def load_fragment_tag(filename: str) -> Tag:
    " Read a MathML fragment from file and return a BeautifulSoup tag for it. "

    with open(get_test_path(os.path.join("mathml-fragments", filename))) as file_:
        mathml = file_.read()

        # 'body.next' is used as the parser adds in 'html' and 'body' tags; this return just the child
        # node of the body (the original node we were parsing)
        return BeautifulSoup(mathml, "lxml").body.next


def test_parse_single_symbol():
    result = parse_element(load_fragment_tag("x.xml"))
    assert len(result.symbols) == 1
    symbol = result.symbols[0]
    assert str(symbol.element) == "<mi>x</mi>"
    assert symbol.children == []
    assert symbol.tokens == [Token(0, 1, "x", 0)]
    assert result.tokens == [Token(0, 1, "x", 0)]


def test_merge_contiguous_symbols():
    result = parse_element(load_fragment_tag("relu.xml"))
    assert str(result.element) == "<mi>ReLU</mi>"
    symbol = result.symbols[0]
    assert str(symbol.element) == "<mi>ReLU</mi>"
    assert symbol.children == []
    assert symbol.tokens == [
        Token(0, 4, "ReLU", 0),
    ]


def test_merge_contigous_symbols_delimit_at_operator():
    result = parse_element(load_fragment_tag("var1_plus_var2.xml"))
    assert str(result.element) == "<mrow><mi>var1</mi><mo>+</mo><mi>var2</mi></mrow>"
    assert len(result.symbols) == 2
    assert str(result.symbols[0].element) == "<mi>var1</mi>"
    assert str(result.symbols[1].element) == "<mi>var2</mi>"


def test_do_not_parse_error_node():
    result = parse_element(load_fragment_tag("error.xml"))
    assert result.symbols == []
    assert result.element is None
    assert result.tokens == []


def test_parse_node_with_child_nodes():
    result = parse_element(load_fragment_tag("x_sub_i.xml"))
    symbol = result.symbols[0]
    assert str(symbol.element) == "<msub><mi>x</mi><mi>i</mi></msub>"
    assert len(symbol.children) == 2
    assert str(symbol.children[0].element) == "<mi>x</mi>"
    assert str(symbol.children[1].element) == "<mi>i</mi>"
    assert symbol.tokens == [
        Token(0, 1, "x", 0),
        Token(2, 3, "i", 1),
    ]


def test_parent_symbol_inherits_children_from_row():
    result = parse_element(load_fragment_tag("x_sub_a_plus_b.xml"))
    symbol = result.symbols[0]
    assert len(symbol.children) == 3
    assert str(symbol.children[0].element) == "<mi>x</mi>"
    assert str(symbol.children[1].element) == "<mi>a</mi>"
    assert str(symbol.children[2].element) == "<mi>b</mi>"


def test_number_is_not_a_symbol():
    result = parse_element(load_fragment_tag("1.xml"))
    assert str(result.element) == "<mn>1</mn>"
    assert result.symbols == []
    assert result.tokens == [Token(0, 1, "1", 0)]


def test_number_with_subscript_is_a_symbol():
    result = parse_element(load_fragment_tag("1_sub_2.xml"))
    symbol = result.symbols[0]
    assert str(symbol.element) == "<msub><mn>1</mn><mn>2</mn></msub>"
    assert symbol.children == []


def test_parse_equation():
    with open(
        get_test_path(os.path.join("mathml", "x_sub_t_sub_i.xml"))
    ) as mathml_file:
        mathml = mathml_file.read()
        symbols = parse_equation(mathml)

    assert len(symbols) == 5
    x_sub_t_sub_i = list(
        filter(lambda s: "msub" in str(s.element) and "x" in str(s.element), symbols)
    )[0]
    t_sub_i = list(
        filter(lambda s: "msub" in str(s.element) and s is not x_sub_t_sub_i, symbols)
    )[0]
    x = list(filter(lambda s: str(s.element) == "<mi>x</mi>", symbols))[0]
    t = list(filter(lambda s: str(s.element) == "<mi>t</mi>", symbols))[0]
    i = list(filter(lambda s: str(s.element) == "<mi>i</mi>", symbols))[0]

    assert len(x_sub_t_sub_i.children) == 2
    assert x in x_sub_t_sub_i.children
    assert t_sub_i in x_sub_t_sub_i.children

    assert len(t_sub_i.children) == 2
    assert t in t_sub_i.children
    assert i in t_sub_i.children
