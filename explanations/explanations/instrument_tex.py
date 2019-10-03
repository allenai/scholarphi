import colorsys
import logging
import os.path
from typing import Dict, List, NamedTuple, Tuple, Union

import numpy as np
from TexSoup import Arg, OArg, RArg, TexArgs, TexCmd, TexEnv, TexNode, TexSoup

from explanations.directories import colorized_sources

# TODO(andrewhead): determine number of cues based on the number of hues that OpenCV is capable
# of distinguishing between. Current value is a guess.
NUM_HUES = 90
HUES = np.linspace(0, 1, NUM_HUES)


class ColorizedTex(NamedTuple):
    tex: str
    """
    Map from a float hue [0..1] to the LaTeX equation with that color.
    """
    equations: Dict[float, str]


def _color_start(equation, hue):
    """
    Hue is expected to be a float between 0 and 1.

    How to color TeX equations in a way that doesn't disrupt layout:
    If all the TeX to be processed will be processed by 'pdflatex', then you can use two commands
    to set the color, and then reset it to neutral:

    \pdfcolorstack 0 push {<red> <green> <blue> RG}  % set color
    \pdfcolorstack 0 pop                             % unset color

    Other coloring commands are available, like:
    \textcolor[rgb]{<red>, <green>, <blue>}                                % foreground color
    {\setlength{\fboxsep}{0pt}\colorbox[rgb]{<red>, <green>, <blue>}{...}  % background color

    For PDFs, "\textcolor" will expand into to \pdfcolorstack commands. We opt for '\pdfcolorstack'
    because it is simpler, and as portable as we need. arXiv expects files only in TeX or
    (PDF)LaTeX format (see here https://arxiv.org/help/faq/mistakes#other_formats), and we're making
    the assumption all papers will be (PDF)LaTeX compatible.

    A key step in coloring equations is to make sure that you don't upset how TeX assigns line breaks.
    If any of the coloring commands change the dimensions of the text, or add other glue or spaces,
    then the layout algorithm may lay out the text it a completely uncompatible way, meaning that
    equations will end up appearing in a different place than before.

    Because of this, we opt for the following coloring approach:
    1. Use the original equation for formatting, but hide it, using "\phantom".
    2. Overlay the colorized equation in a dimensionless box using "\llap". Because it's specified in
    \llap, the line-breaking algorithm will ignore it completely.

    With this approach, a colorized equation looks like:
    \phantom{$x$}\llap{\pdfcolorstack 0 push {1 0 0 rg}$x$\pdfcolorstack 0 pop}

    This is the format that, in our tests so far, has been the most flexible approach to colorizing
    without having side-effects on how the text layout on the page.

    References:
    1. Chapters 11-14 from the TeXBook (http://www.ctex.org/documents/shredder/src/texbook.pdf):
    describes layout algorithm, and "\llap"
    2. These "tracing" commands for understanding how TeX is laying out the text:
    - \tracingparagraphs=1... \tracingparagraphs=0
    - \tracingcommands=1... \tracingcommands=0
    - \showoutput  % place at top of file
    Reference: https://tex.stackexchange.com/a/60494
    3. \pdfcolorstack commands: https://tug.org/pipermail/pdftex/2007-January/006910.html
    """
    red, green, blue = colorsys.hsv_to_rgb(hue, 1, 1)
    template = r"{eq}\llap{{\pdfcolorstack 0 push {{{red:.4f} {green:.4f} {blue:.4f} rg}}"
    color_start = template.format(eq=equation, red=red, green=green, blue=blue)
    return color_start


def _color_end():
    return r"\pdfcolorstack 0 pop}"


def _get_arg_content_env_ids(items: List[Union[str, TexCmd, TexEnv]]):
    env_ids = []
    for item in items:
        env_id = id(item) if isinstance(item, TexEnv) else -1
        env_ids.append(env_id)
    return env_ids


def _get_expr_ids(nodes: List[Union[TexNode, str]]):
    expr_ids = []
    for node in list(nodes):
        expr_id = id(node.expr) if isinstance(node, TexNode) else -1
        expr_ids.append(expr_id)
    return expr_ids


def _color_equation_in_arg(equation: TexNode, hue: float):
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


def _color_equation_in_environment(equation: TexNode, hue: float):
    parent: TexNode = equation.parent
    sibling_expr_ids = _get_expr_ids(parent.children)
    index = sibling_expr_ids.index(id(equation.expr))
    child = list(parent.children)[index]
    new_node = TexSoup(_color_start(str(equation), hue) + str(equation) + _color_end())
    parent.replace(child, new_node)


def _color_equation(equation: TexNode, hue: float = 1.0):
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


def color_equations(tex: str) -> ColorizedTex:
    soup = TexSoup(tex)
    all_equations = list(soup.find_all("$"))
    # If this assertion is violated, it means that we need to color equations in phases,
    # up to 'len(HUES)' at a time.
    assert len(all_equations) <= len(HUES)
    equations_by_hue = {}
    for i, equation in enumerate(all_equations):
        hue = _color_equation(equation, HUES[i])
        equations_by_hue[hue] = str(equation)
    result = ColorizedTex(str(soup), equations_by_hue)
    return result


def colorize_tex(arxiv_id: str):
    logging.debug("Colorizing sources.")
    sources_dir = colorized_sources(arxiv_id)
    for filename in os.listdir(sources_dir):
        if filename.endswith(".tex"):
            path = os.path.join(sources_dir, filename)
            with open(path, "r") as tex_file:
                colorized = color_equations(tex_file.read())
            with open(path, "w") as tex_file:
                tex_file.write(colorized.tex)
    return None
