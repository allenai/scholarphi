import copy
import logging
from typing import Any, List, NamedTuple, Optional

from bs4 import BeautifulSoup

from explanations.types import Character, CharacterIndex, Symbol


class NodeSymbol(NamedTuple):
    node: BeautifulSoup
    characters: List[CharacterIndex]
    mathml: str


"""
KaTeX error color is set to white because this is a color where we'll minimize the chance of
misdetecting colored equations as errors---anything that's set to 'white' in a paper would be
invisible and we wouldn't want to detect it anyway.
"""
KATEX_ERROR_COLOR = "#ffffff"
CHARACTER_TAGS = ["mi"]
SYMBOL_TAGS = ["msubsup", "msub", "msup", "mi"]


def _is_node_annotated(node: Any) -> bool:
    return (
        "s2:start" in node.attrs and "s2:end" in node.attrs and "s2:index" in node.attrs
    )


def get_characters(mathml: str) -> List[Character]:
    soup = BeautifulSoup(mathml, "lxml")
    characters = []
    for node in soup.find_all(CHARACTER_TAGS):
        if _is_node_annotated(node):

            characters.append(
                Character(
                    text=node.text,
                    i=int(node["s2:index"]),
                    start=int(node["s2:start"]),
                    end=int(node["s2:end"]),
                )
            )
        else:
            logging.warning("Node does not have position annotations: %s", node)
    return characters


def get_symbols(mathml: str) -> List[Symbol]:
    soup = BeautifulSoup(mathml, "lxml")
    node_symbols = []
    for symbol_node in soup.find_all(SYMBOL_TAGS):

        # Collect indexes of all characters that belong to this symbol
        characters = []
        if symbol_node.name in CHARACTER_TAGS:
            index = _get_character_index(symbol_node)
            if index is not None:
                characters.append(index)
        for node in symbol_node.find_all(CHARACTER_TAGS):
            index = _get_character_index(node)
            if index is not None:
                characters.append(index)

        # Clean the MathML of our annotations. Do this cleaning on a clone of the node, so that the
        # annotations are available for processing later nodes.
        node_clone = copy.copy(symbol_node)
        _remove_s2_annotations(node_clone)
        for descendant in node_clone.descendants:
            _remove_s2_annotations(descendant)

        node_symbols.append(
            # set node to 'symbol_node', not clone, as the node must have a parent for the
            # 'set_children' method. The clone will have had its parent removed.
            NodeSymbol(characters=characters, mathml=str(node_clone), node=symbol_node)
        )

    # Set the children of each symbols to descendant symbols beneath it in the tree.
    symbols = _set_children(node_symbols)
    return symbols


def _set_children(node_symbols: List[NodeSymbol]) -> List[Symbol]:

    symbols_by_node = {
        ns.node: Symbol(characters=ns.characters, mathml=ns.mathml, children=[])
        for ns in node_symbols
    }
    for node, symbol in symbols_by_node.items():
        parent = node.parent
        while parent is not None:
            if parent in symbols_by_node:
                parent_symbol = symbols_by_node[parent]
                parent_symbol.children.append(symbol)
                break
            parent = parent.parent

    return list(symbols_by_node.values())


def _get_character_index(node: Any) -> Optional[int]:
    if _is_node_annotated(node):
        return int(node["s2:index"])

    logging.warning("Node does not have position annotations: %s", node)
    return None


def _remove_s2_annotations(node: Any) -> None:
    if hasattr(node, "attrs"):
        for key in list(node.attrs.keys()):
            if key.startswith("s2:"):
                del node.attrs[key]
