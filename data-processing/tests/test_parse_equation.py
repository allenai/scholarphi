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
    assert symbol.type_ == "identifier"
    assert symbol.children == []
    assert symbol.tokens == [Token("x", "atom", 0, 1, "<mi>x</mi>", [])]
    assert symbol.start == 0
    assert symbol.end == 1
    assert not symbol.defined
    assert not symbol.contains_affix_token


def test_merge_contiguous_identifiers():
    result = parse_element(load_fragment_tag("relu.xml"))
    symbol = result.symbols[0]
    assert str(symbol.element) == "<mi>ReLU</mi>"
    assert symbol.children == []
    assert symbol.tokens == [
        Token("R", "atom", 0, 1, "<mi>R</mi>", []),
        Token("e", "atom", 1, 2, "<mi>e</mi>", []),
        Token("L", "atom", 2, 3, "<mi>L</mi>", []),
        Token("U", "atom", 3, 4, "<mi>U</mi>", []),
    ]


def test_merge_contiguous_styled_identifiers():
    result = parse_element(load_fragment_tag("bold_relu.xml"))
    symbol = result.symbols[0]
    assert str(symbol.element == '<mi mathvariant="bold">ReLU</mi>')
    assert symbol.start == 0
    assert symbol.end == 13
    assert symbol.tokens == [
        Token("R", "atom", 8, 9, '<mi mathvariant="bold">R</mi>', ["mathbf"]),
        Token("e", "atom", 9, 10, '<mi mathvariant="bold">e</mi>', ["mathbf"]),
        Token("L", "atom", 10, 11, '<mi mathvariant="bold">L</mi>', ["mathbf"]),
        Token("U", "atom", 11, 12, '<mi mathvariant="bold">U</mi>', ["mathbf"]),
    ]


def test_keep_identifiers_with_different_styles_separate():
    result = parse_element(load_fragment_tag("script_x_regular_y.xml"))
    assert len(result.symbols) == 2
    assert str(result.symbols[0].element) == '<mi mathvariant="script">X</mi>'
    assert str(result.symbols[1].element) == "<mi>Y</mi>"


def test_merge_contiguous_identifiers_into_one_with_script():
    result = parse_element(load_fragment_tag("word_sub_i.xml"))
    symbol = result.symbols[0]
    assert str(symbol.element) == "<msub><mi>word</mi><mi>i</mi></msub>"


def test_merge_contiguous_operators():
    result = parse_element(load_fragment_tag("double_bar.xml"))
    assert len(result.symbols) == 1
    assert str(result.symbols[0].element) == "<mo>∣∣</mo>"


def test_merge_contigous_symbols_delimit_at_operator():
    result = parse_element(load_fragment_tag("var1_plus_var2.xml"))
    assert len(result.symbols) == 3
    assert str(result.symbols[0].element) == "<mi>var1</mi>"
    assert str(result.symbols[1].element) == "<mo>+</mo>"
    assert str(result.symbols[2].element) == "<mi>var2</mi>"


def test_do_not_parse_error_node():
    result = parse_element(load_fragment_tag("error.xml"))
    assert result.symbols == []


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
        Token("x", "atom", 0, 1, "<mi>x</mi>", []),
        Token("i", "atom", 2, 3, "<mi>i</mi>", []),
    ]


def test_parent_symbol_inherits_children_from_row():
    result = parse_element(load_fragment_tag("x_sub_a_plus_b.xml"))
    symbol = result.symbols[0]
    assert len(symbol.children) == 4
    assert str(symbol.children[0].element) == "<mi>x</mi>"
    assert str(symbol.children[1].element) == "<mi>a</mi>"
    assert str(symbol.children[2].element) == "<mo>+</mo>"
    assert str(symbol.children[3].element) == "<mi>b</mi>"


def test_number_is_not_a_symbol():
    result = parse_element(load_fragment_tag("1.xml"))
    assert result.symbols == []


def test_d_is_symbol_on_its_own():
    result = parse_element(load_fragment_tag("d.xml"))
    assert len(result.symbols) == 1
    symbol = result.symbols[0]
    assert str(symbol.element) == "<mi>d</mi>"
    assert symbol.type_ == "identifier"


def test_parse_derivative_tokens_as_operators():
    result = parse_element(load_fragment_tag("delta_a_d_b.xml"))
    assert len(result.symbols) == 4
    assert str(result.symbols[0].element) == "<mo>∂</mo>"
    assert result.symbols[0].type_ == "operator"
    assert str(result.symbols[1].element) == "<mi>a</mi>"
    assert str(result.symbols[2].element) == "<mo>d</mo>"
    assert result.symbols[2].type_ == "operator"
    assert str(result.symbols[3].element) == "<mi>b</mi>"


