import os.path

from explanations.parse_equation import get_tokens
from tests.util import get_test_path


def assert_has_character(tokens, index, text, start_character, end_character):
    token = tokens[index]
    assert token.text == text
    assert token.start.line == 0
    assert token.start.character == start_character
    assert token.end.line == 0
    assert token.end.character == end_character


def test_extract_tokens():
    with open(get_test_path(os.path.join("xml", "math.xml"))) as xml_file:
        xml = xml_file.read()
        tokens = get_tokens(xml)
        assert len(tokens) == 3
        assert_has_character(tokens, 0, "x", 0, 1)
        assert_has_character(tokens, 1, "+", 2, 3)
        assert_has_character(tokens, 2, "y", 4, 5)
