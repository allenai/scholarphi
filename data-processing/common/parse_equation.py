import copy
import logging
from typing import Any, List, NamedTuple, Optional

from bs4 import BeautifulSoup

from common.types import Character, CharacterIndex, Symbol


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
MERGABLE_PARENT_TAGS = ["mrow"]

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
    consecutive_chars: List[Symbol] = []
    all_indices: List[int] = []
    for symbol_node in soup.find_all_next(SYMBOL_TAGS):

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

        # Group consecutive character symbols only if they are a child of the mrow tag.
        # The .has_attr('s2:end') is necessary as not every symbol is annotated by katex
        if symbol_node.has_attr('s2:end') and symbol_node.parent.name in MERGABLE_PARENT_TAGS and symbol_node.name in CHARACTER_TAGS:
            if len(consecutive_chars) > 0 and not consecutive_chars[-1]['s2:end'] == symbol_node['s2:start']:
                node_symbols.append(_merge_consecutive_symbols(consecutive_chars, all_indices, soup.new_tag('mi')))
                consecutive_chars = []
                all_indices = []
            consecutive_chars.append(symbol_node)
            all_indices.extend(characters)
        elif len(consecutive_chars) > 0:
            node_symbols.append(_merge_consecutive_symbols(consecutive_chars, all_indices, soup.new_tag('mi')))
            consecutive_chars = []
            all_indices = []

        if len(consecutive_chars) == 0:
            # Clean the MathML of our annotations. Do this cleaning on a clone of the node, so that the
            # annotations are available for processing later nodes.
            node_clone = _clean_node_of_annotations(symbol_node)
            node_symbols.append(
                # set node to 'symbol_node', not clone, as the node must have a parent for the
                # 'set_children' method. The clone will have had its parent removed.
                NodeSymbol(characters=characters, mathml=str(node_clone), node=symbol_node)
            )

    # Possibility that the last symbol was part of a continuing symbol
    if len(consecutive_chars) > 0:
        node_symbols.append(_merge_consecutive_symbols(consecutive_chars, all_indices, soup.new_tag('mi')))

    # Set the children of each symbols to descendant symbols beneath it in the tree.
    symbols = _set_children(node_symbols)
    return symbols

# Removes s2 annotations from node and all descendants
def _clean_node_of_annotations(symbol_node: Symbol) -> Symbol:
    node_clone = copy.copy(symbol_node)
    _remove_s2_annotations(node_clone)
    for descendant in node_clone.descendants:
        _remove_s2_annotations(descendant)
    return node_clone

# Combines all symbols in consecutive_chars into one NodeSymbol
def _merge_consecutive_symbols(consecutive_chars: List[Symbol], all_indices: List[int], base_tag: Symbol) -> NodeSymbol:
    base_tag['s2:start'] = consecutive_chars[0]['s2:start']
    base_tag['s2:end'] = consecutive_chars[-1]['s2:end']
    base_tag['s2:index'] = consecutive_chars[0]['s2:index']
    base_tag.string  = ''.join(list(map(lambda node: node.string, consecutive_chars)))
    node_clone = _clean_node_of_annotations(base_tag)
    return NodeSymbol(characters=all_indices, mathml=str(node_clone), node=base_tag)

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
