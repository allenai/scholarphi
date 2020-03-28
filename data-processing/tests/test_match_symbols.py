from common.match_symbols import Match, get_mathml_matches

DEFAULT_TEX_PATH = "tex-path"
DEFAULT_EQUATION_INDEX = 0


def test_matches_self():
    mathml = "<mi>x</mi>"
    matches = get_mathml_matches([mathml])
    assert len(matches) == 1
    assert matches[mathml] == [Match(mathml, mathml, 1)]


def test_matches_symbol_with_shared_base():
    x_sub_i = "<msub><mi>x</mi><mi>i</mi></msub>"
    x_squared = "<msup><mi>x</mi><mn>2</mn></msup>"
    matches = get_mathml_matches([x_sub_i, x_squared], allow_self_matches=False)
    assert matches[x_sub_i] == [Match(x_sub_i, x_squared, 1)]
    assert matches[x_squared] == [Match(x_squared, x_sub_i, 1)]


def test_exact_match_ranks_higher_than_partial_match():
    x_sub_i = "<msub><mi>x</mi><mi>i</mi></msub>"
    x_squared = "<msup><mi>x</mi><mn>2</mn></msup>"
    matches = get_mathml_matches([x_sub_i, x_squared])
    assert matches[x_sub_i] == [
        Match(x_sub_i, x_sub_i, 1),
        Match(x_sub_i, x_squared, 2),
    ]


def test_does_not_match_base_to_subscript():
    i = "<mi>i</mi>"
    x_sub_i = "<msub><mi>x</mi><mi>i</mi></msub>"
    matches = get_mathml_matches([i, x_sub_i], allow_self_matches=False)
    assert i not in matches
    assert x_sub_i not in matches


def test_does_not_match_using_shared_subscript():
    x_sub_i = "<msub><mi>x</mi><mi>i</mi></msub>"
    t_sub_i = "<msub><mi>t</mi><mi>i</mi></msub>"
    matches = get_mathml_matches([x_sub_i, t_sub_i], allow_self_matches=False)
    assert x_sub_i not in matches
    assert t_sub_i not in matches


def test_omit_duplicate_matches():
    x1 = "<msub><mi>x</mi><mn>1</mn></msub>"
    x2 = "<msub><mi>x</mi><mn>2</mn></msub>"
    # While x2 is included in the list of MathML equations twice, only one match between
    # x1 and x2 should be included in the matches data.
    matches = get_mathml_matches([x1, x2, x2], allow_self_matches=False)
    assert len(matches[x1]) == 1
