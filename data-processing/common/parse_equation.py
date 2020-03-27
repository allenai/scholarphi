import copy
from dataclasses import dataclass
from typing import List, Optional

from bs4 import BeautifulSoup, Tag

from common.types import Token

KATEX_ERROR_COLOR = "#ffffff"
"""
KaTeX error color is set to white because this is a color where we'll minimize the chance of
misdetecting colored equations as errors---anything that's set to 'white' in a paper would be
invisible and we wouldn't want to detect it anyway.
"""

SYMBOL_TAGS = ["msubsup", "msub", "msup", "mi"]


@dataclass(frozen=True)
class Node:
    " Node for a 'symbol' in a parse tree for an equation. "

    element: Tag
    " BeautifulSoup element. Use 'str(node.soup)' to see the cleaned MathML for this node. "

    children: List["Node"]
    " List of all symbols that are a child of this one. "

    tokens: List[Token]
    """
    List of all tokens that belong to this symbol. It's tokens in this list that will be colorized
    to determine the bounding box of the symbol.
    """


def parse_equation(mathml: str) -> List[Node]:
    """
    Extract a list of all symbols from a MathML. Guaranteed to return symbols in the same order
    every time---specifically, in the order visited in breadth-first search.
    """

    soup = BeautifulSoup(mathml, "lxml")

    # Parse the MathML equation, extracting top-level symbols.
    top_level_symbols = parse_element(soup.body).symbols

    # Build a list of all symbols found with a breadth-first search over the symbol tree.
    all_symbols = []
    symbols_to_visit = top_level_symbols
    while len(symbols_to_visit) > 0:
        symbol = symbols_to_visit.pop(0)
        all_symbols.append(symbol)
        symbols_to_visit.extend(symbol.children)

    return all_symbols


@dataclass(frozen=True)
class ParseResult:

    symbols: List[Node]
    """
    Top-level symbol nodes found by parsing an element. These are nodes that can be considered
    "child symbols", if you are parsing the child tag of the parent.
    """

    element: Optional[Tag]
    """
    A cleaned up BeautifulSoup element of the parsed entity (i.e. with S2 metadata tags removed
    and with consecutive identifier characters merged.). Will be None if no element could be
    parsed from the input element.
    """

    tokens: List[Token]
    """
    List of all tokens found in the subtree starting at the parsed element.
    """


def parse_element(element: Tag) -> ParseResult:
    """
    Extract symbol nodes from an element in a BeautifulSoup MathML parse tree. This function
    recursively visits
    """

    # Detect if this tag represents a KaTeX parse error. If so, return nothing.
    if _is_error_element(element):
        return ParseResult([], None, [])

    # If this is an 'mrow' produced by KaTeX, its children are probably needlessly fragmented. For
    # instance, the word 'true' will contain four '<mi>' elements, one for 't', 'r', 'u', and 'e'
    # each. Merge such elements into single elements.
    soup_children = element.children
    if element.name == "mrow":
        merged_children = MathMlElementMerger().merge(soup_children)

        # If the 'mrow' only contains one element after its children are merged, simplify the
        # MathML tree replacing this node with its merged child.
        if len(merged_children) == 1:
            element = merged_children[0]
            soup_children = element.children
        else:
            soup_children = merged_children

    # Extract the tokens that are uniquely defined in this element.
    tokens = _extract_tokens(element)

    # Create a new BeautifulSoup element that will be a cleaned clone of the input element.
    # Remove children from the element. Cleaned up children will be added shortly.
    clean_element = copy.copy(element)
    _remove_s2_annotations(clean_element)
    clean_element.clear()

    # Visit each of the child nodes. Iterate over 'element' instead of 'clean_element', as the
    # children will have been removed from 'clean_element' As of BeautifulSoup version 4.8.2,
    # children are visited in order.
    child_symbols = []
    for child in soup_children:
        if isinstance(child, Tag):
            child_parse_result = parse_element(child)
            child_symbols.extend(child_parse_result.symbols)
            if child_parse_result.element is not None:
                clean_element.append(child_parse_result.element)

            # Register the tokens found in the child elements as being part of this symbol.
            tokens.extend(child_parse_result.tokens)

        # If the child is not a tag, it's probably a string (like 'x' in <mi>x</mi>). We need
        # to make sure these are getting added to the element_clone too.
        elif isinstance(child, str) and not child.isspace():
            clean_element.append(child)

    # If the element's tag indicates the element is a symbol, return a new symbol node, setting its
    # children to the symbols found in the children.
    if element.name in SYMBOL_TAGS:
        return_symbols = [
            Node(children=child_symbols, element=clean_element, tokens=tokens)
        ]
    # Otherwise, return the list of symbols found in the children.
    else:
        return_symbols = child_symbols

    return ParseResult(return_symbols, clean_element, tokens)


