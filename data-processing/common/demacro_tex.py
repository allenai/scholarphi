import logging
import os.path
import posixpath
import re
from dataclasses import dataclass
from enum import Enum, auto
from typing import List, Optional, Union, Tuple

from common.scan_tex import Pattern, scan_tex
from common.types import CharacterRange, Path


def is_line_comment(line: str) -> bool:
    for char in line:
        if char.strip() == '':
            continue
        elif char == '%':
            return True
        else:
            return False


def locate_macro_definitions(tex: str) -> List[Tuple]:
    prefix_patterns = [
        Pattern(name='newcommand', regex=r'\\newcommand(.*?)\{(\\.+?)\}'),
        Pattern(name='renewcommand', regex=r'\\renewcommand(.*?)\{(\\.+?)\}'),
        Pattern(name='declaremathoperator', regex=r'\\DeclareMathOperator(.*?)\{(\\.+?)\}')
    ]
    spans = []
    for i, line in enumerate(tex.split('\n')):
        # skip any lines that are comments
        if is_line_comment(line):
            continue
        else:
            matches = list(scan_tex(tex=line, patterns=prefix_patterns))
            for match in matches:
                spans.append((i, match.start, match.end))
    return spans


def demacro_tex(tex_filepath: Path) -> Optional[str]:
    return