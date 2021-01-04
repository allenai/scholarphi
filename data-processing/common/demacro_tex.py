import logging
import os.path
import posixpath
import re
from dataclasses import dataclass
from enum import Enum, auto
from typing import List, Optional, Union, Tuple

from common.scan_tex import Pattern, scan_tex
from common.types import CharacterRange, Path


prefix_patterns = [
    Pattern(name='newcommand', regex=r'\\newcommand(.*?)\{(\\.+?)\}(.*?\n)'),
    Pattern(name='renewcommand', regex=r'\\renewcommand(.*?)\{(\\.+?)\}(.*?\n)'),
    Pattern(name='declaremathoperator', regex=r'\\DeclareMathOperator(.*?)\{(\\.+?)\}(.*?\n)')
]

def locate_macro_definitions(tex: str) -> List[Tuple]:
    matches = list(scan_tex(tex=tex, patterns=prefix_patterns))
    return [(match.start, match.end) for match in matches]


def demacro_tex(tex_filepath: Path) -> Optional[str]:
    return