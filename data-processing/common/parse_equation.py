import re
from dataclasses import dataclass
from typing import Callable, Dict, List, Optional, Set, Tuple, Union, cast

from bs4 import BeautifulSoup, NavigableString, Tag

from common.types import NodeType, Token

KATEX_ERROR_COLOR = "#ffffff"
"""
KaTeX error color is set to white because this is a color where we'll minimize the chance of
misdetecting colored equations as errors---anything that's set to 'white' in a paper would be
invisible and we wouldn't want to detect it anyway.
"""


@dataclass
class Node:
    " Node for a parse tree for an equation. "

    type_: NodeType
    " A tag describing the role of the node in the equation. "

    element: Tag
    " BeautifulSoup element. Use 'str(node.soup)' to see the cleaned MathML for this node. "

    children: List["Node"]
    " List of all nodes that are a child of this one. "

    start: int
    " Offset of the first character this node was parsed from in the equation. "

    end: int
    " Offset of the last character this node was parsed from in the equation. "

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
        return self.type_ in ["identifier", "function", "operator"]

    @property
    def child_symbols(self) -> List["Node"]:
        """
        Get all child symbols of this node, excluding nodes that serve a syntactic role
        used mostly just for parsing, like parentheses.
        """
        return list(filter(lambda c: c.is_symbol, self.children))

    @property
    def contains_affix_token(self) -> bool:
        """
        Whether this node contains any affix tokens (e.g., hats, arrows). If it doesn't, then
        the location of this node can be determined from the location of all its atom tokens.
        """
        return any([t.type_ == "affix" for t in self.tokens])


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


@dataclass
class ParseResult:

    nodes: List[Node]
    """
    Top-level symbol nodes found by parsing an element. These are nodes that can be considered
    "child symbols", if you are parsing the child tag of the parent.
    """

    @property
    def symbols(self) -> List[Node]:
        " Get a list of all top-level symbol nodes parsed from the MathML. "
        return [n for n in self.nodes if n.is_symbol]


@dataclass
class InternalParseResult(ParseResult):
    token_ids: List[str]
    """
    List of IDs of all tokens found in the subtree starting at the parsed element.
    """


def walk_postorder(element: Tag, func: Callable[[Tag], None]) -> None:
    for child in element.children:
        if isinstance(child, Tag):
            walk_postorder(child, func)
    func(element)


def repair_operator_tags(element: Tag) -> None:
    """
    Some elements that are frequently operators (like dots) are parsed by KaTeX as identifiers
    instead of operators. This function changes those identifiers into operators.
    """

    if element.name != "mi":
        return

    if element.text in ["∀", "∃", "|", "∥", "∣", ".", "/", "%"]:
        operator = clone_element(element)
        operator.name = "mo"
        element.replace_with(operator)


def make_derivatives_into_operators(element: Tag) -> None:
    """
    Transform symbols like 'd's and 'δ's that are probably used as signs for derivatives
    into operators, rather than identifiers.
    """

    DERIVATIVE_GLYPHS = ["d", "δ", "∂"]

    if element.name != "mrow":
        return

    elements = [e for e in element.children if isinstance(e, Tag)]
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
        if is_derivative_symbol:
            derivative_operator = clone_element(e)
            derivative_operator.name = "mo"
            e.replace_with(derivative_operator)


def remove_empty_strings(element: Tag) -> None:
    for child in element.children:
        if isinstance(child, NavigableString) and child.isspace():
            child.extract()


