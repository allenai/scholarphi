import colorsys
import logging
import re
from typing import Dict, Iterator, List, NamedTuple

import numpy as np

from explanations.parse_tex import (
    CitationExtractor,
    Equation,
    EquationExtractor,
    ParseListener,
    TexContents,
    TexFileName,
    walk_tex_parse_tree,
)
from explanations.types import (
    ColorizedCitation,
    ColorizedEquation,
    EquationId,
    TokenWithOrigin,
)
from TexSoup import Buffer, OArg, RArg, TexCmd, TexNode, TokenWithPosition

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

If you want a better sense of the colorization process, see the 'colorize_citations' method, which
has more explanatory comments than the other colorization methods.
"""


# TODO(andrewhead): determine number of hues based on the number of hues that OpenCV is capable
# of distinguishing between. Current value is a guess.
NUM_HUES = 30
HUES = np.linspace(0, 1, NUM_HUES)


def generate_hues() -> Iterator[float]:
    for hue in HUES:
        yield hue
    logging.debug(
        (
            "Out of hues. Hopefully the caller is restarting this generator to keep coloring."
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


class CharacterRange(NamedTuple):
    start: int
    end: int


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


class CitationColorizationBatch(NamedTuple):
    tex: str
    colorized_citations: List[ColorizedCitation]


def colorize_citations(tex: str, hue: float = None) -> Iterator[CitationColorizationBatch]:

    citation_extractor = CitationExtractor()
    tex = _disable_hyperref_coloring(tex)

    walk_tex_parse_tree(tex, [citation_extractor])

    # Order from last-to-first so we can add color commands without messing with the offsets of
    # citations that haven't yet been colored.
    citations_reverse_order = sorted(
        citation_extractor.citations, key=lambda c: c.start, reverse=True
    )

    hue_generator = generate_hues()
    colorized_citations: List[ColorizedCitation] = []

    colorized_tex = tex
    for c in citations_reverse_order:
        try:
            if hue is None:
                hue = next(hue_generator)
        except StopIteration:
            # When the hues run out, notify caller that a batch has been finished.
            # Provide the caller with the colorized tex and list of colors.
            yield CitationColorizationBatch(colorized_tex, colorized_citations)

            # Then reset the TeX so it is not colorized so we can start coloring with the
            # same hues without collisions. And clear the list of colors assigned.
            colorized_tex = tex
            colorized_citations = []

            # Reset the hue generator.
            hue_generator = generate_hues()

            # And get the hue for the next entity.
            if hue is None:
                hue = next(hue_generator)

        colorized_tex = _insert_color_in_tex(colorized_tex, hue, c.start, c.end)
        colorized_citations.insert(0, ColorizedCitation(hue, c.keys))

    # When finished coloring, check if there are any
    if len(colorized_citations) > 0:
        yield CitationColorizationBatch(colorized_tex, colorized_citations)


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


class EquationColorizationBatch(NamedTuple):
    tex: str
    colorized_equations: List[ColorizedEquation]


def colorize_equations(tex: str, hue: float = None) -> Iterator[EquationColorizationBatch]:
    # TODO(andrewhead): Refactor this to share code with colorize_citations.

    equation_extractor = EquationExtractor()
    walk_tex_parse_tree(tex, [equation_extractor])

    equations_reverse_order = sorted(
        equation_extractor.equations, key=lambda e: e.start, reverse=True
    )

    hue_generator = generate_hues()
    colorized_equations: List[ColorizedEquation] = []

    colorized_tex = tex
    for e in equations_reverse_order:
        try:
            if hue is None:
                hue = next(hue_generator)
        except StopIteration:
            yield EquationColorizationBatch(colorized_tex, colorized_equations)
            colorized_tex = tex
            colorized_equations = []
            hue_generator = generate_hues()
            if hue is None:
                hue = next(hue_generator)

        colorized_tex = _insert_color_in_tex(
            colorized_tex, hue, e.content_start, e.content_start + len(e.content_tex)
        )
        colorized_equations.insert(0, ColorizedEquation(hue, e.content_tex, e.i))

    if len(colorized_equations) > 0:
        yield EquationColorizationBatch(colorized_tex, colorized_equations)


class ColorizedTokenWithOrigin(NamedTuple):
    tex_path: str
    equation_index: int
    token_index: int
    start: int
    end: int
    text: str
    hue: float


class TokenColorizationBatch(NamedTuple):
    colorized_files: Dict[TexFileName, TexContents]
    colorized_tokens: List[ColorizedTokenWithOrigin]


def _get_tokens_for_equation(
    tokens: List[TokenWithOrigin], equation_index: int, tex_path: str
) -> List[TokenWithOrigin]:
    return list(
        filter(
            lambda t: t.tex_path == tex_path and t.equation_index == equation_index,
            tokens,
        )
    )


def colorize_equation_tokens(
    file_contents: Dict[TexFileName, TexContents], tokens: List[TokenWithOrigin], hue: float = None
) -> Iterator[TokenColorizationBatch]:

    equations_by_file: Dict[TexFileName, List[Equation]] = {}
    tokens_by_equation: Dict[EquationId, List[TokenWithOrigin]] = {}

    for token in tokens:
        equation_id = EquationId(token.tex_path, token.equation_index)
        if equation_id not in tokens_by_equation:
            tokens_by_equation[equation_id] = []
        tokens_by_equation[equation_id].append(token)

    for tex_filename, tex in file_contents.items():
        equation_extractor = EquationExtractor()
        walk_tex_parse_tree(tex, [equation_extractor])
        equations = equation_extractor.equations
        equations_by_file[tex_filename] = equations

    # Number of tokens to skip when coloring. Starts at 0, and increases with each pass of
    # coloring. Multiple passes will be needed as the distinct hues for tokens runs out fast.
    # Tokens are colored in parallel for all equations from all TeX files, as the search for
    # colors will be done within the bounding boxes detected for each equation independently.
    token_skip = 0

    more_batches = True
    while more_batches:

        colorized_files: Dict[TexFileName, TexContents] = {}
        colorized_tokens = []

        for tex_filename, tex in file_contents.items():
            colorized_tex = tex

            equations_reverse_order = sorted(
                equations_by_file[tex_filename],
                key=lambda e: e.content_start,
                reverse=True,
            )
            for equation in equations_reverse_order:
                equation_tokens = tokens_by_equation.get(
                    EquationId(tex_filename, equation.i)
                )
                if equation_tokens is not None:
                    colorized_tex, colorized_tokens_for_equation = _colorize_tokens_for_equation(
                        colorized_tex, equation, equation_tokens, token_skip, hue
                    )
                    colorized_tokens.extend(colorized_tokens_for_equation)

            colorized_files[tex_filename] = colorized_tex

        # If some tokens were colorized...
        if len(colorized_tokens) > 0:

            # Return batch of colorized tokens and colorized TeX
            yield TokenColorizationBatch(colorized_files, colorized_tokens)
            colorized_tokens = []
            colorized_files = {}

            # Continue coloring, starting from another set of tokens
            more_batches = True
            token_skip += NUM_HUES

        else:
            more_batches = False


class TokenEquationColorizationBatch(NamedTuple):
    colorized_tex: str
    colorized_tokens: List[ColorizedTokenWithOrigin]


def _colorize_tokens_for_equation(
    tex: str, equation: Equation, tokens: List[TokenWithOrigin], skip: int = 0, hue: float = None
) -> TokenEquationColorizationBatch:
    """
    Colorize tokens in an equation until there are no more hues.
    To keep colorizing tokens after the hues run out, call this function again, setting 'skip'
    to the number of tokens that were colored in previous calls.
    """

    hue_generator = generate_hues()
    colorized_tokens = []

    tokens_last_to_first = sorted(tokens, key=lambda t: t.start, reverse=True)
    tokens_after_skip = tokens_last_to_first[skip:]

    for token in tokens_after_skip:
        try:
            if hue is None:
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
        colorized_tokens.append(
            ColorizedTokenWithOrigin(
                token.tex_path,
                token.equation_index,
                token.token_index,
                token.start,
                token.end,
                token.text,
                hue,
            )
        )

    return TokenEquationColorizationBatch(tex, colorized_tokens)


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
