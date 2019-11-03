import colorsys
import logging
import re
from typing import Dict, Iterator, List, NamedTuple, Tuple

import numpy as np

from explanations.parse_tex import ParseListener, walk_tex_parse_tree
from explanations.types import (
    ColorizedCitation,
    ColorizedEquation,
    ColorizedTokens,
    ColorizedTokensByEquation,
    EquationIndex,
    Token,
)
from TexSoup import Buffer, OArg, RArg, TexCmd, TexEnv, TexNode, TokenWithPosition

"""
All TeX coloring operations follow the same process.

First, detect character positions of entities that need to be colorized. This is done by defining a
'ParseListener', which listens to a walk over the parse tree that TexSoup builds from TeX. TexSoup
is used as it has a pretty sophisticated (though not perfect) algorithm for finding structure,
commands, and environments in TeX.

Then, color the detected entities from last to first. Coloring should always start with the
entities with the highest character positions, and going in reverse until the entities with the
lowest. This is because inserting color commands will change positions of all text after the
colorized entity.

Entities will be colorized, each with a different hue. Once the colorizer runs out of new hues, it
returns the currently colorized TeX and list of colorized entities, then resets the TeX and
starts over from where it stopped, cylcing through the same hues again.
"""


# TODO(andrewhead): determine number of hues based on the number of hues that OpenCV is capable
# of distinguishing between. Current value is a guess.
NUM_HUES = 30
HUES = np.linspace(0, 1, NUM_HUES)


def generate_hues() -> Iterator[float]:
    for hue in HUES:
        yield hue
    logging.error(  # pylint: disable=logging-not-lazy
        (
            "Ran out of hues. It's likely many entities in the paper won't get colored."
            + "Must start over with another copy of the paper to keep coloring."
        )
    )


def _insert_color_in_tex(tex: str, hue: float, start: int, end: int) -> str:
    return (
        tex[:start]
        + _get_color_start_tex(hue)
        + tex[start:end]
        + _get_color_end_tex()
        + tex[end:]
    )


def _get_color_start_tex(hue: float) -> str:
    """
    Coloring macros were chosen carefully to satisfy a few needs:
    1. Be portable to many documents: llap should work in any TeX file. The pdfcolorstack commands
       will be available for any TeX files compiled with pdfTeX.
    2. Don't disrupt the layout of text: for example, without 'llap', these coloring commands
       insert "what's-it's" that can change hyphenation rules and therefore how the lines break. We
       observed that happening in some early tests. 'llap' seems to, in most [but not all??] cases
       avoid influencing how the text is laid out.

    Other approaches that didn't pan out (talk to andrewhead@ if you want to know why) but
    which might be worth looking into if you wanted to extend the coloring algorithm was using
    fcolorbox's, or soul's 'hl' (highlight) command. There are also some commands that output the
    location of boxes of TeX (e.g., 'zsavebox').

    Why use hues to color? It makes colorization and color detection easier. During colorization,
    hues can be used to express a color with a single number. During color detection (for finding
    bounding boxes of colorized entities), in the rasters of pages, the pixels of the edges of
    characters be faded and thus have different R, G, and B values no matter what the color. However,
    those same pixels will still have the same hue, just at a higher value or lower saturation.
    """
    red, green, blue = colorsys.hsv_to_rgb(hue, 1, 1)
    return r"\llap{{\pdfcolorstack0 push {{{red} {green} {blue} rg {red} {green} {blue} RG}}}}".format(
        red=red, green=green, blue=blue
    )


def _get_color_end_tex() -> str:
    return r"\llap{\pdfcolorstack0 pop}"


def colorize_citations(tex: str) -> Tuple[str, List[ColorizedCitation]]:

    citation_extractor = CitationExtractor()
    tex = _disable_hyperref_coloring(tex)
    walk_tex_parse_tree(tex, [citation_extractor])

    # Order from last-to-first so we can add color commands without messing with the offsets of
    # citations that haven't yet been colored.
    ordered_citations = sorted(
        citation_extractor.citations, key=lambda c: c.start, reverse=True
    )

    hue_generator = generate_hues()
    colorized_citations: List[ColorizedCitation] = []
    for c in ordered_citations:
        try:
            hue = next(hue_generator)
        except StopIteration:
            break
        tex = _insert_color_in_tex(tex, hue, c.start, c.end)
        colorized_citations.insert(0, ColorizedCitation(hue, c.keys))

    return tex, colorized_citations


class Citation(NamedTuple):
    keys: List[str]
    """
    Indexes of characters in TeX where the citation appears.
    """
    start: int
    end: int


class CitationExtractor(ParseListener):

    COMMAND_NAMES: List[str] = ["cite"]

    def __init__(self) -> None:
        self.citations: List[Citation] = []

    def on_node_parsed(
        self, buffer: Buffer, node: TexNode, start: int, end: int
    ) -> None:
        if isinstance(node, TexCmd):
            if node.name in self.COMMAND_NAMES:
                keys: List[str] = []
                for arg in node.args:
                    if isinstance(arg, RArg):
                        keys = arg.value.split(",")
                        break
                self.citations.append(Citation(keys, start, end))


def _disable_hyperref_coloring(tex: str) -> str:
    """
    Coloring from the hyperref package will overwrite the coloring of citations. Disable coloring
    from the hyperref package.
    """
    hyperref_color_extractor = HyperrefColorExtractor()
    walk_tex_parse_tree(tex, [hyperref_color_extractor])

    colorlinks_reverse_order = sorted(
        hyperref_color_extractor.colorlinks_assignments,
        key=lambda c: c.start,
        reverse=True,
    )

    for colorlinks_range in colorlinks_reverse_order:
        tex = (
            tex[: colorlinks_range.start]
            + "colorlinks=false"
            + tex[colorlinks_range.end :]
        )

    return tex