def merge_row_elements(element: Tag) -> None:
    """
    If an element is an 'mrow' produced by KaTeX, its children are probably needlessly fragmented. For
    instance, the word 'true' will contain four '<mi>' elements, one for 't', 'r', 'u', and 'e'
    each. Merge such elements into single elements.
    """

    if element.name != "mrow":
        return

    elements = [e for e in element.children if isinstance(e, Tag)]
    merger = MathMlElementMerger()
    merged = merger.merge(elements)

    # If the 'mrow' only contains one element after its children are merged, simplify the
    # MathML tree replacing this node with its merged child. Preserve the start and end
    # position of the row element if it is specified, because this often means that a styling
    # macro was applied to the children, and the start and end positions of the row include
    # the control sequence and braces for the styling macro.
    if len(merged) == 1:
        start = element.attrs.get("s2:start")
        end = element.attrs.get("s2:end")
        if start and end:
            merged[0].attrs["s2:start"] = start
            merged[0].attrs["s2:end"] = end
        if "s2:style-start" in element.attrs and "s2:style-end" in element.attrs:
            merged[0].attrs["s2:style-start"] = element.attrs["s2:style-start"]
            merged[0].attrs["s2:style-end"] = element.attrs["s2:style-end"]
        element.replace_with(merged[0])
    else:
        for e in elements:
            e.extract()
        for m in merged:
            element.append(m)


def merge_functions(element: Tag) -> None:
    """
    Detect contiguous elements than should be combined into functions. Because this function
    processes rows of elements ('mrow'), it might find multiple functions, for example if two
    functions are multiplied by each other (e.g., 'f(x)g(x)').
    """

    if not element.name == "mrow":
        return

    children = element.children
    to_extract = []
    braces_stack: List[str] = []

    OPENING_BRACES = ["(", "[", "{"]
    CLOSING_BRACES = {"(": ")", "[": "]", "{": "}"}

    for child in children:

        # If a function is not currently being extracted...
        if not braces_stack:
            # Each identifier found in a row could be an identifier for a function,
            # so the latest potential function identifier is saved.
            if child.name == "mi":
                to_extract = [child]
                continue
            # Start parsing a function when an opening brace if found.
            if child.name == "mo" and child.text in OPENING_BRACES:
                if to_extract:
                    braces_stack.append(child.text)
                    to_extract.append(child)
                    continue
            # If this is not an identifier or a left parens, don't consider the
            # current child as a starting point for making a function.
            else:
                to_extract = []

        # If a function is currently being extracted...
        elif braces_stack:
            to_extract.append(child)

            # Search for closing braces that match those that have been opened so far.
            # If all braces are closed, create an element for the function.
            if child.name == "mo" and child.text == CLOSING_BRACES[braces_stack[-1]]:
                braces_stack.pop()
                if braces_stack:
                    continue

                start = None
                end = None
                for e in to_extract:
                    if isinstance(e, Tag):
                        try:
                            e_start = int(e.attrs.get("s2:start"))
                            e_end = int(e.attrs.get("s2:end"))
                        except TypeError:
                            continue
                        if e_start is not None and (start is None or e_start < start):
                            start = e_start
                        if e_end is not None and (end is None or e_end > end):
                            end = e_end

                # If there is no start or end position for any of the tokens in the function,
                # something has gone seriously wrong and a function should not be created.
                if start is None or end is None:
                    continue

                function = create_element("mrow")
                function.attrs["s2:start"] = start
                function.attrs["s2:end"] = end
                function.attrs["s2:is_function"] = True

                first_extracted = to_extract[0].replace_with(function)
                extracted = [first_extracted] + [e.extract() for e in to_extract[1:]]
                function.extend(extracted)

    # Special case: if the row now contains just one function as its only child, replace it with
    # that function to remove unnecessary nesting.
    updated_children = list(element.children)
    if len(updated_children) == 1 and updated_children[0].attrs.get("s2:is_function"):
        element.replace_with(updated_children[0])


