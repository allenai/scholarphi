import colorsys
import logging
import re
from typing import Dict, Iterator, List, Tuple, Union

import numpy as np
from TexSoup import Arg, OArg, RArg, TexArgs, TexCmd, TexEnv, TexNode, TexSoup

from explanations.scrape_tex import find_equations, parse_tex
from explanations.types import (
    ColorizedEquations,
    ColorizedTokens,
    ColorizedTokensByEquation,
    Token,
)

# TODO(andrewhead): determine number of hues based on the number of hues that OpenCV is capable
# of distinguishing between. Current value is a guess.
NUM_HUES = 90
HUES = np.linspace(0, 1, NUM_HUES)


def _color_start(equation: TexNode, hue: float) -> str:
    """
    Overlay a colorful box on top of an equation. 'hue' is a float between 0 and 1.

    How to color TeX equations in a way that doesn't disrupt layout:

    A key need in coloring equations is not to upset how TeX assigns line breaks.
    If any of the coloring commands change the dimensions of the text, or add other glue or spaces,
    then the layout algorithm may lay out the text it a completely uncompatible way, meaning that
    equations will end up appearing in a different place than before.

    Because of this, we opt for the following coloring approach:
    1. Display the original equation *as is* to enable paragraph layout as usual.
    2. Add a colorized box on top of the equation in a way that does *not* influence the
       paragraph layout algorithm (this is the tricky part).

    To add the colorized box, a box is created with a specified color and the dimensions of the
    equation, in a "left overlay" (\\llap), so that the box isn't used in paragraph layout. To give
    it a solid color and the right dimensinos, the box is created by putting the equation in the
    box, and setting the '\\textcolor' and adding a '\\colorbox'. The padding of the colorbox are
    set to '0', instead of its defaults, so it doesn't take up more space than the equation did.

    This is the approach that, so far, has seemed to be the most flexible approach to colorizing
    without having side-effects on how the text layout on the page, while being pretty accurate,
    and producing a box with a color that's easy to detect in the image processing steps.

    With this approach, a colorized equation looks like:
    $x$\\llap{\\setlength{\\fboxsep}{0pt}\\colorbox[rgb]{<red>, <green>, <blue>}{\\textcolor[rgb]{<red>, <green>, <blue>}{$x$}}}

    Other coloring options we don't use:
    * pdfcolorstack: If all the TeX to be processed will be processed by 'pdflatex', then you can
      use two commands to set the color, and then reset it to neutral:

        \\pdfcolorstack 0 push {<red> <green> <blue> RG}  % set color
        \\pdfcolorstack 0 pop                             % unset color

    * textcolor: set the color of the foreground text like so:

        \\textcolor[rgb]{<red>, <green>, <blue>}

      The disadvantage of this approach is that coloring the text affects the paragraph layout
      algorithm in subtle ways (one tricky case is that it unexpectedly changes how "word" in
      <word>($eq$) can be hyphenated). If textcolor is used in an overlap ("\\llap"), then the
      foreground colors of the original text mixes with the colors of the overlap text, making
      it difficult to assess what was the intended color of the equation.

    References:
    1. Chapters 11-14 from the TeXBook (http://www.ctex.org/documents/shredder/src/texbook.pdf):
    describes layout algorithm, and "\\llap"
    2. These "tracing" commands for understanding how TeX is laying out the text:
    - \\tracingparagraphs=1... \\tracingparagraphs=0
    - \\tracingcommands=1... \\tracingcommands=0
    - \\showoutput  % place at top of file
    Reference: https://tex.stackexchange.com/a/60494
    3. \\pdfcolorstack commands: https://tug.org/pipermail/pdftex/2007-January/006910.html
    """
    red, green, blue = colorsys.hsv_to_rgb(hue, 1, 1)
    template = r"{eq}\llap{{\setlength{{\fboxsep}}{{0pt}}\colorbox[rgb]{{{red:.4f}, {green:.4f}, {blue:.4f}}}{{\textcolor[rgb]{{{red:.4f}, {green:.4f}, {blue:.4f}}}{{"  # noqa
    color_start = template.format(eq=equation, red=red, green=green, blue=blue)
    return color_start


def _color_end() -> str:
    return r"}}}"


def _get_arg_content_env_ids(items: List[Union[str, TexCmd, TexEnv]]) -> List[int]:
    env_ids = []
    for item in items:
        env_id = id(item) if isinstance(item, TexEnv) else -1
        env_ids.append(env_id)
    return env_ids


def _get_expr_ids(nodes: List[Union[TexNode, str]]) -> List[int]:
    expr_ids = []
    for node in list(nodes):
        expr_id = id(node.expr) if isinstance(node, TexNode) else -1
        expr_ids.append(expr_id)
    return expr_ids


