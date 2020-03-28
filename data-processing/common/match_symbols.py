import logging
from typing import Iterable, Optional

from bs4 import BeautifulSoup, Tag

from common.types import Match, Matches, MathML


def get_mathml_matches(
    mathml_equations: Iterable[MathML], allow_self_matches: bool = True
) -> Matches:
    " Find matches between pairs of MathML equations. "

    HIGHEST_RANK = 1
    SECOND_HIGHEST_RANK = 2

    matches: Matches = {}
    partial_match_rank = SECOND_HIGHEST_RANK if allow_self_matches else HIGHEST_RANK

    for mathml in mathml_equations:
        if allow_self_matches:
            matches[mathml] = [Match(mathml, mathml, HIGHEST_RANK)]

        for other_mathml in mathml_equations:
            if other_mathml is not mathml and _do_mathmls_match(mathml, other_mathml):
                if mathml not in matches:
                    matches[mathml] = []
                matches[mathml].append(Match(mathml, other_mathml, partial_match_rank))

    return matches


def _do_mathmls_match(mathml1: MathML, mathml2: MathML) -> bool:
    element1 = _create_soup_element(mathml1)
    element2 = _create_soup_element(mathml2)
    if element1 is None or element2 is None:
        return False

    base1 = _find_base_element(element1)
    base2 = _find_base_element(element2)
    if base1 is None or base2 is None:
        return False

    # Check whether the base identifiers of both MathMLs is the same.
    return bool(base1.string == base2.string)


def _find_base_element(element: Tag) -> Optional[Tag]:
    """
    Find the 'base element' of a symbol. In most cases, this is the base identifier that
    is being modified by other symbols. For example, this function will return the
    '<mi>' element for 'x' in the symbol 'x^2', or 'x_i'. If this element does not have any
    descendant that can qualify as a base element, None is returned.
    """

    BASE_ELEMENT_TAG = "mi"

    # To find the base element perform a depth-first search. The first identifier ('<mi>') in a
    # pre-order traversal of the tree is the base element. This is because the 'base' element
    # is the first child of '<msub>' or '<msup>' elements.
    if element.name == BASE_ELEMENT_TAG:
        return element
    for child in element.children:
        if isinstance(child, Tag):
            base_element = _find_base_element(child)
            if base_element is not None:
                return base_element

    return None


def _create_soup_element(mathml: str) -> Optional[Tag]:
    try:
        soup = BeautifulSoup(mathml, "lxml")
    except AttributeError as e:
        logging.warning("BeautifulSoup could not parse MathML: '%s', %s", mathml, e)
        return None
    return soup.body.next if soup.body else soup