def clean_elements(root: Tag) -> Tag:
    """
    Clean the individual elements in a MathML tree. Involves pruning out empty elements, and
    changing the tag type of some nodes (like making sure that math operators appear in an
    'mo' node). This method does not modify the tree passed in as an argument. Rather,
    it clones the tree, cleans the cloned tree, and then returns it.
    """

    root_clone = clone_element(root)

    # As the root may be replaced by another element by the cleaning functions below, it must be
    # nested under a parent element so that the BeautifulSoup 'replace_with' method can be used.
    parent = BeautifulSoup("<div></div>", "lxml").div
    parent.append(root_clone)

    # Perform a series of cleaning operations on the element.
    walk_postorder(parent, remove_empty_strings)
    walk_postorder(parent, make_derivatives_into_operators)
    walk_postorder(parent, repair_operator_tags)

    return list(parent.children)[0]


def extract_tokens(root: Tag) -> Dict[str, Token]:
    """
    Extract tokens (i.e., single letters and affix marks like bars) from a MathML tree.
    The tree is modified, where each element that contained tokens is annotated
    with an ID of token data structures that were created when processing that element
    in the 's2:token-ids' attribute. Also returns a dictionary mapping from token IDs to
    token data.
    """

    # Dictionary mapping from a unique token ID to token data.
    tokens: Dict[str, Token] = {}

    def _visit(element: Tag) -> None:
        """
        Visit an element in the tree, extracting tokens from it, and setting an attribute in it
        with the IDs of the tokens that were extracted from it.
        """
        element_tokens = _extract_tokens_from_element(element)

        if element_tokens:
            element_token_ids = []
            for t in element_tokens:
                # Save token to a shared dictionary keyed by unique token ID. Start and end
                # character position of a token can be used as a unique key.
                id_ = f"{t.start}-{t.end}"
                element_token_ids.append(id_)
                tokens[id_] = t

            # Annotate the element with the IDs of the tokens it contains. This attribute will be
            # read later when symbols are created from elements, to look up the data for the
            # tokens that each symbol is composed of.
            element.attrs["s2:token-ids"] = "&".join(element_token_ids)

    walk_postorder(root, _visit)
    return tokens


def normalize_equation_structure(root: Tag) -> Tag:
    """
    Normalize the structure of a MathML equation, for instance, combining consecutive
    digits into one number. This method returns a cleaned clone of the tree provided as input.
    """

    # See note in 'clean_elements' for why the cloned root is added to a synthesized
    # root node.
    root_clone = clone_element(root)
    parent = BeautifulSoup("<div></div>", "lxml").div
    parent.append(root_clone)

    walk_postorder(parent, merge_row_elements)
    walk_postorder(parent, merge_functions)

    return list(parent.children)[0]


def parse_element(element: Tag) -> ParseResult:
    """
    Extract symbol nodes from an element in a BeautifulSoup MathML parse tree. This function
    recursively visits child elements in the BeautifulSoup parse tree, creating symbols for
    each of the element's descendants. The symbol returned will have one descendant for each
    symbol found during the recursive parse.
    """

    cleaned = clean_elements(element)
    tokens = extract_tokens(cleaned)
    cleaned = normalize_equation_structure(cleaned)
    parse_result = _parse_element(cleaned, tokens)

    # Remove custom S2 annotations that were used for parsing, but which do not belong
    # in a normalized representation of the element.
    cleaned_elements: Set[Tag] = set()
    to_clean = {n.element for n in parse_result.nodes}
    while to_clean:
        element = to_clean.pop()
        _sanitize_attributes(element)
        for child in element.children:
            if isinstance(child, Tag) and child not in cleaned_elements:
                to_clean.add(child)

    return ParseResult(parse_result.nodes)


