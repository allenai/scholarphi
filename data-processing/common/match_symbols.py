from typing import Iterable, List

from bs4 import BeautifulSoup

from common.parse_equation import SYMBOL_TAGS
from common.types import Match, Matches, MathML


def get_mathml_matches(mathml_equations: Iterable[MathML]) -> Matches:
    """
    In the future, this method might help match the MathML equations to each other. For now, it
    simply makes a map from a MathML equation to a list of ranked matches of other things it
    can match. That list currently comprises itself, and its descendant symbols.
    """
    matches: Matches = {}
    for mathml in mathml_equations:
        if mathml not in matches:
            matches[mathml] = _get_matches(mathml)
    return matches


def _get_matches(mathml: MathML) -> List[Match]:

    # Search nodes in breadth-first order. That lets us rank descendants based on their
    # distance from the root.
    soup = BeautifulSoup(mathml, "lxml")
    root = soup.html.body.next if soup.html and soup.html.body else soup
    nodes = [root]
    matches: List[Match] = []

    while len(nodes) > 0:
        node = nodes.pop(0)

        if hasattr(node, "name") and node.name in SYMBOL_TAGS:
            matches.append(Match(str(root), str(node), len(matches) + 1))

        if hasattr(node, "children"):
            for child in node.children:
                nodes.append(child)

    return matches
