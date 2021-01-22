import os

from bs4 import BeautifulSoup, Tag
from common.parse_equation import NodeType, parse_element, parse_equation
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
    assert symbol.type_ == NodeType.IDENTIFIER
    assert symbol.children == []
    assert symbol.tokens == [Token("x", "atom", 0, 1)]
    assert symbol.start == 0
    assert symbol.end == 1
    assert not symbol.defined
    assert not symbol.contains_affix_token
    assert result.tokens == [Token("x", "atom", 0, 1)]


def test_merge_contiguous_symbols():
    result = parse_element(load_fragment_tag("relu.xml"))
    assert str(result.element) == "<mi>ReLU</mi>"
    symbol = result.symbols[0]
    assert str(symbol.element) == "<mi>ReLU</mi>"
    assert symbol.children == []
    assert symbol.tokens == [
        Token("ReLU", "atom", 0, 4),
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
    assert symbol.start == 0
    assert symbol.end == 3
    assert str(symbol.children[0].element) == "<mi>x</mi>"
    assert str(symbol.children[1].element) == "<mi>i</mi>"
    assert symbol.tokens == [
        Token("x", "atom", 0, 1),
        Token("i", "atom", 2, 3),
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
    assert result.tokens == [Token("1", "atom", 0, 1)]


def test_d_is_symbol_on_its_own():
    result = parse_element(load_fragment_tag("d.xml"))
    assert len(result.symbols) == 1
    assert str(result.symbols[0].element) == "<mi>d</mi>"
    assert result.symbols[0].tokens == [Token("d", "atom", 0, 1)]


def test_ignore_derivative_tokens():
    result = parse_element(load_fragment_tag("delta_a_d_b.xml"))
    assert len(result.symbols) == 2
    assert str(result.symbols[0].element) == "<mi>a</mi>"
    assert str(result.symbols[1].element) == "<mi>b</mi>"

    # Make sure that derivatives tokens aren't removed from the MathML.
    assert any([e.name == "mo" and e.text == "d" for e in result.element])
    assert any([e.name == "mo" and e.text == "∂" for e in result.element])


def test_parse_prime():
    result = parse_element(load_fragment_tag("x_prime.xml"))
    assert len(result.symbols) == 1
    symbol = result.symbols[0]
    assert len(symbol.children) == 1
    assert str(symbol.children[0].element) == "<mi>x</mi>"
    assert symbol.tokens == [Token("x", "atom", 0, 1), Token("′", "atom", 1, 2)]


def test_parse_text_as_symbol():
    result = parse_element(load_fragment_tag("text.xml"))
    assert len(result.symbols) == 1
    assert str(result.element) == "<mtext>text</mtext>"


def test_parse_accent():
    result = parse_element(load_fragment_tag("bar_x.xml"))
    assert len(result.symbols) == 1
    assert str(result.element) == '<mover accent="true"><mi>x</mi><mo>ˉ</mo></mover>'
    symbol = result.symbols[0]
    assert symbol.contains_affix_token
    assert symbol.tokens == [Token("x", "atom", 5, 6), Token("ˉ", "affix", 0, 5)]


def test_summation_is_not_symbol():
    result = parse_element(load_fragment_tag("sum.xml"))
    assert len(result.symbols) == 2
    assert str(result.symbols[0].element) == "<mi>i</mi>"
    assert str(result.symbols[1].element) == "<mi>N</mi>"


def test_ignore_quantifiers():
    result = parse_element(load_fragment_tag("forall.xml"))
    assert len(result.symbols) == 1
    assert str(result.symbols[0].element) == "<mi>x</mi>"


def test_detect_definition():
    result = parse_element(load_fragment_tag("x_equals_1.xml"))
    assert str(result.symbols[0].element) == "<mi>x</mi>"
    assert result.symbols[0].defined


def test_detect_multiple_definitions():
    result = parse_element(load_fragment_tag("multiple_definitions.xml"))
    assert str(result.symbols[0].element) == "<mi>x</mi>"
    assert result.symbols[0].defined
    assert str(result.symbols[1].element) == "<mi>y</mi>"
    assert result.symbols[1].defined


def test_ignore_definition_in_sum_argument():
    result = parse_element(load_fragment_tag("sum_i_equals_0.xml"))
    assert str(result.symbols[0].element) == "<mi>i</mi>"
    assert not result.symbols[0].defined


def test_detect_function_declaration():
    result = parse_element(load_fragment_tag("function.xml"))
    symbol = result.symbols[0]

    assert symbol.element.text == "p(x;θ,y)"
    assert symbol.type_ == NodeType.FUNCTION
    assert symbol.start == 0
    assert symbol.end == 16
    assert (
        Token("(", "atom", 1, 2) in symbol.tokens
    ), "function tokens should include parentheses"
    assert (
        Token(")", "atom", 15, 16) in symbol.tokens
    ), "function tokens should include parentheses"
    assert not any(
        [t.text == "," for t in symbol.tokens]
    ), "function tokens should not include commas"
    assert not any(
        [t.text == ";" for t in symbol.tokens]
    ), "function tokens should not include semicolons"

    child_symbols = symbol.child_symbols
    assert len(child_symbols) == 4
    assert str(child_symbols[0].element) == "<mi>p</mi>"
    assert str(child_symbols[1].element) == "<mi>x</mi>"
    assert str(child_symbols[2].element) == "<mi>θ</mi>"
    assert str(child_symbols[3].element) == "<mi>y</mi>"


def test_detect_definition_of_function():
    result = parse_element(load_fragment_tag("function_definition.xml"))
    symbol = result.symbols[0]
    assert symbol.type_ == NodeType.FUNCTION
    assert symbol.defined


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