def _parse_element(element: Tag, token_data: Dict[str, Token]) -> InternalParseResult:
    """
    Not meant to be called directly. Assumes a normalized form of the element and its children.
    Instead, called 'parse_element', which normalizes the element first.
    """

    # Detect if this tag represents a KaTeX parse error. If so, return nothing.
    if _is_error_element(element):
        return InternalParseResult([], [])

    # Parse each child element. As of BeautifulSoup version 4.8.2, the 'element.children' property
    # ensures that children are visited in order.
    children: List[Node] = []
    token_ids: List[str] = []

    for child in element.children:
        if isinstance(child, Tag):

            # Parse symbols from the child.
            child_parse_result = _parse_element(child, token_data)
            children.extend(child_parse_result.nodes)
            token_ids.extend(child_parse_result.token_ids)

    # Determine whether any of the children in the sequence have been defined. This occurs
    # after the parsing above, because the parsing may regroup children in a way that makes it
    # possible to capture definitions that would not otherwise be detected (for instance, by
    # grouping some consecutive tokens into functions).
    for i, c in enumerate(children):
        if c.type_ == "definition-operator" and i >= 1:
            previous_child = children[i - 1]
            if previous_child.is_symbol and not _appears_in_operator_argument(element):
                previous_child.defined = True

    # Get a list of tokens represented by this element.
    if "s2:token-ids" in element.attrs:
        token_ids.extend(element.attrs["s2:token-ids"].split("&"))
    unique_token_ids = set(token_ids)
    tokens = [token_data[id_] for id_ in unique_token_ids if id_ in token_data]
    tokens.sort(key=lambda t: t.start)

    # Attempt to parse nodes of specific types from the current element. Node type-specific
    # parsers are responsible returning a parse result. Type-specific parsers may take in:
    # * the element, if they need to extract tokens from the element;
    # * the list of all tokens parsed in the parses of child elements, because some tokens will have been found that
    #   don't have a corresponding node in 'children' (for instance, numbers, etc.).
    identifier = parse_identifier(element, children, tokens)
    if identifier is not None:
        return InternalParseResult([identifier], token_ids)
    function = parse_function(element, children, tokens)
    if function is not None:
        return InternalParseResult([function], token_ids)
    definition_operator = parse_definition_operator(element, tokens)
    if definition_operator is not None:
        return InternalParseResult([definition_operator], token_ids)
    generic_operator = parse_operator(element, tokens)
    if generic_operator is not None:
        return InternalParseResult([generic_operator], token_ids)

    # If a specific type of node can't be parsed, then return a generic type of node,
    # comprising of all the children and tokens found in this element.
    return InternalParseResult(children, token_ids)


def _is_identifier(element: Tag) -> bool:
    " Determine whether an element represents identifier. "

    if element.name == "mi":
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
    if element.name == "mover":
        child_elements = list(element.children)
        return (
            len(child_elements) == 2
            and isinstance(child_elements[0], Tag)
            and _is_identifier(child_elements[0])
        )

    return False


def parse_identifier(
    element: Tag, children: List[Node], tokens: List[Token]
) -> Optional[Node]:
    " Attempt to parse an element as an identifier. "

    if _is_identifier(element):
        start, end = _extract_symbol_element_start_and_end(element)
        if start is not None and end is not None:
            node = Node("identifier", element, children, start, end, tokens,)
            return node

    return None


def parse_function(
    element: Tag, children: List[Node], tokens: List[Token]
) -> Optional[Node]:

    if not element.name == "mrow" or not element.get("s2:is_function"):
        return None

    start, end = _extract_symbol_element_start_and_end(element)
    if start is not None and end is not None:
        return Node("function", element, children, start, end, tokens,)
    return None


def parse_definition_operator(element: Tag, tokens: List[Token]) -> Optional[Node]:
    EQUATION_SIGNS = ["=", "≈", "≥", "≤", "<", ">", "∈", "∼", "≜"]
    if element.name != "mo" or element.text not in EQUATION_SIGNS:
        return None

    start, end = _extract_symbol_element_start_and_end(element)
    if start is not None and end is not None:
        return Node(
            type_="definition-operator",
            element=element,
            children=[],
            start=start,
            end=end,
            tokens=tokens,
        )
    return None


def parse_operator(element: Tag, tokens: List[Token]) -> Optional[Node]:
    if element.name != "mo":
        return None

    start, end = _extract_symbol_element_start_and_end(element)
    if start is not None and end is not None:
        return Node(
            type_="operator",
            element=element,
            children=[],
            start=start,
            end=end,
            tokens=tokens,
        )

    return None


