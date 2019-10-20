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
    EquationIndex,
    Token,
)

# TODO(andrewhead): determine number of hues based on the number of hues that OpenCV is capable
# of distinguishing between. Current value is a guess.
NUM_HUES = 90
HUES = np.linspace(0, 1, NUM_HUES)


def generate_hues() -> Iterator[float]:
    """
    TODO(andrewhead): rather than endlessly cycling through hues, yield the 'StopIteration' signal
    when out of hues, and let the caller handle resetting the generator.    
    """
    while True:
        for hue in HUES:
            yield hue
    # logging.error("Out of hues!")
    # raise StopIteration


def colorize_equations(tex: str) -> Tuple[str, ColorizedEquations]:
    """
    hue_generator: a function that, when called, returns a new hue.
    """
    soup = parse_tex(tex)

    hue_generator = generate_hues()
    equations_by_hue = {}

    for equation in find_equations(soup):
        try:
            hue = next(hue_generator)
        except StopIteration:
            break
        colorized_equation = TexSoup(_color_start(hue) + str(equation) + _color_end())
        _replace_equation(equation, colorized_equation)
        equations_by_hue[hue] = str(equation)
    return str(soup), equations_by_hue


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
        color_start = _color_start(hue)
        color_end = _color_end()

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
        try:
            _replace_equation(equation, new_equation)
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


def _color_start(hue: float) -> str:
    red, green, blue = colorsys.hsv_to_rgb(hue, 1, 1)
    return r"\llap{{\pdfcolorstack0 push {{{red} {green} {blue} rg {red} {green} {blue} RG}}}}".format(
        red=red, green=green, blue=blue
    )


def _color_end() -> str:
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


def _replace_equation(equation: TexNode, new_equation: TexNode) -> None:
    """
    Replace an equation with an updated equation.
    """
    parent = equation.parent
    if len(list(parent.args)) > 0:
        _replace_equation_in_arg(equation, new_equation)
    elif len(list(parent.children)) > 0:
        _replace_equation_in_environment(equation, new_equation)


def _replace_equation_in_arg(equation: TexNode, new_equation: TexNode) -> None:
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
        new_contents.remove(new_contents[index])
        new_contents.insert(index, new_equation)
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


def _replace_equation_in_environment(equation: TexNode, new_equation: TexNode) -> None:
    parent: TexNode = equation.parent
    sibling_expr_ids = _get_expr_ids(parent.children)
    index = sibling_expr_ids.index(id(equation.expr))
    child = list(parent.children)[index]
    parent.replace(child, new_equation)


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
