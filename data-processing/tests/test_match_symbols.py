from common.match_symbols import Match, get_mathml_matches

DEFAULT_TEX_PATH = "tex-path"
DEFAULT_EQUATION_INDEX = 0


def test_matches_self():
    mathml = "<mi>x</mi>"
    matches = get_mathml_matches([mathml])
    assert len(matches) == 1
    assert matches[mathml] == [Match(mathml, mathml, 1)]


def test_matches_children_at_lower_rank():
    parent_mathml = "<msub><mi>x</mi><mi>i</mi></msub>"
    matches = get_mathml_matches([parent_mathml])
    assert matches == {
        parent_mathml: [
            Match(parent_mathml, parent_mathml, 1),
            Match(parent_mathml, "<mi>x</mi>", 2),
            Match(parent_mathml, "<mi>i</mi>", 3),
        ]
    }