def _extract_symbol_element_start_and_end(
    element: Tag,
) -> Tuple[Optional[int], Optional[int]]:
    """
    Get the start and end character offsets of a symbol. If the element was styled
    in the TeX (e.g., with a macro like '\\mathbf'), then the character offsets will
    include the characters of the macro.
    """

    start = None
    end = None

    if "s2:style-start" in element.attrs and "s2:style-end" in element.attrs:
        start = int(element.attrs["s2:style-start"])
        end = int(element.attrs["s2:style-end"])
    elif "s2:start" in element.attrs and "s2:end" in element.attrs:
        start = int(element.attrs["s2:start"])
        end = int(element.attrs["s2:end"])

    return start, end


def _extract_tokens_from_element(element: Tag) -> List[Token]:
    """
    Get the tokens defined in this element. Tokens are characters or spans of text that
    make up symbols. There should be a token returned for each glyph in a symbol that needs
    to be detected separately (e.g., a symbol's base and its subscript are different tokens).

    Tokens are only found in low-level elements like "<mi>" and "<mn>". This function will
    not find tokens in higher-level nodes that solely group other low-level elements (like
    "<mrow>" and "<msub>").
    """

    tokens = []

    if _is_atomic_token(element):
        cleaned_element = clone_element(element)
        _sanitize_attributes(cleaned_element)
        tokens.append(
            Token(
                # Convert text to a primitive type. 'element.string' is a NavigableString,
                # which causes recursion errors when serialized.
                text=str(element.string),
                start=int(element["s2:start"]),
                end=int(element["s2:end"]),
                type_="atom",
                mathml=str(cleaned_element),
                font_macros=_extract_font_macros(element),
            )
        )
    elif _is_affix_token(element):
        cleaned_element = clone_element(element)
        _sanitize_attributes(cleaned_element)
        tokens.append(
            Token(
                text=str(element.string),
                start=int(element["s2:start"]),
                end=int(element["s2:end"]),
                type_="affix",
                mathml=str(cleaned_element),
                font_macros=_extract_font_macros(element),
            )
        )

    return tokens


def _extract_font_macros(element: Tag) -> Tuple[str, ...]:
    """
    Get the list of TeX styling macros applied to a token represented by a MathML element. Relies
    on the MathML having an "s2:font-macros" attribute on the elements for tokens, where
    each font macro is separated by an '&' character.
    """

    font_macros_string = str(element.get("s2:font-macros", ""))
    font_macros = tuple([m for m in font_macros_string.split("&") if m != ""])
    return font_macros


def _is_atomic_token(element: Tag) -> bool:
    """
    Determine whether an element contains a token that can stand on its own in TeX (i.e., which
    can be visually styled by wrapping the span of text in TeX macros).
    """

    if not _has_s2_offset_annotations(element):
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
    # Common mathematical operators. See a list of all operators supported by KaTeX here:
    # https://katex.org/docs/supported.html#binary-operators
    OPERATORS = [
        "+",
        "-",
        "/",
        "*",
        "∙",
        "⋅",
        "⋅",
        "⋅",
        "÷",
        "±",
        "×",
    ]
    if element.name == "mo" and element.text in OPERATORS:
        return True
    # Text spans consisting of only a single word.
    if element.name == "mtext" and re.match(r"\w+", element.text):
        return True

    return False


def _is_affix_token(element: Tag) -> bool:
    """
    Determine whether an element corresponds to an affix token (e.g., a bar above an
    identifier that was generated by a TeX macro).
    """

    if (
        element.name != "mo"
        or element.parent is None
        or not isinstance(element.parent, Tag)
    ):
        return False

    parent = cast(Tag, element.parent)
    return (
        bool(parent.name == "mover")
        and bool(element.find_previous("mi"))
        and (parent.attrs.get("accent") == "true")
    )