def _extract_tokens(element: Tag) -> List[Token]:
    """
    Get the tokens defined in this element. Tokens are only found in low-level elements like
    "<mi>" and "<mn>". This function will find no tokens in higher-level nodes that solely
    group other low-level elements (like "<mrow>" and "<msub>").
    """

    tokens = []
    if element.name in ["mi", "mn"] and _has_s2_token_annotations(element):
        tokens.append(
            Token(
                text=element.string,
                token_index=int(element["s2:index"]),
                start=int(element["s2:start"]),
                end=int(element["s2:end"]),
            )
        )

    return tokens


def _is_error_element(element: Tag) -> bool:
    " Detect whether a BeautifulSoup tag represents a KaTeX parse error. "

    return (element.name == "mstyle") and bool(
        element.attrs.get("mathcolor") == KATEX_ERROR_COLOR
    )


def _remove_s2_annotations(element: Tag) -> None:
    " Remove S2 metadata tags from a BeautifulSoup node. "
    if hasattr(element, "attrs"):
        for key in list(element.attrs.keys()):
            if key.startswith("s2:"):
                del element.attrs[key]


def create_element(tag_name: str) -> Tag:
    " Create a BeautifulSoup tag with the given tag_name. "

    # A dummy BeautifulSoup object is created to access to the 'new_tag' function.
    return BeautifulSoup("", "lxml").new_tag(tag_name)


class MathMlElementMerger:
    def merge(self, elements: List[Tag]) -> List[Tag]:
        """
        Merge consecutive  elements in a list of elements. Do not modify the input list of elements, rather
        return a new list of elements.
        """
        self.merged: List[Tag] = []  # pylint: disable=attribute-defined-outside-init
        self.to_merge: List[Tag] = []  # pylint: disable=attribute-defined-outside-init

        # Main loop: iterate over elements, merging when possible.
        for e in elements:
            # Skip over whitespace.
            if isinstance(e, str) and e.isspace():
                continue
            # If an element is a mergeable type of element...
            if self._is_mergeable_type(e):
                # Merge with prior elements if you can. Otherwise, merge the prior elements, now that
                # we know there are no more elements to merge with them.
                if not self._can_merge_with_prior_elements(e):
                    self._merge_prior_elements()
                self.to_merge.append(e)
            # When an element can't be merged, merge all prior elements, and add this element
            # to the list of elements without changing it.
            else:
                self._merge_prior_elements()
                self.merged.append(e)

        # If there elements still waiting to be merged, merge them.
        if len(self.to_merge) > 0:
            self._merge_prior_elements()

        return self.merged

    def _is_mergeable_type(self, element: Tag) -> bool:
        " Determine if a element is a type that is mergeable with other elements. "
        return element.name in ["mi", "mn"] and _has_s2_token_annotations(element)

    def _can_merge_with_prior_elements(self, element: Tag) -> bool:
        """
        Determine whether an element can be merged into the list of prior elements. It is
        assumed that you have already called _is_mergeable_type on the element to check if it
        can be merged before calling this method.
        """

        # If there are no element to merge with, then the element will merge with an empty list.
        if len(self.to_merge) == 0:
            return True

        # For two elements to be merged together, one must follow the other without spaces.
        last_element = self.to_merge[-1]
        element_start = element.attrs["s2:start"]
        last_element_end = last_element.attrs["s2:end"]
        if not element_start == last_element_end:
            return False

        # Here come the context-sensitive rules:
        # 1. Letters can be merged into any sequence of elements before them that starts with a
        #    a letter. This allows tokens to be merged into (target letter is shown in
        #    <angled brackets> identifiers like "r2<d>2", but not constant multiplications like
        #   "4<x>", which should be split into two symbols.
        if element.name == "mi":
            return bool(self.to_merge[0].name == "mi")
        # 2. Numbers can be merged into letters before them, adding to the identifier.
        # 3. Numbers can be merged into numbers before them, extending an identifier, or making
        #    a number with multiple digits.
        if element.name == "mn":
            return True

        return False

    def _merge_prior_elements(self) -> None:
        """
        Merge all of the identifiers seen up to this point into a new element, and add that element to
        the list of all merged elements.
        """
        if len(self.to_merge) == 0:
            return

        # Determine the new tag type based on the tags that will be merged. For now, we can assume
        # that it's the same as the first type of element that will be merged.
        tag_name = self.to_merge[0].name

        # Create a new BeautifulSoup object with the contents of all identifiers appended together.
        new_text = "".join([n.string for n in self.to_merge])
        element = create_element(tag_name)
        element.string = new_text
        element.attrs["s2:start"] = self.to_merge[0].attrs["s2:start"]
        element.attrs["s2:end"] = self.to_merge[-1].attrs["s2:end"]
        element.attrs["s2:index"] = self.to_merge[0].attrs["s2:index"]

        # An identifier should have no children in MathML.
        self.merged.append(element)

        # Now that the prior elements have been merged, clear the list.
        self.to_merge = []  # pylint: disable=attribute-defined-outside-init


def _has_s2_token_annotations(soup: BeautifulSoup) -> bool:
    return (
        "s2:start" in soup.attrs and "s2:end" in soup.attrs and "s2:index" in soup.attrs
    )
