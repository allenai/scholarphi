from enum import Enum
import re
from dataclasses import dataclass
from typing import List, Optional, Tuple, Union

from bs4 import BeautifulSoup, NavigableString, Tag

from common.types import Token

KATEX_ERROR_COLOR = "#ffffff"
"""
KaTeX error color is set to white because this is a color where we'll minimize the chance of
misdetecting colored equations as errors---anything that's set to 'white' in a paper would be
invisible and we wouldn't want to detect it anyway.
"""


class NodeType(Enum):
    IDENTIFIER = "identifier"
    FUNCTION = "function"
    LEFT_PARENS = "left-parens"
    RIGHT_PARENS = "right-parens"

    def __repr__(self) -> str:
        return f"{self.__class__.__name__, self.name}"


@dataclass
class Node:
    " Node for a parse tree for an equation. "

    type_: NodeType
    " A tag describing the role of the node in the equation. "

    element: Tag
    " BeautifulSoup element. Use 'str(node.soup)' to see the cleaned MathML for this node. "

    children: List["Node"]
    " List of all nodes that are a child of this one. "

    tokens: List[Token]
    """
    List of all tokens that belong to this symbol. It's tokens in this list that will be colorized
    to determine the bounding box of the symbol.
    """

    defined: Optional[bool] = None
    """
    Whether this node is being defined (i.e., whether it is the top-level symbol) on the left side
    of an equation with an equality. Should only be set to true for nodes that
    corresponds to symbols (e.g., identifiers, functions).
    """

    @property
    def is_symbol(self) -> bool:
        """
        Whether this node should be considered a 'symbol', i.e., an entity in an equation that
        has meaning and needs an explanation.
        """
        return self.type_ in [NodeType.IDENTIFIER, NodeType.FUNCTION]

    @property
    def child_symbols(self) -> List["Node"]:
        """
        Get all child symbols of this node, excluding nodes that serve a syntactic role
        used mostly just for parsing, like parentheses.
        """
        return list(filter(lambda c: c.is_symbol, self.children))


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
        symbols_to_visit.extend(symbol.child_symbols)

    return all_symbols


@dataclass(frozen=True)
class ParseResult:

    nodes: List[Node]
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

    @property
    def symbols(self) -> List[Node]:
        " Get a list of all top-level symbol nodes parsed from the MathML. "
        return [n for n in self.nodes if n.is_symbol]


def parse_element(element: Tag) -> ParseResult:
    """
    Extract symbol nodes from an element in a BeautifulSoup MathML parse tree. This function
    recursively visits child elements in the BeautifulSoup parse tree, creating symbols for
    each of the element's descendants. The symbol returned will have one descendant for each
    symbol found during the recursive parse.
    """

    # Detect if this tag represents a KaTeX parse error. If so, return nothing.
    if _is_error_element(element):
        return ParseResult([], None, [])

    # If this is an 'mrow' produced by KaTeX, its children are probably needlessly fragmented. For
    # instance, the word 'true' will contain four '<mi>' elements, one for 't', 'r', 'u', and 'e'
    # each. Merge such elements into single elements.
    soup_children = list(element.children)
    if element.name == "mrow":
        cleaned_children = clean_row(soup_children)
        merged_children = merge_mathml_elements(cleaned_children)

        # If the 'mrow' only contains one element after its children are merged, simplify the
        # MathML tree replacing this node with its merged child.
        if len(merged_children) == 1:
            element = merged_children[0]
            soup_children = element.children
        else:
            soup_children = merged_children

    # Parse each child element. As of BeautifulSoup version 4.8.2, the 'element.children' property
    # ensures that children are visited in order.
    # At the same time, create a generic MathML element that can be returned from this parse
    # function if none of the type-specific node parsers can create an element.
    children: List[Node] = []
    tokens: List[Token] = []
    clean_element = create_empty_tag_copy(element)

    for ci, child in enumerate(soup_children):
        if isinstance(child, Tag):

            # Parse symbols from the child.
            child_parse_result = parse_element(child)
            children.extend(child_parse_result.nodes)
            tokens.extend(child_parse_result.tokens)
            if child_parse_result.element is not None:
                clean_element.append(child_parse_result.element)

            # If the child is a definition operator and one symbol appears to its
            # left, then the symbol to the left is probably getting defined.
            if _is_definition_operator(child):
                if len(children[:ci]) == 1:
                    previous_child = children[0]
                    if previous_child.is_symbol:
                        previous_child.defined = True

        # If the child isn't a tag, it's probably a string (like the text 'x' that's a
        # child of the '<mi>x</mi>' element). Strings must be added to the cleaned element,
        # to contain the text for identifiers and relevant operators. New NavigableStrings
        # are created for text, rather than appending the existing string to the element,
        # as BeautifulSoup only allows a NavigableString to be associated with one element.
        elif isinstance(child, NavigableString) and not child.isspace():
            clean_element.append(NavigableString(str(child)))

    # Attempt to parse nodes of specific types from the current element. Node type-specific
    # parsers are responsible returning a parse result, which includes a cleaned MathML element
    # stripped of position annotations. Type-specific parsers may take in:
    # * the original element, if they need to extract tokens from the element;
    # * the cleaned element, if they want to parse a cleaned-up version of the MathML;
    # * the list of all tokens parsed in the parses of child elements, because some tokens will have been found that
    #   don't have a corresponding node in 'children' (for instance, numbers, etc.).
    original_element = element
    identifier = parse_identifier(clean_element, original_element, children, tokens)
    if identifier is not None:
        return identifier
    functions = parse_functions(clean_element, children, tokens)
    if functions is not None:
        children = functions.nodes
    parens = parse_parens(clean_element, original_element)
    if parens is not None:
        return parens

    # If a specific type of node can't be parsed, then return a generic type of node,
    # comprising of all the children and tokens found in this element.
    tokens = list({t for s in children for t in s.tokens})
    tokens.extend(_extract_tokens(element))
    return ParseResult(children, clean_element, tokens)