def test_parse_prime():
    result = parse_element(load_fragment_tag("x_prime.xml"))
    assert len(result.symbols) == 1
    symbol = result.symbols[0]
    assert len(symbol.children) == 2
    assert str(symbol.children[0].element) == "<mi>x</mi>"
    assert symbol.tokens == [
        Token("x", "atom", 0, 1, "<mi>x</mi>", []),
        Token("′", "atom", 1, 2, "<mo>′</mo>", []),
    ]


def test_parse_text_as_symbol():
    result = parse_element(load_fragment_tag("text.xml"))
    assert len(result.symbols) == 1
    assert str(result.symbols[0].element) == "<mtext>text</mtext>"


def test_parse_accent():
    result = parse_element(load_fragment_tag("bar_x.xml"))
    assert len(result.symbols) == 1
    symbol = result.symbols[0]
    assert str(symbol.element) == '<mover accent="true"><mi>x</mi><mo>ˉ</mo></mover>'
    assert symbol.contains_affix_token
    assert symbol.tokens == [
        Token("ˉ", "affix", 0, 5, "<mo>ˉ</mo>", []),
        Token("x", "atom", 5, 6, "<mi>x</mi>", []),
    ]


def test_summation_is_not_symbol():
    result = parse_element(load_fragment_tag("sum.xml"))
    assert len(result.symbols) == 2
    assert str(result.symbols[0].element) == "<mi>i</mi>"
    assert str(result.symbols[1].element) == "<mi>N</mi>"


def test_quantifiers_are_operators():
    result = parse_element(load_fragment_tag("forall.xml"))
    assert len(result.symbols) == 2
    assert str(result.symbols[0].element) == "<mo>∀</mo>"
    assert str(result.symbols[1].element) == "<mi>x</mi>"


def test_dot_is_an_operator():
    result = parse_element(load_fragment_tag("dot.xml"))
    assert len(result.symbols) == 1
    assert str(result.symbols[0].element) == "<mo>.</mo>"
    assert result.symbols[0].type_ == "operator"


def test_detect_definition():
    result = parse_element(load_fragment_tag("x_equals_1.xml"))
    assert str(result.symbols[0].element) == "<mi>x</mi>"
    assert result.symbols[0].defined


def test_detect_multiple_definitions():
    result = parse_element(load_fragment_tag("multiple_definitions.xml"))
    defined_symbols = list(filter(lambda s: s.defined, result.symbols))
    assert len(defined_symbols) == 2
    assert str(defined_symbols[0].element) == "<mi>x</mi>"
    assert str(defined_symbols[1].element) == "<mi>y</mi>"


def test_ignore_definition_in_sum_argument():
    result = parse_element(load_fragment_tag("sum_i_equals_0.xml"))
    assert str(result.symbols[0].element) == "<mi>i</mi>"
    assert not result.symbols[0].defined


def test_detect_function_declaration():
    result = parse_element(load_fragment_tag("function.xml"))
    symbol = result.symbols[0]

    assert symbol.element.text == "p(x;θ,y)"
    assert symbol.type_ == "function"
    assert symbol.start == 0
    assert symbol.end == 16
    assert (
        Token("(", "atom", 1, 2, "<mo>(</mo>", []) in symbol.tokens
    ), "function tokens should include parentheses"
    assert (
        Token(")", "atom", 15, 16, "<mo>)</mo>", []) in symbol.tokens
    ), "function tokens should include parentheses"
    assert not any(
        [t.text == "," for t in symbol.tokens]
    ), "function tokens should not include commas"
    assert not any(
        [t.text == ";" for t in symbol.tokens]
    ), "function tokens should not include semicolons"

    child_symbols = symbol.child_symbols
    assert len(child_symbols) == 8
    assert str(child_symbols[0].element) == "<mi>p</mi>"
    assert str(child_symbols[2].element) == "<mi>x</mi>"
    assert str(child_symbols[4].element) == "<mi>θ</mi>"
    assert str(child_symbols[6].element) == "<mi>y</mi>"


def test_detect_definition_of_function():
    result = parse_element(load_fragment_tag("function_definition.xml"))
    symbol = result.symbols[0]
    assert symbol.type_ == "function"
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
