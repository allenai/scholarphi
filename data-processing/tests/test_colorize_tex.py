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
from common.types import Equation, FileContents, SerializableEntity, SerializableToken

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
        + ["", COLOR_MACROS_BASE_MACROS, COLOR_MACROS_LATEX_IMPORTS]
        + [tex_lines[2]]
        + [COLOR_MACROS]
        + tex_lines[3:]
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


def token(
    equation_start: int,
    relative_start: int,
    relative_end: int,
    tex: str,
    equation_tex: str,
    id_: str = "1",
    equation_index: int = 0,
    token_index: int = 1,
    text: str = "symbol text",
    equation_depth: int = 0,
) -> SerializableToken:
    return SerializableToken(
        start=equation_start + relative_start,
        end=equation_start + relative_end,
        tex_path="main.tex",
        id_=id_,
        tex=tex,
        context_tex="context",
        equation=equation_tex,
        equation_index=equation_index,
        token_index=token_index,
        text=text,
        equation_depth=equation_depth,
        relative_start=relative_start,
        relative_end=relative_end,
    )


def test_color_tokens():
    equation_tex = "x + y"
    file_contents = {
        "main.tex": FileContents("main.tex", f"$ignore$ ${equation_tex}$", "encoding")
    }
    tokens = [
        token(
            equation_start=10,
            relative_start=0,
            relative_end=1,
            token_index=0,
            tex="x",
            equation_tex=equation_tex,
        ),
        token(
            equation_start=10,
            relative_start=4,
            relative_end=5,
            token_index=1,
            tex="y",
            equation_tex=equation_tex,
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
    equation_tex = "{x}"
    file_contents = {
        "main.tex": FileContents("main.tex", f"${equation_tex}$", "encoding")
    }
    tokens = [
        token(
            equation_start=1,
            relative_start=0,
            relative_end=3,
            tex="x",
            equation_tex=equation_tex,
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
    equation_tex = "x"
    file_contents = {
        "main.tex": FileContents(
            "main.tex", f"${equation_tex}$ ignore text after", "encoding"
        )
    }
    tokens = [
        token(
            equation_start=1,
            relative_start=0,
            # For reasons I don't yet know, KaTeX sometimes returns character indexes that are
            # outside the equation. This will result in coloring bleeding over the edges of
            # equations into the surrounding text, and sometimes TeX compilation errors.
            relative_end=9,
            tex="x",
            equation_tex=equation_tex,
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
    equation_outer_tex = "\\hbox{$x$}"
    equation_inner_tex = "x"
    # Simulate the same token being found twice: once within the outer equation, and once within
    # the inner equation. It should only be colorized relative to the outer (highest depth) equation.
    tokens = [
        token(
            equation_start=16,
            relative_start=7,
            relative_end=8,
            tex="x",
            equation_tex=equation_outer_tex,
            equation_depth=0,
        ),
        token(
            equation_start=23,
            relative_start=0,
            relative_end=1,
            tex="x",
            equation_tex=equation_inner_tex,
            equation_depth=1,
        ),
    ]
    colorized_files, _ = next(
        colorize_equation_tokens(file_contents, tokens, insert_color_macros=False)
    )
    colorized = colorized_files["main.tex"].contents
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 1
    assert matches[0] == "x"
