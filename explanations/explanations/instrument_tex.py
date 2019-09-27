import logging
import os.path
from typing import List, Union

from TexSoup import Arg, OArg, RArg, TexArgs, TexCmd, TexEnv, TexNode, TexSoup

from explanations.directories import colorized_sources

COLOR_START = "{\\color{red} "
COLOR_END = "}"


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


def _color_equation_in_arg(equation: TexNode):
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
        new_contents.insert(index, COLOR_START)
        new_contents.insert(index + 2, COLOR_END)
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


def _color_equation_in_environment(equation: TexNode):
    parent: TexNode = equation.parent
    sibling_expr_ids = _get_expr_ids(parent.children)
    index = sibling_expr_ids.index(id(equation.expr))
    child = list(parent.children)[index]
    new_node = TexSoup(COLOR_START + str(equation) + COLOR_END)
    parent.replace(child, new_node)


def _color_equation(equation: TexNode):
    """
    Color equation by surrounding it with a color environment.
    """
    parent = equation.parent
    if len(list(parent.args)) > 0:
        _color_equation_in_arg(equation)
    elif len(list(parent.children)) > 0:
        _color_equation_in_environment(equation)


def color_equations(tex: str) -> str:
    soup = TexSoup(tex)
    for equation in list(soup.find_all("$")):
        _color_equation(equation)
    return str(soup)


def colorize_tex(arxiv_id: str):
    logging.debug("Colorizing sources.")
    sources_dir = colorized_sources(arxiv_id)
    for filename in os.listdir(sources_dir):
        if filename.endswith(".tex"):
            path = os.path.join(sources_dir, filename)
            with open(path, "r") as tex_file:
                colorized = color_equations(tex_file.read())
            with open(path, "w") as tex_file:
                tex_file.write(colorized)
    return None
