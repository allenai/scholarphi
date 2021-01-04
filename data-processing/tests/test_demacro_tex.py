"""



"""

import os.path
import posixpath
from tempfile import TemporaryDirectory
from typing import Dict

from common.demacro_tex import locate_macro_definitions
from common.types import Path, RelativePath



def test_locate_macro_definitions_simple():
    """
    For LaTeX, macros must be placed beneath the \\documentclass command.
    """
    tex_lines = [
        "\\documentclass{article}",
        "\\newcommand{\\R}{{\\mathbb R}}",
        "\\renewcommand{\\vector}[1]{(x_1,x_2,\\ldots,x_{#1})}",
        "\\newcommand{\\avector}[2]{(#1_1,#1_2,\\ldots,#1_{#2})}",
        "\\DeclareMathOperator*{\\minimize}{minimize}",
        "\\begin{document}",
        "Body text",
        "\\end{document}",
    ]
    tex = "\n".join(tex_lines)
    spans = locate_macro_definitions(tex=tex)
    assert tex[spans[0][0]:spans[0][1]] == "\\newcommand{\\R}{{\\mathbb R}}\n"
    assert tex[spans[1][0]:spans[1][1]] == "\\renewcommand{\\vector}[1]{(x_1,x_2,\\ldots,x_{#1})}\n"
    assert tex[spans[2][0]:spans[2][1]] == "\\newcommand{\\avector}[2]{(#1_1,#1_2,\\ldots,#1_{#2})}\n"
    assert tex[spans[3][0]:spans[3][1]] == "\\DeclareMathOperator*{\\minimize}{minimize}\n"



def test_locate_macro_definitions_multiple_on_single_line():
    tex_lines = [
        "\\documentclass{article}",
        "\\DeclareMathOperator*{\\vect}{vec} \\DeclareMathOperator*{\\mat}{mat}",
        "\\begin{document}",
        "Body text",
        "\\end{document}",
    ]



def test_locate_macro_definitions_multiline():
    pass


def test_locate_macro_definitions_recursive():
    pass


