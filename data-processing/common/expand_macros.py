from dataclasses import dataclass
from typing import List


@dataclass
class Expansion:
    macro_name: bytes
    " The token containing the macro name (without arguments). Should begin with '\\'. "

    start_line: int
    start_col: int
    end_line: int
    end_col: int
    """
    'start' and 'end' represent the range of all characters that should be replaced with an
    expansion. This should include both the control sequence and its arguments:
    * For a simple macro without arguments, this will be just the control sequence itself
    (e.g., just '\\X' for macro '\\X' defined as '\\def\\X{X}').
    * For a macro with arguments, this range will cover both the control sequence and its
    arguments (e.g., all of '\\c{X}' for the macro '\\c' defined as '\\def\\c#1{\\mathcal{C}}')).
    """

    expansion: bytes


def detect_expansions(stdout: bytes) -> List[Expansion]:
    return []
