import re

from explanations.colorize_tex import (
    TokenWithOrigin,
    colorize_citations,
    colorize_equation_tokens,
    colorize_equations,
)

COLOR_PATTERN = (
    r"\\llap{"
    + r"\\pdfcolorstack0 push {[0-9.]+ [0-9.]+ [0-9.]+ rg [0-9.]+ [0-9.]+ [0-9.]+ RG}}"
    + r"(.*?)"
    + r"\\llap{"
    + r"\\pdfcolorstack0 pop}"
)


def test_color_citations():
    tex = "word.~\\cite{source1,source2}"
    colorized, citations = next(colorize_citations(tex))
    assert colorized.startswith("word.~")
    print(colorized)
    matches = re.findall(COLOR_PATTERN, colorized)
    assert matches[0] == "\\cite{source1,source2}"
    assert len(citations) == 1
    assert citations[0].keys == ["source1", "source2"]


def test_disable_hyperref_colors():
    tex = "\n".join(
        ["\\usepackage[colorlinks=true,citecolor=blue]{hyperref}", "\\cite{source}"]
    )
    colorized, _ = next(colorize_citations(tex))
    assert "colorlinks=false" in colorized


def test_color_equations():
    tex = "$eq1$ and $eq2$"
    colorized, equations = next(colorize_equations(tex))
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 2
    assert matches[0] == "eq1"
    assert matches[1] == "eq2"

    equation0_info = equations[0]
    assert isinstance(equation0_info.hue, float)
    assert equation0_info.tex == "eq1"
    assert equation0_info.i == 0


def test_color_equation_in_argument():
    tex = "\\caption{$eq1$}"
    colorized, _ = next(colorize_equations(tex))
    assert colorized.startswith("\\caption")
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 1
    assert matches[0] == "eq1"


def test_color_tokens():
    file_contents = {"file": "$ignore$ $x + y$"}
    tokens = [
        TokenWithOrigin(
            tex_path="file", equation_index=1, token_index=0, start=0, end=1, text="x"
        ),
        TokenWithOrigin(
            tex_path="file", equation_index=1, token_index=1, start=4, end=5, text="y"
        ),
    ]
    colorized_files, _ = next(colorize_equation_tokens(file_contents, tokens))
    colorized = colorized_files["file"]
    assert colorized.startswith("$ignore$")
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 2
    assert matches[0] == "x"
    assert matches[1] == "y"


def test_color_subscripts():
    file_contents = {"file": "$x_i x^i x\\sp1 x\\sb1$"}
    tokens = [
        TokenWithOrigin(
            tex_path="file", equation_index=0, token_index=0, start=2, end=3, text="i"
        ),
        TokenWithOrigin(
            tex_path="file", equation_index=0, token_index=1, start=6, end=7, text="i"
        ),
        TokenWithOrigin(
            tex_path="file", equation_index=0, token_index=2, start=12, end=13, text="1"
        ),
        TokenWithOrigin(
            tex_path="file", equation_index=0, token_index=3, start=18, end=19, text="1"
        ),
    ]
    colorized_files, _ = next(colorize_equation_tokens(file_contents, tokens))
    colorized = colorized_files["file"]
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 4
    # Subscript and superscript commands must also be wrapped in the coloring commands
    assert matches[0] == "_i"
    assert matches[1] == "^i"
    assert matches[2] == "\\sp1"
    assert matches[3] == "\\sb1"
