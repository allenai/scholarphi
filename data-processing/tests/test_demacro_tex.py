"""



"""

import os.path
import posixpath
from tempfile import TemporaryDirectory
from typing import Dict

from common.demacro_tex import locate_macro_def_start, locate_macro_usage
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
    spans = locate_macro_def_start(tex_lines=tex_lines)
    assert tex_lines[spans[0].line][spans[0].start:spans[0].end] == "\\newcommand{\\R}"
    assert tex_lines[spans[1].line][spans[1].start:spans[1].end] == "\\renewcommand{\\vector}"
    assert tex_lines[spans[2].line][spans[2].start:spans[2].end] == "\\newcommand{\\avector}"
    assert tex_lines[spans[3].line][spans[3].start:spans[3].end] == "\\DeclareMathOperator*{\\minimize}"


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
    spans = locate_macro_def_start(tex_lines=tex_lines)
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


