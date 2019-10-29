import colorsys
import logging
import re
from typing import Dict, Iterator, List, Tuple, Union

import numpy as np
from TexSoup import (
    Arg,
    OArg,
    RArg,
    TexArgs,
    TexCmd,
    TexEnv,
    TexNode,
    TexSoup,
    TokenWithPosition,
)

from explanations.scrape_tex import find_equations, parse_tex
from explanations.types import (
    ColorizedCitation,
    ColorizedEquation,
    ColorizedTokens,
    ColorizedTokensByEquation,
    EquationIndex,
    Token,
)

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


def colorize_citations(tex: str) -> Tuple[str, List[ColorizedCitation]]:
    soup = parse_tex(tex)
    _disable_hyperref_coloring(soup)

    hue_generator = generate_hues()
    colorized_citations = []

    for citation in soup.find_all("cite"):

        keys = None
        for arg in citation.expr.args:
            if isinstance(arg, RArg):
                keys = arg.value.split(",")
                break

        if keys is not None:
            try:
                hue = next(hue_generator)
            except StopIteration:
                break
            citation_string = str(citation)
            new_citation = TexSoup(_color_start(hue) + citation_string + _color_end())
            _replace_equation(citation, new_citation)
            colorized_citations.append(ColorizedCitation(hue, keys))

    return str(soup), colorized_citations


def colorize_equations(tex: str) -> Tuple[str, List[ColorizedEquation]]:
    soup = parse_tex(tex)

    hue_generator = generate_hues()
    colorized_equations = []

    for equation_index, equation in enumerate(find_equations(soup)):
        equation_string = str(equation)
        try:
            hue = next(hue_generator)
        except StopIteration:
            break
        colorized_equation = TexSoup(_color_start(hue) + equation_string + _color_end())
        _replace_equation(equation, colorized_equation)

        colorized_equation_info = ColorizedEquation(
            hue=hue, tex=equation_string, i=equation_index
        )
        colorized_equations.append(colorized_equation_info)

    return str(soup), colorized_equations


def colorize_equation_tokens(
    tex: str, tokens: Dict[EquationIndex, List[Token]]
) -> Tuple[str, ColorizedTokensByEquation]:
    soup = parse_tex(tex)
    colorized_tokens_by_equation = {}
    for equation_index, equation in enumerate(find_equations(soup)):
        if equation_index in tokens:
            colorized_tokens = _colorize_tokens_in_equation(
                equation, tokens[equation_index]
            )
            colorized_tokens_by_equation[equation_index] = colorized_tokens
    return str(soup), colorized_tokens_by_equation


def _colorize_tokens_in_equation(
    equation: TexNode, tokens: List[Token]
) -> ColorizedTokens:
    equation_string = str(next(equation.expr.contents))
    original_equation_string = equation_string

    hue_generator = generate_hues()
    colorized_tokens = {}
    tokens_last_to_first = sorted(tokens, key=lambda t: t.start, reverse=True)

    for token in tokens_last_to_first:
        try:
            hue = next(hue_generator)
        except StopIteration:
            break
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


def _disable_hyperref_coloring(soup: TexSoup) -> None:
    """
    Coloring from the hyperref package will overwrite the coloring of citations. Disable coloring
    from the hyperref package.
    """
    for usepackage in soup.find_all("usepackage"):

        if not isinstance(usepackage, TexNode) or not isinstance(
            usepackage.expr, TexCmd
        ):
            continue

        is_hyperref = False
        cmd = usepackage.expr
        for arg in cmd.args:
            if isinstance(arg, RArg):
                if arg.value.strip() == "hyperref":
                    is_hyperref = True
                break

        if not is_hyperref:
            continue

        for arg in usepackage.expr.args:
            if not isinstance(arg, OArg):
                continue

            for i, item in enumerate(arg.contents):
                if isinstance(item, TokenWithPosition):
                    updated_token = TokenWithPosition(
                        re.sub(
                            "(^|,)\\s*colorlinks\\s*=\\s*true\\s*(,|$)",
                            "\\1colorlinks=false\\2",
                            str(item),
                        )
                    )
                    arg.contents[i] = updated_token

            break


def _replace_equation(node: TexNode, new_node: TexNode) -> None:
    """
    Replace equation in a TexSoup tree with a new node. Use this instead of TexSoup's 'replace_with'
    method, which doesn't support some cases it should.
    """
    parent = node.parent
    if len(list(parent.args)) > 0:
        _replace_equation_in_arg(node, new_node)
    elif len(list(parent.children)) > 0:
        _replace_equation_in_environment(node, new_node)


def _replace_equation_in_arg(node: TexNode, new_node: TexNode) -> None:
    parent: TexNode = node.parent
    args: TexArgs = parent.args
    arg: Arg
    for arg_index, arg in enumerate(args):
        env_ids = _get_arg_content_env_ids(arg.contents)
        try:
            index = env_ids.index(id(node.expr))
        except ValueError:
            # Node was not found in this argument. Continue.
            continue
        new_contents = list(arg.contents)
        new_contents.remove(new_contents[index])
        new_contents.insert(index, new_node)
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


def _replace_equation_in_environment(node: TexNode, new_node: TexNode) -> None:
    parent: TexNode = node.parent
    sibling_expr_ids = _get_expr_ids_within_nodes(parent.children)
    index = sibling_expr_ids.index(id(node.expr))
    child = list(parent.children)[index]
    parent.replace(child, new_node)


def _get_arg_content_env_ids(items: List[Union[str, TexCmd, TexEnv]]) -> List[int]:
    env_ids = []
    for item in items:
        env_id = id(item) if isinstance(item, TexEnv) else -1
        env_ids.append(env_id)
    return env_ids


def _get_expr_ids_within_nodes(nodes: List[Union[TexNode, str]]) -> List[int]:
    expr_ids = []
    for node in list(nodes):
        expr_id = id(node.expr) if isinstance(node, TexNode) else -1
        expr_ids.append(expr_id)
    return expr_ids
