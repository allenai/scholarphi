import re

from explanations.colorize_tex import (
    COLOR_MACROS,
    COLOR_MACROS_BASE_MACROS,
    COLOR_MACROS_LATEX_IMPORTS,
    COLOR_MACROS_TEX_IMPORTS,
    add_color_macros,
    colorize_citations,
    colorize_equation_tokens,
    colorize_equations,
)
from explanations.types import FileContents, TokenWithOrigin

COLOR_PATTERN = (
    r"\\llap{\\scholarsetcolor\[rgb\]{[0-9.]+,[0-9.]+,[0-9.]+}}"
    + r"(.*?)"
    + r"\\llap{\\scholarrevertcolor}"
)


def test_add_color_macros_to_tex():
    tex = "Body text"
    with_macros = add_color_macros(tex)
    assert with_macros == "\n".join(
        [
            COLOR_MACROS_BASE_MACROS,
            COLOR_MACROS_TEX_IMPORTS,
            COLOR_MACROS,
            "",
            "Body text",
        ]
    )


def test_add_color_macros_to_latex():
    """
    For LaTeX, macros must be placed beneath the \\documentclass command.
    """
    tex_lines = [
        "\\documentclass{article}",
        "\\usepackage{otherpackage}",
        "\\begin{document}",
        "Body text",
        "\\end{document}",
    ]
    tex = "\n".join(tex_lines)
    with_macros = add_color_macros(tex)
    assert with_macros == "\n".join(
        tex_lines[0:2]
        + ["", COLOR_MACROS_BASE_MACROS, COLOR_MACROS_LATEX_IMPORTS, COLOR_MACROS,]
        + tex_lines[2:]
    )


def test_color_citations():
    tex = "word.~\\cite{source1,source2}"
    colorized, citations = next(colorize_citations(tex, insert_color_macros=False))
    assert colorized.startswith("word.~")
    print(colorized)
    matches = re.findall(COLOR_PATTERN, colorized)
    assert matches[0] == "\\cite{source1,source2}"
    assert len(citations) == 1
    assert citations[0].data["keys"] == ["source1", "source2"]


def test_disable_hyperref_colors():
    tex = "\n".join(
        ["\\usepackage[colorlinks=true,citecolor=blue]{hyperref}", "\\cite{source}"]
    )
    colorized, _ = next(colorize_citations(tex))
    assert "colorlinks=false" in colorized


def test_color_equations():
    tex = "$eq1$ and $eq2$"
    colorized, equations = next(colorize_equations(tex, insert_color_macros=False))
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 2
    assert matches[0] == "$eq1$"
    assert matches[1] == "$eq2$"

    equation0_info = equations[0]
    assert isinstance(equation0_info.hue, float)
    assert equation0_info.identifier["index"] == 0
    assert equation0_info.data["content_tex"] == "eq1"


def test_color_equation_in_argument():
    tex = "\\caption{$eq1$}"
    colorized, _ = next(colorize_equations(tex, insert_color_macros=False))
    assert colorized.startswith("\\caption")
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 1
    assert matches[0] == "$eq1$"


def test_color_tokens():
    file_contents = {"file": FileContents("file", "$ignore$ $x + y$", "encoding")}
    tokens = [
        TokenWithOrigin(
            tex_path="file",
            equation_index=1,
            equation="$x + y$",
            token_index=0,
            start=0,
            end=1,
            text="x",
        ),
        TokenWithOrigin(
            tex_path="file",
            equation_index=1,
            equation="$x + y$",
            token_index=1,
            start=4,
            end=5,
            text="y",
        ),
    ]
    colorized_files, _ = next(
        colorize_equation_tokens(file_contents, tokens, insert_color_macros=False)
    )
    colorized = colorized_files["file"].contents
    assert colorized.startswith("$ignore$")
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 2
    assert matches[0] == "x"
    assert matches[1] == "y"


def test_color_hats_dots():
    file_contents = {"file": FileContents("file", "$\\hat x + \\dot  y$", "encoding")}
    tokens = [
        TokenWithOrigin(
            tex_path="file",
            equation_index=0,
            equation="$\\hat x + \\dot  y$",
            token_index=0,
            start=5,
            end=6,
            text="x",
        ),
        TokenWithOrigin(
            tex_path="file",
            equation_index=0,
            equation="$\\hat x + \\dot  y$",
            token_index=1,
            start=15,
            end=16,
            text="y",
        ),
    ]
    colorized_files, _ = next(
        colorize_equation_tokens(file_contents, tokens, insert_color_macros=False)
    )
    colorized = colorized_files["file"].contents
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 2
    assert matches[0] == "\\hat x"
    assert matches[1] == "\\dot  y"


def test_color_inside_brackets():
    file_contents = {"file": FileContents("file", "${x}$", "encoding")}
    tokens = [
        TokenWithOrigin(
            tex_path="file",
            equation_index=0,
            equation="{x}",
            token_index=0,
            start=0,
            end=3,
            text="x",
        )
    ]
    colorized_files, _ = next(
        colorize_equation_tokens(file_contents, tokens, insert_color_macros=False)
    )
    colorized = colorized_files["file"].contents
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 1
    assert matches[0] != "{x}"
    assert matches[0] == "x"


def test_adjust_indexes_to_within_bounds():
    file_contents = {"file": FileContents("file", "$x$ ignore text after", "encoding")}
    tokens = [
        TokenWithOrigin(
            tex_path="file",
            equation_index=0,
            equation="$x$",
            token_index=0,
            start=0,
            # For reasons I don't yet know, KaTeX sometimes returns character indexes that are
            # outside the equation. This will result in coloring bleeding over the edges of
            # equations into the surrounding text, and sometimes TeX compilation errors.
            end=10,
            text="x",
        )
    ]
    colorized_files, _ = next(
        colorize_equation_tokens(file_contents, tokens, insert_color_macros=False)
    )
    colorized = colorized_files["file"].contents
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 1
    assert matches[0] == "x"


def test_color_subscripts():
    file_contents = {
        "file": FileContents("file", "$x_i x^i x\\sp1 x\\sb1$", "encoding")
    }
    tokens = [
        TokenWithOrigin(
            tex_path="file",
            equation_index=0,
            equation="$x_i x^i x\\sp1 x\\sb1$",
            token_index=0,
            start=2,
            end=3,
            text="i",
        ),
        TokenWithOrigin(
            tex_path="file",
            equation_index=0,
            equation="$x_i x^i x\\sp1 x\\sb1$",
            token_index=1,
            start=6,
            end=7,
            text="i",
        ),
        TokenWithOrigin(
            tex_path="file",
            equation_index=0,
            equation="$x_i x^i x\\sp1 x\\sb1$",
            token_index=2,
            start=12,
            end=13,
            text="1",
        ),
        TokenWithOrigin(
            tex_path="file",
            equation_index=0,
            equation="$x_i x^i x\\sp1 x\\sb1$",
            token_index=3,
            start=18,
            end=19,
            text="1",
        ),
    ]
    colorized_files, _ = next(
        colorize_equation_tokens(file_contents, tokens, insert_color_macros=False)
    )
    colorized = colorized_files["file"].contents
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 4
    # Subscript and superscript commands must also be wrapped in the coloring commands
    assert matches[0] == "_i"
    assert matches[1] == "^i"
    assert matches[2] == "\\sp1"
    assert matches[3] == "\\sb1"
