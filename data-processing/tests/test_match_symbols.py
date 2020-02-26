from common.match_symbols import Match, get_mathml_matches

DEFAULT_TEX_PATH = "tex-path"
DEFAULT_EQUATION_INDEX = 0


def test_matches_self():
    matches = get_mathml_matches(["<mi>x</mi>"])
    assert len(matches) == 1
    assert matches["<mi>x</mi>"] == [Match("<mi>x</mi>", 1)]


def test_matches_children_at_lower_rank():
    matches = get_mathml_matches(["<msub><mi>x</mi><mi>i</mi></msub>"])
    assert matches == {
        "<msub><mi>x</mi><mi>i</mi></msub>": [
            Match("<msub><mi>x</mi><mi>i</mi></msub>", 1),
            Match("<mi>x</mi>", 2),
            Match("<mi>i</mi>", 3),
        ]
    }
