from common.bounding_box import get_symbol_bounding_box
from common.types import BoundingBox, Symbol, SymbolId, TokenId


def token_id(token_index: int) -> TokenId:
    return TokenId("tex-path", 0, token_index)


def symbol(tokens):
    return Symbol(tokens=tokens, mathml="<mathml>", children=[])


def symbol_id():
    return SymbolId("tex-path", 0, 0)


def test_get_none_if_no_matching_tokens():
    s = symbol(tokens=[])
    token_locations = {}
    box = get_symbol_bounding_box(s, symbol_id(), token_locations)
    assert box is None


def test_get_token_bounding_box():
    s = symbol(tokens=[0])
    token_locations = {token_id(0): [BoundingBox(0.01, 0.01, 0.01, 0.01, 0)]}
    box = get_symbol_bounding_box(s, symbol_id(), token_locations)
    assert box == BoundingBox(0.01, 0.01, 0.01, 0.01, 0)


def test_merge_bounding_boxes():
    s = symbol(tokens=[0, 1])
    token_locations = {
        token_id(0): [
            BoundingBox(0.01, 0.01, 0.01, 0.01, 0),
            # Expand the bounding box downward .01 of the page
            BoundingBox(0.01, 0.02, 0.01, 0.01, 0),
        ],
        # Expand the bounding box rightward 10 pixels
        token_id(1): [BoundingBox(0.02, 0.01, 0.01, 0.01, 0)],
        # Ignore this bounding box for an irrelevant token
        token_id(2): [BoundingBox(0.03, 0.01, 0.01, 0.01, 0)],
    }
    box = get_symbol_bounding_box(s, symbol_id(), token_locations)
    assert box.left == 0.01
    assert box.top == 0.01
    assert abs(box.width - 0.02) < 0.0001
    assert abs(box.height - 0.02) < 0.0001