def clean_row(elements: List[Tag]) -> List[Tag]:
    """
    Clean MathML row, removing children that should not be considered tokens or child symbols.
    One example of cleaning that should take place here is removing 'd' and 'δ' signs that are
    used as derivatives, instead of as identifiers.
    """

    # Remove whitespace between elements.
    elements = [e for e in elements if not (isinstance(e, str) and e.isspace())]

    # Remove quantifiers and double bars.
    elements = [e for e in elements if e.text not in ["∀", "∃"]]
    elements = [e for e in elements if e.text not in ["|", "∥"]]

    # Remove 'd's and 'δ's used as signs for derivatives.
    derivatives_cleaned = []
    DERIVATIVE_GLYPHS = ["d", "δ", "∂"]
    for i, e in enumerate(elements):
        is_derivative_symbol = (
            # Is the glyph a derivative sign?
            e.name == "mi"
            and e.text in DERIVATIVE_GLYPHS
            # Is the next element a symbol?
            and (i < len(elements) - 1 and _is_identifier(elements[i + 1]))
            # Is the element after that either not a symbol, or another derivative sign?
            and (
                i == len(elements) - 2
                or not _is_identifier(elements[i + 2])
                or elements[i + 2].text in DERIVATIVE_GLYPHS
            )
        )
        if not is_derivative_symbol:
            derivatives_cleaned.append(e)

    elements = derivatives_cleaned
    return elements


def _is_identifier(element: Tag) -> bool:
    " Determine whether an element represents identifier. "

    if element.name == "mi":
        # Exclude special math symbols typically used as constants.
        if element.text in ["e"]:
            return False
        return True
    # Composite symbols like subscripts and superscripts must have multiple children to be
    # considered a symbol, and their base (i.e., first argument) must be a symbol. In most cases,
    # this means that the base is an identifier. This rules out operators like summations.
    if element.name in ["msubsup", "msub", "msup"]:
        child_elements = list(element.children)
        return (
            len(child_elements) >= 1
            and isinstance(child_elements[0], Tag)
            and _is_identifier(child_elements[0])
        )
    if element.name == "mtext" and re.match(r"\w+", element.text):
        return True

    return False


def parse_identifier(
    clean_element: Tag, original_element: Tag, children: List[Node], tokens: List[Token]
) -> Optional[ParseResult]:
    " Attempt to parse an element as an identifier. "

    if _is_identifier(clean_element):

        tokens = list(tokens)
        tokens.extend(_extract_tokens(original_element))

        node = Node(NodeType.IDENTIFIER, clean_element, children, tokens)
        return ParseResult([node], clean_element, tokens)

    return None


def parse_functions(
    element: Tag, children: List[Node], tokens: List[Token]
) -> Optional[ParseResult]:
    """
    Attempt to parse an row of children into functions. Because this function processes rows of
    elements ('mrow'), it might find multiple functions, for example if two functions are
    multiplied by each other (e.g., 'f(x)g(x)').
    """

    if not element.name == "mrow":
        return None

    new_children = list(children)
    function_ranges: List[Tuple[int, int]] = []
    start = -1
    end = -1
    parens_depth = 0

    # Detect ranges of children than should be combined into functions.
    for i, child in enumerate(children):

        if parens_depth == 0:
            # Each identifier found in a row could be an identifier for a function,
            # so the last potential function identifier is saved.
            if child.type_ is NodeType.IDENTIFIER:
                start = i
                continue
            # Start parsing a function when a left parentheses if found.
            if child.type_ is NodeType.LEFT_PARENS:
                if start != -1:
                    parens_depth += 1
                    continue

        if parens_depth > 0:
            if child.type_ is NodeType.RIGHT_PARENS:
                parens_depth -= 1
                if parens_depth == 0:
                    end = i
                    function_ranges.append((start, end))
                    start = -1
                    end = -1

    # Nest children that appear to be parts of function in new function nodes.
    function_created = False
    for r_start, r_end in reversed(function_ranges):
        if r_start == -1 or r_end == -1:
            continue

        func_children = children[r_start : r_end + 1]
        func_tokens = [t for c in func_children for t in c.tokens]

        # Create synthetic MathML row for the function.
        func_element = create_empty_tag_copy(element)
        add_elements = False
        for child_element in element.children:
            if child_element is func_children[0].element:
                add_elements = True
            if add_elements:
                func_element.append(clone_element(child_element))
            if child_element is func_children[-1].element:
                add_elements = False
                break

        func_node = Node(NodeType.FUNCTION, func_element, func_children, func_tokens)
        new_children = new_children[:r_start] + [func_node] + new_children[r_end + 1 :]
        function_created = True

    if function_created:
        return ParseResult(new_children, element, tokens)
    return None


