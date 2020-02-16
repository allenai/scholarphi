from explanations.bounding_box import get_symbol_bounding_box
from explanations.types import BoundingBox, CharacterId, Symbol, SymbolId


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
    character_locations = {character_id(0): [BoundingBox(0.01, 0.01, 0.01, 0.01, 0)]}
    box = get_symbol_bounding_box(s, symbol_id(), character_locations)
    assert box == BoundingBox(0.01, 0.01, 0.01, 0.01, 0)


def test_merge_bounding_boxes():
    s = symbol(characters=[0, 1])
    character_locations = {
        character_id(0): [
            BoundingBox(0.01, 0.01, 0.01, 0.01, 0),
            # Expand the bounding box downward .01 of the page
            BoundingBox(0.01, 0.02, 0.01, 0.01, 0),
        ],
        # Expand the bounding box rightward 10 pixels
        character_id(1): [BoundingBox(0.02, 0.01, 0.01, 0.01, 0)],
        # Ignore this bounding box for an irrelevant character
        character_id(2): [BoundingBox(0.03, 0.01, 0.01, 0.01, 0)],
    }
    box = get_symbol_bounding_box(s, symbol_id(), character_locations)
    assert box.left == 0.01
    assert box.top == 0.01
    assert abs(box.width - 0.02) < 0.0001
    assert abs(box.height - 0.02) < 0.0001
