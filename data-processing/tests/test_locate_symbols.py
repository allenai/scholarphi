from common.bounding_box import get_symbol_bounding_box
from common.types import BoundingBox, Symbol, SymbolId, Token, TokenId


def token_id(start: int, end: int) -> TokenId:
    return TokenId("tex-path", 0, start, end)


def symbol(tokens, start=-1, end=-1):
    return Symbol(
        tex="<symbol-tex>",
        tokens=tokens,
        mathml="<mathml>",
        children=[],
        parent=None,
        start=start,
        end=end,
        contains_affix=False,
    )


def symbol_id():
    return SymbolId("tex-path", 0, 0)


def test_get_none_if_no_matching_tokens():
    s = symbol(tokens=[])
    token_locations = {}
    box = get_symbol_bounding_box(s, symbol_id(), token_locations)
    assert box is None


def test_get_token_bounding_box():
    s = symbol(tokens=[Token("x", "atom", 0, 1)])
    token_locations = {token_id(0, 1): [BoundingBox(0.01, 0.01, 0.01, 0.01, 0)]}
    box = get_symbol_bounding_box(s, symbol_id(), token_locations)
    assert box == BoundingBox(0.01, 0.01, 0.01, 0.01, 0)


def test_merge_bounding_boxes():
    s = symbol(tokens=[Token("x", "atom", 0, 1), Token("y", "atom", 2, 3)])
    token_locations = {
        token_id(0, 1): [
            BoundingBox(0.01, 0.01, 0.01, 0.01, 0),
            # Expand the bounding box downward .01 of the page
            BoundingBox(0.01, 0.02, 0.01, 0.01, 0),
        ],
        # Expand the bounding box rightward 10 pixels
        token_id(2, 3): [BoundingBox(0.02, 0.01, 0.01, 0.01, 0)],
        # Ignore this bounding box for an irrelevant token
        token_id(4, 5): [BoundingBox(0.03, 0.01, 0.01, 0.01, 0)],
    }
    box = get_symbol_bounding_box(s, symbol_id(), token_locations)
    assert box.left == 0.01
    assert box.top == 0.01
    assert abs(box.width - 0.02) < 0.0001
    assert abs(box.height - 0.02) < 0.0001
