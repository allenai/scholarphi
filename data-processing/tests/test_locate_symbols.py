from explanations.bounding_box import get_symbol_bounding_box
from explanations.types import CharacterId, PdfBoundingBox, Symbol, SymbolId


def character_id(character_index: int) -> CharacterId:
    return CharacterId("tex-path", 0, character_index)


def symbol(characters):
    return Symbol(characters=characters, mathml="<mathml>", children=[])


def symbol_id():
    return SymbolId("tex-path", 0, 0)


def test_get_none_if_no_matching_characters():
    s = symbol(characters=[])
    character_locations = {}
    box = get_symbol_bounding_box(s, symbol_id(), character_locations)
    assert box is None


def test_get_character_bounding_box():
    s = symbol(characters=[0])
    character_locations = {character_id(0): [PdfBoundingBox(0, 0, 10, 10, 0)]}
    box = get_symbol_bounding_box(s, symbol_id(), character_locations)
    assert box == PdfBoundingBox(0, 0, 10, 10, 0)


def test_merge_bounding_boxes():
    s = symbol(characters=[0, 1])
    character_locations = {
        character_id(0): [
            PdfBoundingBox(0, 0, 10, 10, 0),
            # Expand the bounding box downward 10 pixels
            PdfBoundingBox(0, 10, 10, 10, 0),
        ],
        # Expand the bounding box rightward 10 pixels
        character_id(1): [PdfBoundingBox(10, 0, 10, 10, 0)],
        # Ignore this bounding box for an irrelevant character
        character_id(2): [PdfBoundingBox(20, 0, 10, 10, 0)],
    }
    box = get_symbol_bounding_box(s, symbol_id(), character_locations)
    assert box == PdfBoundingBox(0, 0, 20, 20, 0)