def parse_parens(clean_element: Tag, original_element: Tag) -> Optional[ParseResult]:
    if clean_element.name == "mo" and clean_element.text in ["(", ")"]:

        tokens = _extract_tokens(original_element)

        node = Node(
            type_=NodeType.LEFT_PARENS
            if clean_element.text == "("
            else NodeType.RIGHT_PARENS,
            element=clean_element,
            children=[],
            tokens=tokens,
        )
        return ParseResult([node], clean_element, tokens)

    return None


def _extract_tokens(element: Tag) -> List[Token]:
    """
    Get the tokens defined in this element. Tokens are only found in low-level elements like
    "<mi>" and "<mn>". This function will find no tokens in higher-level nodes that solely
    group other low-level elements (like "<mrow>" and "<msub>").
    """

    tokens = []

    if _is_token(element):
        tokens.append(
            Token(
                # Convert text to a primitive type. 'element.string' is a NavigableString,
                # which causes recursion errors when serialized.
                text=str(element.string),
                token_index=int(element["s2:index"]),
                start=int(element["s2:start"]),
                end=int(element["s2:end"]),
            )
        )

    return tokens


def _is_token(element: Tag) -> bool:
    """
    Determine whether an element contains a token. Tokens are characters or spans of text that
    make up symbols. There should be a token returned for each glyph in a symbol that needs
    to be detected separately (e.g., a symbol's base and its subscript are different tokens).
    """

    if not _has_s2_token_annotations(element):
        return False

    # Some tags always contain tokens.
    TOKEN_TAGS = ["mn", "mi"]
    if element.name in TOKEN_TAGS:
        return True
    # The prime symbol (e.g., "x'").
    if element.name == "mo" and element.text in ["′", "'"]:
        return True
    # Parentheses, for functions.
    if element.name == "mo" and element.text in ["(", ")"]:
        return True
    # Text spans comprising only a single word.
    if element.name == "mtext" and re.match(r"\w+", element.text):
        return True

    return False


def _is_definition_operator(element: Tag) -> bool:
    # Check whether this is a definition operator.
    is_definition_operator = element.name == "mo" and element.text in [
        "=",
        "≈",
        "≥",
        "≤",
        "∈",
        "∼",
    ]
    if not is_definition_operator:
        return False

    # Filter out cases where the operator appears in an argument to an existing operator, like
    # beneath of a summation sign (i.e., the '=' in "Σ_{i = 0}").
    parent = element
    while parent is not None:
        parent_children = [c for c in parent.children if isinstance(c, Tag)]
        if (
            parent.name in ["msubsup", "msub", "msup"]
            and len(parent_children) > 0
            and parent_children[0].name == "mo"
        ):
            return False
        parent = parent.parent

    return True


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


def create_empty_tag_copy(element: Tag) -> Tag:
    """
    Create a new BeautifulSoup element that will be a cleaned (empty) clone of the element.
    Create the clone by creating a new tag, rather than using 'copy.copy', because edits made
    to copies of elements will modify the contents of the original element, which may be in
    use by other parts of the code.
    """
    clean_element = create_element(element.name)
    for key, value in element.attrs.items():
        clean_element.attrs[key] = value

    # Position markers are removed from the element to make it possible to do similarity
    # comparisons between nodes based on their MathML alone.
    _remove_s2_annotations(clean_element)

    return clean_element


def clone_element(element: Union[Tag, NavigableString]) -> Union[Tag, NavigableString]:
    " Create a deep copy of an element from a BeautifulSoup tree. "
    if isinstance(element, Tag):
        new_element = create_empty_tag_copy(element)
        for child in element.children:
            new_element.append(clone_element(child))
        return new_element

    return NavigableString(str(element))


def create_element(tag_name: str) -> Tag:
    " Create a BeautifulSoup tag with the given tag_name. "

    # A dummy BeautifulSoup object is created to access to the 'new_tag' function.
    return BeautifulSoup("", "lxml").new_tag(tag_name)


def merge_mathml_elements(elements: List[Tag]) -> List[Tag]:
    merger = MathMlElementMerger()
    return merger.merge(elements)


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
        MERGEABLE_TOKEN_TAGS = ["mn", "mi"]
        return element.name in MERGEABLE_TOKEN_TAGS and _has_s2_token_annotations(
            element
        )

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
