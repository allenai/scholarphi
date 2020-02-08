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
from explanations.types import Equation, FileContents, TokenWithOrigin

COLOR_PATTERN = (
    r"\\scholarsetcolor\[rgb\]{[0-9.]+,[0-9.]+,[0-9.]+}"
    + r"(.*?)"
    + r"\\scholarrevertcolor"
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
    tex = "\n".join(["\\documentclass{article}", "word.~\\cite{source1,source2}"])
    bibitem_keys = ["source2"]
    colorized, citations = next(colorize_citations(tex, bibitem_keys))
    assert re.search(
        r"\\scholarregistercitecolor{source2}{[0-9.]+}{[0-9.]+}{[0-9.]+}", colorized
    )
    assert len(citations) == 1
    assert citations[0].key == "source2"


def test_no_disable_hyperref_colors():
    """
    In previous versions of the pipeline, we disabled the hyperref colors so that they won't
    interfere with the citation colors. We've since found another workaround. In the current
    pipeline, colorlinks shouldn't be disabled, and the citation color should be preserved.
    """
    tex = "\n".join(
        [
            "\\documentclass{article}",
            "\\usepackage[colorlinks=true,citecolor=blue]{hyperref}",
            "\\cite{source}",
        ]
    )
    colorized, _ = next(colorize_citations(tex, ["source"]))
    assert "\\usepackage[colorlinks=true,citecolor=blue]{hyperref}" in colorized


def test_color_equations():
    tex = "$eq1$ and $eq2$"
    colorized, equations = next(colorize_equations(tex, insert_color_macros=False))
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 2
    assert matches[0] == "eq1"
    assert matches[1] == "eq2"

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
    assert matches[0] == "eq1"


def test_color_tokens():
    file_contents = {"file": FileContents("file", "$ignore$ $x + y$", "encoding")}
    equation = Equation(9, 16, 1, "$x + y$", 10, 15, "x + y", 0)
    tokens = [
        TokenWithOrigin(
            tex_path="file", equation=equation, token_index=0, start=0, end=1, text="x",
        ),
        TokenWithOrigin(
            tex_path="file", equation=equation, token_index=1, start=4, end=5, text="y",
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


def test_color_inside_brackets():
    file_contents = {"file": FileContents("file", "${x}$", "encoding")}
    equation = Equation(0, 5, 0, "${x}$", 1, 4, "{x}", 0)
    tokens = [
        TokenWithOrigin(
            tex_path="file", equation=equation, token_index=0, start=0, end=3, text="x",
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
    equation = Equation(0, 3, 0, "$x$", 1, 2, "x", 0)
    tokens = [
        TokenWithOrigin(
            tex_path="file",
            equation=equation,
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


def test_dont_color_nested_equations():
    file_contents = {
        "file": FileContents(
            "file", "\\begin{equation}\\hbox{$x$}\\end{equation}", "encoding"
        )
    }
    outer_equation = Equation(
        0,
        40,
        1,
        "\\begin{equation}\\hbox{$x$}\\end{equation}",
        16,
        24,
        "\\hbox{$x$}",
        depth=0,
    )
    inner_equation = Equation(22, 25, 0, "$x$", 1, 2, "x", depth=1)
    # Simulate the same token being found twice: once within the outer equation, and once within
    # the inner equation.
    tokens = [
        TokenWithOrigin(
            tex_path="file",
            equation=outer_equation,
            token_index=0,
            start=7,
            end=8,
            text="x",
        ),
        TokenWithOrigin(
            tex_path="file",
            equation=inner_equation,
            token_index=0,
            start=0,
            end=1,
            text="x",
        ),
    ]
    colorized_files, _ = next(
        colorize_equation_tokens(file_contents, tokens, insert_color_macros=False)
    )
    colorized = colorized_files["file"].contents
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 1
    assert matches[0] == "x"
