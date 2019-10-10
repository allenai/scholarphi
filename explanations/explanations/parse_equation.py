import re
from typing import List

from bs4 import BeautifulSoup

from explanations.types import Position, Token


def get_tokens(xml_math: str) -> List[Token]:
    """
    Input is a LaTeXML representation of an equation where each token is tagged with their
    location. See the other methods in this module for methods that will run LaTeXML
    in a way that produces XML from an equation in the expected format.
    """
    soup = BeautifulSoup(xml_math, "lxml-xml")
    xm_tokens = soup.find_all("XMTok")
    tokens: List[Token] = []
    for token in xm_tokens:
        text = token.get_text()
        assert len(text) == 1
        end = _adjust_position(_get_node_end(token))
        # XXX(andrewhead): Make the (potentially faulty) assumption that the number of characters
        # in the XML representation of the token is the same as the number of characters in the TeX
        # represetntation of the token. For now, we assert that the text is only 1 character as
        # a check on this, and are looking for evidence of whether this is a problem.
        start = Position(line=end.line, character=end.character - len(text))
        token = Token(text, start, end)
        tokens.append(token)

    sorted_tokens = sorted(tokens, key=lambda t: (t.start.line, t.start.character))

    return sorted_tokens


def _adjust_position(position: Position) -> Position:
    """
    Adjust position from the one output equation parser Perl script to the original character
    position in the string. This correction needs to be done because the Perl script wraps the
    equation in a mock LaTeX document before attempting to parse it.
    """
    EQUATION_OFFSET = Position(line=6, character=1)
    adjusted_position = Position(
        line=position.line - EQUATION_OFFSET.line,
        character=position.character - EQUATION_OFFSET.character
        if position.line == EQUATION_OFFSET.line
        else position.character,
    )
    return adjusted_position


def _get_node_end(node: BeautifulSoup) -> Position:
    """
    For tokens and many other nodes, LaTeXML only annotates the node with its end position.
    So for those nodes, you can't extract start positions for many nodes without changing LaTeXML.
    """
    location = node["location"]
    match = re.search("to=([0-9]+);([0-9]+)", location)
    assert match is not None
    return Position(line=int(match[1]), character=int(match[2]))
