import logging
import os.path
import posixpath
import re
from dataclasses import dataclass
from enum import Enum, auto
from typing import List, Optional, Union, Tuple

from common.scan_tex import Pattern, scan_tex
from common.types import CharacterRange, Path


class Span:
    def __init__(self, line: int, start: int, end: int):
        self.line = line
        self.start = start
        self.end = end

    def to_tuple(self) -> Tuple:
        return (self.line, self.start, self.end)


def is_line_comment(line: str) -> bool:
    for char in line:
        if char.strip() == '':
            continue
        elif char == '%':
            return True
        else:
            return False


def locate_macro_def_start(tex_lines: List[str]) -> List[Span]:
    # TODO: this only locations "complete" definitions; not multiline
    prefix_patterns = [
        Pattern(name='newcommand', regex=r'\\newcommand(.*?)\{(\\.+?)\}'),
        Pattern(name='renewcommand', regex=r'\\renewcommand(.*?)\{(\\.+?)\}'),
        Pattern(name='declaremathoperator', regex=r'\\DeclareMathOperator(.*?)\{(\\.+?)\}')
    ]
    spans = []
    for i, line in enumerate(tex_lines):
        # skip any lines that are comments
        if is_line_comment(line):
            continue
        else:
            matches = scan_tex(tex=line, patterns=prefix_patterns)
            for match in matches:
                spans.append(Span(line=i, start=match.start, end=match.end))
    return spans


def convert_spans_to_macro_patterns(tex_lines: List[str], spans: List[Span]) -> List[Pattern]:
    for span in spans:
        line = tex_lines[span.line]
        macro_def = line[span.start:span.end]
        match = re.search(pattern=r'\\(newcommand|renewcommand|DeclareMathOperator)(.*?)\{(.+?)\}', string=macro_def)
        macro = match.group(3)
        pattern = Pattern(name=macro, regex=rf'{macro}')
        Pattern(name='newcommand', regex=r'\\newcommand(.*?)\{(\\.+?)\}'),


def locate_macro_usage(tex_lines: str, macros: List[Pattern]) -> List[Span]:
    spans = []
    for i, line in enumerate(tex_lines):
        matches = scan_tex(tex=line, patterns=macros)
        for match in matches:
            spans.append(Span(line=i, start=match.start, end=match.end))
    return spans


def demacro_tex(tex_filepath: Path) -> Optional[str]:
    return