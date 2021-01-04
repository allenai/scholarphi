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
    assert tex_lines[spans[0][0]][spans[0][1]:spans[0][2]] == "\\newcommand{\\R}"
    assert tex_lines[spans[1][0]][spans[1][1]:spans[1][2]] == "\\renewcommand{\\vector}"
    assert tex_lines[spans[2][0]][spans[2][1]:spans[2][2]] == "\\newcommand{\\avector}"
    assert tex_lines[spans[3][0]][spans[3][1]:spans[3][2]] == "\\DeclareMathOperator*{\\minimize}"


def test_locate_macro_definitions_skip_commented():
    tex_lines = [
        "\\documentclass{article}",
        "% \\newcommand{\\R}{{\\mathbb R}}",
        "% \\renewcommand{\\vector}[1]{(x_1,x_2,\\ldots,x_{#1})}",
        "%\\newcommand{\\avector}[2]{(#1_1,#1_2,\\ldots,#1_{#2})}",
        "%\\DeclareMathOperator*{\\minimize}{minimize}",
        "\\begin{document}",
        "Body text",
        "\\end{document}",
    ]
    tex = "\n".join(tex_lines)
    spans = locate_macro_definitions(tex=tex)
    assert len(spans) == 0


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