class HyperrefColorExtractor(ParseListener):
    def __init__(self) -> None:
        self.colorlinks_assignments: List[CharacterRange] = []

    def _is_node_hyperref_package(self, node: TexNode) -> bool:
        if not isinstance(node, TexCmd):
            return False

        if not node.name == "usepackage":
            return False

        for arg in node.args:
            if isinstance(arg, RArg):
                if arg.value.strip() == "hyperref":
                    return True

        return False

    def on_node_parsed(
        self, buffer: Buffer, node: TexNode, start: int, end: int
    ) -> None:
        if not self._is_node_hyperref_package(node):
            return

        for arg in node.args:
            if not isinstance(arg, OArg):
                continue

            for item in arg.contents:
                if isinstance(item, TokenWithPosition):
                    token_start = item.position
                    for match in re.finditer(
                        "(?:(?<=^)|(?<=,))\\s*colorlinks\\s*=\\s*true\\s*(?=,|$)",
                        str(item),
                    ):
                        self.colorlinks_assignments.append(
                            CharacterRange(
                                token_start + match.start(), token_start + match.end()
                            )
                        )


def colorize_equations(tex: str) -> Tuple[str, List[ColorizedEquation]]:
    equation_extractor = EquationExtractor()
    walk_tex_parse_tree(tex, [equation_extractor])

    equations_reverse_order = sorted(
        equation_extractor.equations, key=lambda e: e.start, reverse=True
    )

    hue_generator = generate_hues()
    colorized_equations: List[ColorizedEquation] = []
    for e in equations_reverse_order:
        try:
            hue = next(hue_generator)
        except StopIteration:
            break
        tex = _insert_color_in_tex(tex, hue, e.start, e.end)
        colorized_equations.insert(0, ColorizedEquation(hue, e.tex, e.i))

    return tex, colorized_equations


class Equation(NamedTuple):
    """
    TeX for full equation environment (e.g., "$x + y$").
    """

    tex: str
    """
    TeX for the equation markup, inside the environment (e.g., "x + y")
    """
    content_tex: str
    i: int
    """
    Indexes of characters in TeX where the equation appears.
    """
    start: int
    end: int
    """
    Index at which the equation markup starts (corresponds to start of 'content_tex'.)
    """
    content_start: int


class EquationExtractor(ParseListener):

    EQUATION_ENVIRONMENT_NAMES: List[str] = ["$"]

    def __init__(self) -> None:
        self.equations: List[Equation] = []

    def on_node_parsed(
        self, buffer: Buffer, node: TexNode, start: int, end: int
    ) -> None:
        if isinstance(node, TexEnv):
            if node.name in self.EQUATION_ENVIRONMENT_NAMES:
                tex = str(node)
                """
                XXX(andrewhead): the extraction of equation contents as the first element of
                'contents' only works because the TexSoup parser does not attempt to further parse
                what's inside an equation (i.e. other commands and nested equations). If the TexSoup
                parser is modified to parse equation internals, this code must be changed.
                """
                equation_contents = next(node.contents)
                assert isinstance(equation_contents, TokenWithPosition)
                content_tex = str(equation_contents)
                content_start = equation_contents.position
                index = len(self.equations)
                self.equations.append(
                    Equation(tex, content_tex, index, start, end, content_start)
                )


def colorize_equation_tokens(
    tex: str, tokens: Dict[EquationIndex, List[Token]]
) -> Tuple[str, ColorizedTokensByEquation]:
    equation_extractor = EquationExtractor()
    walk_tex_parse_tree(tex, [equation_extractor])

    equations_reverse_order = sorted(
        equation_extractor.equations, key=lambda e: e.content_start, reverse=True
    )

    for equation in equations_reverse_order:
        colorized_tokens_by_equation = {}
        if equation.i in tokens:
            tex, colorized_tokens = _colorize_tokens_in_equation(
                tex, equation, tokens[equation.i]
            )
            colorized_tokens_by_equation[equation.i] = colorized_tokens

    return tex, colorized_tokens_by_equation


def _colorize_tokens_in_equation(
    tex: str, equation: Equation, tokens: List[Token]
) -> Tuple[str, ColorizedTokens]:

    hue_generator = generate_hues()
    colorized_tokens = {}
    tokens_last_to_first = sorted(tokens, key=lambda t: t.start, reverse=True)

    for token in tokens_last_to_first:
        try:
            hue = next(hue_generator)
        except StopIteration:
            break

        token_start = token.start
        token_start = _adjust_start_coloring_index(token_start, equation.content_tex)

        tex = _insert_color_in_tex(
            tex,
            hue,
            equation.content_start + token_start,
            equation.content_start + token.end,
        )
        colorized_tokens[hue] = token

    return tex, colorized_tokens


def _adjust_start_coloring_index(index: int, equation: str) -> int:
    """
    It's invalid to start coloring right after subscript or superscript notation (_, ^, \\sb, \\sp).
    Instead, coloring commands must appear before the subscript or superscript notation.
    """
    equation_before_color = equation[:index]
    script_prefix = re.search(r"([_^]|(\\sp)|(\\sb))$", equation_before_color)
    if script_prefix is not None:
        prefix_length = len(script_prefix.group(0))
        return index - prefix_length
    return index


class CharacterRange(NamedTuple):
    start: int
    end: int