def _color_equation_in_arg(equation: TexNode, hue: float) -> None:
    parent: TexNode = equation.parent
    args: TexArgs = parent.args
    arg: Arg
    for arg_index, arg in enumerate(args):
        env_ids = _get_arg_content_env_ids(arg.contents)
        try:
            index = env_ids.index(id(equation.expr))
        except ValueError:
            # Equation was not found in this argument. Continue.
            continue
        new_contents = list(arg.contents)
        new_contents.insert(index, _color_start(str(equation), hue))
        new_contents.insert(index + 2, _color_end())
        new_arg = (
            RArg(*new_contents)
            if isinstance(arg, RArg)
            else OArg(*new_contents)
            if isinstance(arg, OArg)
            else None
        )
        if new_arg is not None:
            args.remove(arg)
            args.insert(arg_index, new_arg)
        break


def _color_equation_in_environment(equation: TexNode, hue: float) -> None:
    parent: TexNode = equation.parent
    sibling_expr_ids = _get_expr_ids(parent.children)
    index = sibling_expr_ids.index(id(equation.expr))
    child = list(parent.children)[index]
    new_node = TexSoup(_color_start(str(equation), hue) + str(equation) + _color_end())
    parent.replace(child, new_node)


def _color_equation(equation: TexNode, hue: float = 1.0) -> None:
    """
    Color equation by surrounding it with a color environment.
    TODO(andrewhead): Instrument TeX to include color, e.g., by injecting "\\usepackage{color}" after the
    documentclass directive, and before "\\begin{document}".
    """
    parent = equation.parent
    if len(list(parent.args)) > 0:
        _color_equation_in_arg(equation, hue)
    elif len(list(parent.children)) > 0:
        _color_equation_in_environment(equation, hue)


def generate_hues() -> Iterator[float]:
    for hue in HUES:
        yield hue
    logging.error("Out of hues!")
    raise StopIteration


def colorize_equations(
    tex: str, hue_generator: Iterator[float]
) -> Tuple[ColorizedEquations, str]:
    """
    hue_generator: a function that, when called, returns a new hue.
    """
    soup = parse_tex(tex)
    equations_by_hue = {}
    for equation in find_equations(soup):
        try:
            hue = next(hue_generator)
        except StopIteration:
            break
        _color_equation(equation, hue)
        equations_by_hue[hue] = str(equation)
    return equations_by_hue, str(soup)


EquationIndex = int


def _token_color_start(hue: float) -> str:
    red, green, blue = colorsys.hsv_to_rgb(hue, 1, 1)
    return r"\llap{{\pdfcolorstack0 push {{{red} {green} {blue} rg {red} {green} {blue} RG}}}}".format(
        red=red, green=green, blue=blue
    )


def _token_color_end() -> str:
    return r"\llap{\pdfcolorstack0 pop}"


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


def _colorize_tokens_in_equation(
    equation: TexNode, tokens: List[Token]
) -> ColorizedTokens:
    equation_string = str(next(equation.expr.contents))
    original_equation_string = equation_string

    hue_generator = generate_hues()
    colorized_tokens = {}
    tokens_last_to_first = sorted(tokens, key=lambda t: t.start, reverse=True)

    for token in tokens_last_to_first:
        hue = next(hue_generator)
        color_start = _token_color_start(hue)
        color_end = _token_color_end()

        start_coloring_index = token.start
        start_coloring_index = _adjust_start_coloring_index(
            start_coloring_index, equation_string
        )
        end_coloring_index = token.end

        equation_string = (
            equation_string[:start_coloring_index]
            + color_start
            + equation_string[start_coloring_index:end_coloring_index]
            + color_end
            + equation_string[end_coloring_index:]
        )
        colorized_tokens[hue] = token

    if equation_string != original_equation_string:
        expr = equation.expr
        assert hasattr(expr, "begin")
        assert hasattr(expr, "end")
        new_equation = TexSoup(expr.begin + equation_string + expr.end)
        # TODO(andrewhead): don't instrument equations that are expansions of macros
        try:
            equation.replace_with(new_equation)
        except (TypeError, ValueError) as e:
            logging.error("Exception when colorizing equation %s: %s", equation, e)

    return colorized_tokens


def colorize_equation_tokens(
    tex: str, tokens: Dict[EquationIndex, List[Token]]
) -> Tuple[str, ColorizedTokensByEquation]:
    soup = TexSoup(tex)
    colorized_tokens_by_equation = {}
    for equation_index, equation in enumerate(find_equations(soup)):
        if equation_index in tokens:
            colorized_tokens = _colorize_tokens_in_equation(
                equation, tokens[equation_index]
            )
            colorized_tokens_by_equation[equation_index] = colorized_tokens
    return str(soup), colorized_tokens_by_equation
