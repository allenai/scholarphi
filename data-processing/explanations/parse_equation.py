import copy
from typing import Any, List, NamedTuple, Optional

from bs4 import BeautifulSoup

CharacterIndex = int


class Character(NamedTuple):
    text: str
    i: CharacterIndex
    start: int
    end: int


class Symbol(NamedTuple):
    characters: List[CharacterIndex]
    mathml: str


CHARACTER_TAGS = ["mi"]
SYMBOL_TAGS = ["msubsup", "msub", "msup", "mi"]


def get_characters(mathml: str) -> List[Character]:
    soup = BeautifulSoup(mathml, "lxml")
    characters = []
    for node in soup.find_all(CHARACTER_TAGS):
        assert (
            "s2:start" in node.attrs
            and "s2:end" in node.attrs
            and "s2:index" in node.attrs
        )
        characters.append(
            Character(
                text=node.text,
                i=int(node["s2:index"]),
                start=int(node["s2:start"]),
                end=int(node["s2:end"]),
            )
        )
    return characters


def _get_character_index(node: Any) -> Optional[int]:
    try:
        assert (
            "s2:start" in node.attrs
            and "s2:end" in node.attrs
            and "s2:index" in node.attrs
        )
        return int(node["s2:index"])
    except (AssertionError, KeyError, ValueError):
        return None


def _remove_s2_annotations(node: Any) -> None:
    if hasattr(node, "attrs"):
        for key in list(node.attrs.keys()):
            if key.startswith("s2:"):
                del node.attrs[key]


def get_symbols(mathml: str) -> List[Symbol]:
    soup = BeautifulSoup(mathml, "lxml")
    symbols = []
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

        # Clean the MathML of our annotations, to save with the symbol.
        node_clone = copy.copy(symbol_node)
        _remove_s2_annotations(node_clone)
        for descendant in node_clone.descendants:
            _remove_s2_annotations(descendant)

        symbols.append(Symbol(characters=characters, mathml=str(node_clone)))

    return symbols
