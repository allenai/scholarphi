import re

from common.colorize_tex import (
    COLOR_MACROS,
    COLOR_MACROS_BASE_MACROS,
    COLOR_MACROS_LATEX_IMPORTS,
    COLOR_MACROS_TEX_IMPORTS,
    add_color_macros,
    colorize_entities,
)
from common.types import ColorizeOptions, SerializableEntity, SerializableToken
from entities.citations.colorize import colorize_citations
from entities.citations.types import Bibitem
from entities.symbols.colorize import (
    adjust_color_positions as adjust_token_color_positions,
)

COLOR_PATTERN = (
    r"\\scholarsetcolor\[rgb\]{[0-9.]+,[0-9.]+,[0-9.]+}"
    + r"(.*?)"
    + r"\\scholarrevertcolor{}\\message\{.*\}"
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


def bibitem(key: str) -> Bibitem:
    return Bibitem(
        id_=key,
        text="text",
        start=-1,
        end=-1,
        tex_path="N/A",
        tex="N/A",
        context_tex="N/A",
        bibitem_code="\{journal}{Colors} text"
    )


def test_color_citations():
    tex = "\n".join(["\\documentclass{article}", "word.~\\cite{source1,source2}"])
    result = colorize_citations(tex, [bibitem("source2")])
    colorized = result.tex
    hues = result.entity_hues
    assert re.search(
        r"\\scholarregistercitecolor{source2}{[0-9.]+}{[0-9.]+}{[0-9.]+}", colorized
    )
    assert len(hues) == 1
    assert list(hues.keys()) == ["source2"]


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
    colorized = colorize_citations(tex, [bibitem("source")]).tex
    assert "\\usepackage[colorlinks=true,citecolor=blue]{hyperref}" in colorized


COLORIZE_ENTITY_TEST_OPTIONS = ColorizeOptions(insert_color_macros=False)


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
    colorized = colorize_entities(
        tex,
        [entity],
        # In the tests below, don't insert the color macro definitions in the preambles or the
        # openings of the TeX files, to keep the offsets of the entities in predictable places.
        options=ColorizeOptions(insert_color_macros=False),
    ).tex
    assert colorized.startswith("word ")
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 1
    assert matches[0] == "entity"


def test_color_inside_braces():
    tex = "word entity word"
    entity = SerializableEntity(
        start=5,
        end=11,
        tex_path="main.tex",
        id_="id",
        tex="entity",
        context_tex="word entity word",
    )
    colorized = colorize_entities(
        tex, [entity], ColorizeOptions(insert_color_macros=False, braces=True)
    ).tex
    matches = re.findall(r"\{" + COLOR_PATTERN + r"\}", colorized)
    assert len(matches) == 1
    assert matches[0] == "entity"


def test_skip_overlapping_entities():
    tex = "(outer (inner))"
    outer = SerializableEntity(
        start=1,
        end=13,
        tex_path="main.tex",
        id_="id-outer",
        tex="outer (inner)",
        context_tex=tex,
    )
    inner = SerializableEntity(
        start=7,
        end=12,
        tex_path="main.tex",
        id_="id-inner",
        tex="inner",
        context_tex=tex,
    )
    result = colorize_entities(
        tex, [outer, inner], ColorizeOptions(insert_color_macros=False)
    )
    colorized = result.tex
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 1
    assert len(result.skipped) == 1
    assert result.skipped[0] in [outer, inner]


def token(
    equation_start: int,
    relative_start: int,
    relative_end: int,
    tex: str,
    equation_tex: str,
    id_: str = "1",
    equation_index: int = 0,
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
        text=text,
        equation_depth=equation_depth,
        relative_start=relative_start,
        relative_end=relative_end,
        type_="atom",
    )


def test_adjust_token_color_locations_to_within_equation_bounds():
    equation_tex = "x"
    t = token(
        equation_start=1,
        relative_start=0,
        # For reasons I don't yet know, KaTeX sometimes returns character indexes that are
        # outside the equation. This will result in coloring bleeding over the edges of
        # equations into the surrounding text, and sometimes TeX compilation errors.
        relative_end=9,
        tex="x",
        equation_tex=equation_tex,
    )
    color_positions = adjust_token_color_positions(t)
    assert color_positions.start == 1
    assert color_positions.end == 2
