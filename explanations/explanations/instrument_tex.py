import colorsys
import logging
import os.path
from typing import Iterator, List, Tuple, Union

import numpy as np
from TexSoup import Arg, OArg, RArg, TexArgs, TexCmd, TexEnv, TexNode, TexSoup

from explanations.directories import colorized_sources
from explanations.types import ColorizedEquations, ColorizedTex

# TODO(andrewhead): determine number of cues based on the number of hues that OpenCV is capable
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
    equation, in a "left overlay" (\llay), so that the box isn't used in paragraph layout. To give
    it a solid color and the right dimensinos, the box is created by putting the equation in the
    box, and setting the '\textcolor' and adding a '\colorbox'. The padding of the colorbox are
    set to '0', instead of its defaults, so it doesn't take up more space than the equation did.

    This is the approach that, so far, has seemed to be the most flexible approach to colorizing
    without having side-effects on how the text layout on the page, while being pretty accurate,
    and producing a box with a color that's easy to detect in the image processing steps.

    With this approach, a colorized equation looks like:
    $x$\llap{\setlength{\fboxsep}{0pt}\colorbox[rgb]{<red>, <green>, <blue>}{\textcolor[rgb]{<red>, <green>, <blue>}{$x$}}}

    Other coloring options we don't use:
    * pdfcolorstack: If all the TeX to be processed will be processed by 'pdflatex', then you can
      use two commands to set the color, and then reset it to neutral:

        \pdfcolorstack 0 push {<red> <green> <blue> RG}  % set color
        \pdfcolorstack 0 pop                             % unset color

    * textcolor: set the color of the foreground text like so:

        \textcolor[rgb]{<red>, <green>, <blue>}

      The disadvantage of this approach is that coloring the text affects the paragraph layout
      algorithm in subtle ways (one tricky case is that it unexpectedly changes how "word" in
      <word>($eq$) can be hyphenated). If textcolor is used in an overlap ("\llap"), then the
      foreground colors of the original text mixes with the colors of the overlap text, making
      it difficult to assess what was the intended color of the equation.

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
    raise StopIteration


def color_equations(
    tex: str, hue_generator: Iterator[float]
) -> Tuple[ColorizedEquations, str]:
    """
    hue_generator: a function that, when called, returns a new hue.
    """
    soup = TexSoup(tex)
    all_equations = list(soup.find_all("$"))
    equations_by_hue = {}
    for _, equation in enumerate(all_equations):
        try:
            hue = next(hue_generator)
        except StopIteration:
            logging.error("Not highlighting equation %s: out of hues.", str(equation))
            logging.error("Skipping all other equations...")
            break
        _color_equation(equation, hue)
        equations_by_hue[hue] = str(equation)
    return equations_by_hue, str(soup)


def colorize_tex(arxiv_id: str) -> ColorizedTex:
    hue_generator = generate_hues()
    logging.debug("Colorizing sources.")
    sources_dir = colorized_sources(arxiv_id)
    colorized_equations = {}
    file_contents = {}
    for filename in os.listdir(sources_dir):
        if filename.endswith(".tex"):
            path = os.path.join(sources_dir, filename)
            with open(path, "r") as tex_file:
                equations, contents = color_equations(tex_file.read(), hue_generator)
                colorized_equations.update(equations)
                file_contents[path] = contents
            with open(path, "w") as tex_file:
                tex_file.write(contents)
    return ColorizedTex(file_contents, colorized_equations)