def _appears_in_operator_argument(element: Tag) -> bool:
    """
    Detect whether this element appears in an argument to an operator. Used to determine, for instance,
    whether a definition appears in the argument of a summation.
    """
    parent = element
    while parent is not None:
        parent_children = [c for c in parent.children if isinstance(c, Tag)]
        if (
            parent.name in ["msubsup", "msub", "msup"]
            and len(parent_children) > 0
            and parent_children[0].name == "mo"
        ):
            return True
        parent = parent.parent

    return False


def _is_error_element(element: Tag) -> bool:
    " Detect whether a BeautifulSoup tag represents a KaTeX parse error. "

    return (element.name == "mstyle") and bool(
        element.attrs.get("mathcolor") == KATEX_ERROR_COLOR
    )


def _sanitize_attributes(element: Tag) -> None:
    """
    Sanitize the attributes on a MathML element to remove attributes that would prevent
    an equality comparison between two elements that are semantically the same. Includes
    removing both S2 metadata tags (e.g., those that encode which font macros were used,
    and start and end position of the element in the TeX), and presentation-related
    attributes that do not affect the appearance, but only the layout, of the element.
    (e.g., 'lspace', 'rspace').
    """
    if hasattr(element, "attrs"):
        for key in list(element.attrs.keys()):
            if key.startswith("s2:"):
                del element.attrs[key]
            elif key in ["lspace", "rspace", "stretchy"]:
                del element.attrs[key]


def create_empty_element_copy(element: Tag) -> Tag:
    """
    Create a new BeautifulSoup element that will be a cleaned (empty) clone of the element.
    Create the clone by creating a new tag, rather than using 'copy.copy', because edits made
    to copies of elements will modify the contents of the original element, which may be in
    use by other parts of the code. Cloned element will have all of the same attributes (but
    none of the children) of the original element.
    """
    clone = create_element(element.name)
    for key, value in element.attrs.items():
        clone.attrs[key] = value

    return clone


def clone_element(element: Union[Tag, NavigableString]) -> Union[Tag, NavigableString]:
    " Create a deep copy of an element from a BeautifulSoup tree. "
    if isinstance(element, Tag):
        new_element = create_empty_element_copy(element)
        for child in element.children:
            new_element.append(clone_element(child))
        return new_element

    return NavigableString(str(element))


def create_element(tag_name: str) -> Tag:
    " Create a BeautifulSoup tag with the given tag_name. "

    # A dummy BeautifulSoup object is created to access to the 'new_tag' function.
    return BeautifulSoup("", "lxml").new_tag(tag_name)


