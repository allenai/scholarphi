import re

from common.colorize_tex import (
    COLOR_MACROS,
    COLOR_MACROS_BASE_MACROS,
    COLOR_MACROS_LATEX_IMPORTS,
    COLOR_MACROS_TEX_IMPORTS,
    add_color_macros,
    colorize_citations,
    colorize_entities,
    colorize_equation_tokens,
)
from common.types import Equation, FileContents, SerializableEntity, TokenWithOrigin

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


def test_color_entity():
    tex = "word entity word"
    entity = SerializableEntity(
        start=5,
        end=11,
        tex_path="main.tex",
        id_="id",
        tex="entity",
        context_tex="word entity word",
    )
    colorized, _ = next(colorize_entities(tex, [entity], insert_color_macros=False))
    assert colorized.startswith("word ")
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 1
    assert matches[0] == "entity"


def equation(
    content_tex: str,
    offset: int = 0,
    before: str = "$",
    after: str = "$",
    depth: int = 0,
    index: int = 0,
) -> Equation:
    tex = before + content_tex + after
    return Equation(
        start=offset,
        end=offset + len(tex),
        tex_path="main.tex",
        id_=str(index),
        tex=tex,
        context_tex=tex,
        i=index,
        content_start=offset + len(before),
        content_end=offset + len(tex) - len(after),
        content_tex=content_tex,
        katex_compatible_tex=content_tex,
        depth=depth,
    )


def test_color_tokens():
    file_contents = {
        "main.tex": FileContents("main.tex", "$ignore$ $x + y$", "encoding")
    }
    eq = equation("x + y", offset=9)
    tokens = [
        TokenWithOrigin(
            tex_path="main.tex", equation=eq, token_index=0, start=0, end=1, text="x",
        ),
        TokenWithOrigin(
            tex_path="main.tex", equation=eq, token_index=1, start=4, end=5, text="y",
        ),
    ]
    colorized_files, _ = next(
        colorize_equation_tokens(file_contents, tokens, insert_color_macros=False)
    )
    colorized = colorized_files["main.tex"].contents
    assert colorized.startswith("$ignore$")
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 2
    assert matches[0] == "x"
    assert matches[1] == "y"


def test_color_inside_brackets():
    file_contents = {"main.tex": FileContents("main.tex", "${x}$", "encoding")}
    eq = equation("{x}", offset=0)
    tokens = [
        TokenWithOrigin(
            tex_path="main.tex", equation=eq, token_index=0, start=0, end=3, text="x",
        )
    ]
    colorized_files, _ = next(
        colorize_equation_tokens(file_contents, tokens, insert_color_macros=False)
    )
    colorized = colorized_files["main.tex"].contents
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 1
    assert matches[0] != "{x}"
    assert matches[0] == "x"


def test_adjust_indexes_to_within_bounds():
    file_contents = {
        "main.tex": FileContents("main.tex", "$x$ ignore text after", "encoding")
    }
    e = equation("x", offset=0)
    tokens = [
        TokenWithOrigin(
            tex_path="main.tex",
            equation=e,
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
    colorized = colorized_files["main.tex"].contents
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 1
    assert matches[0] == "x"


def test_dont_color_nested_equations():
    file_contents = {
        "main.tex": FileContents(
            "main.tex", "\\begin{equation}\\hbox{$x$}\\end{equation}", "encoding"
        )
    }
    outer = equation(
        "\\hbox{$x$}",
        index=0,
        offset=0,
        before="\\begin{equation}",
        after="\\end{equation}",
        depth=0,
    )
    inner = equation("x", index=1, offset=22, depth=1)
    # Simulate the same token being found twice: once within the outer equation, and once within
    # the inner equation. It should only be colorized relative to the outer (highest depth) equation.
    tokens = [
        TokenWithOrigin(
            tex_path="main.tex",
            equation=outer,
            token_index=0,
            start=7,
            end=8,
            text="x",
        ),
        TokenWithOrigin(
            tex_path="main.tex",
            equation=inner,
            token_index=0,
            start=0,
            end=1,
            text="x",
        ),
    ]
    colorized_files, _ = next(
        colorize_equation_tokens(file_contents, tokens, insert_color_macros=False)
    )
    colorized = colorized_files["main.tex"].contents
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 1
    assert matches[0] == "x"