SCRIPT_TAGS = ["msub", "msup", "msubsup"]


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

        if not _has_s2_offset_annotations(element):
            return False

        MERGEABLE_TOKEN_TAGS = ["mn", "mi", "mo", "msub", "msup", "msubsup"]
        if element.name in MERGEABLE_TOKEN_TAGS:
            return True

        return False

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

        # The two elements must also have the same style (i.e., if a script letter follows a
        # regular letter, than the two are probably separate identifiers).
        last_style = last_element.attrs.get("mathvariant")
        style = element.attrs.get("mathvariant")
        if not last_style == style:
            return False

        # Here come the context-sensitive rules:
        # 1. Scripts (e.g., elements with superscripts and subscripts) will end any
        #    sequence of mergeable characters. This is because no identifier is
        #    expected to have a superscript or a subscript in the middle.
        if last_element.name in SCRIPT_TAGS:
            return False
        # 2. Scripts can be merged into prior elements, provided that the base
        #    (the element to which the script is applied) can be merged according
        #    to the typical merging rules.
        if element.name in SCRIPT_TAGS:
            first_child = next(element.children, None)
            if (
                first_child
                and self._is_mergeable_type(first_child)
                and self._can_merge_with_prior_elements(first_child)
            ):
                return True
            return False
        # 3. Letters can be merged into any sequence of elements before them that starts with a
        #    a letter. This allows tokens to be merged into (target letter is shown in
        #    <angled brackets>) identifiers like "r2<d>2", but not constant multiplications like
        #   "4<x>", which should be split into two symbols.
        if element.name == "mi":
            return bool(self.to_merge[0].name == "mi")
        # 4. Numbers can be merged into letters before them, adding to the identifier.
        # 5. Numbers can be merged into numbers before them, extending an identifier, or making
        #    a number with multiple digits.
        if element.name == "mn":
            return last_element.name in ["mi", "mn"]
        # 6. Operators can be merged into operators that appear just before them to form multi-
        #    symbol operators, like '++', '//', etc.
        if element.name == "mo":
            return last_element.name in ["mo"]

        return False

    def _merge_prior_elements(self) -> None:
        """
        Merge all of the identifiers seen up to this point into a new element, and add that element to
        the list of all merged elements.
        """
        # Special case: nothing to merge.
        if len(self.to_merge) == 0:
            return

        # Special case: only one element to merge; merged element is the same as that element.
        if len(self.to_merge) == 1:
            element = self.to_merge[0]

        # Special case: sequence ends with a script element (superscript, subscript).
        elif self.to_merge[-1].name in SCRIPT_TAGS:
            element = self._merge_script(self.to_merge)
            # If elements could not be merged together due to unexpected errors processing the
            # script element, then keep all elements separate.
            if element is None:
                self.merged.extend(self.to_merge)
        else:
            element = self._merge_simple_row(self.to_merge)

        # The new element contains all tokens that were part of the merged elements.
        token_ids = []
        for e in self.to_merge:
            for id_ in e.attrs.get("s2:token-ids", "").split("&"):
                if id_:
                    token_ids.append(id_)
        if token_ids:
            element.attrs["s2:token-ids"] = "&".join(token_ids)

        # Save the merged element.
        self.merged.append(element)

        # Now that the prior elements have been merged, clear the list.
        self.to_merge = []  # pylint: disable=attribute-defined-outside-init

    def _merge_script(self, elements: List[Tag]) -> Optional[Tag]:
        script_element = clone_element(elements[-1])

        # Get the base to which the script is applied (e.g., 'x' in 'x^2'). The base is extracted
        # recursively, as it is valid MathML to specify nested scripts. For example, x_i^2 could
        # be expressed with 'x' as a base inside an 'msub' element (for 'x_i') inside an 'msup'
        # element (for 'x_i^2').
        base: Optional[Tag] = script_element
        while base and base.name in SCRIPT_TAGS:
            base = next(base.children, None)

        if base is None:
            return None

        # Create a new base by merging in all of the simple elements appearing before the base
        # with the base, and then applying the script to the merged base.
        merged_base = self._merge_simple_row(elements[:-1] + [base])
        base.replace_with(merged_base)

        # Adjust offset of parent elements to reflect the expanded character range of the base.
        parent = merged_base.parent
        start = merged_base.attrs["s2:start"]
        while parent:
            if "s2:start" in parent.attrs:
                parent.attrs["s2:start"] = start
            parent = parent.parent

        return script_element

    def _merge_simple_row(self, elements: List[Tag]) -> Tag:
        # Determine the new tag type based on the tags that will be merged. For now, we can assume
        # that it's the same as the first type of element that will be merged.
        tag_name = elements[0].name

        # Create a new BeautifulSoup object with the contents of all identifiers appended together.
        new_text = "".join([n.string for n in elements])
        element = create_element(tag_name)
        element.string = new_text
        element.attrs["s2:start"] = elements[0].attrs["s2:start"]
        element.attrs["s2:end"] = elements[-1].attrs["s2:end"]
        mathvariant = elements[0].attrs.get("mathvariant")
        if mathvariant:
            element.attrs["mathvariant"] = mathvariant

        return element


def _has_s2_offset_annotations(tag: BeautifulSoup) -> bool:
    return "s2:start" in tag.attrs and "s2:end" in tag.attrs
