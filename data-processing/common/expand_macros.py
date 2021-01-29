from dataclasses import dataclass
from typing import Dict, Iterator, List


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


@dataclass(frozen=True)
class TexToken:
    text: bytes
    object_id: bytes
    catcode: int
    """
    Category code. The primary purpose of the category code is to distinguish between characters
    that are meant to be literal letters (e.g., 'a', 'b', 'c', ...) and those that are control
    sequences (e.g., '\\mymacro'), as extra spaces will have to be inserted after control
    sequences in expanded macros to make sure they are parsed by a TeX processor correctly.
    """


@dataclass(frozen=True)
class ControlSequence(TexToken):
    text: bytes
    object_id: bytes
    expansion: List[TexToken]


def detect_expansions(stdout: bytes) -> Iterator[Expansion]:
    """
    'stdout' is the console output produced by running our custom instrumented version of
    LaTeXML on a TeX project. It will include log statements indicating when macros are
    encountered and how they are expanded.
    """

    # List of tokens that form the expansion of a macro. This list is nested:
    # tokens of type 'ControlSequence' will have their own expansions as well.
    expanded_tokens: List[TexToken] = []

    # Flag indicating which macro is being expanded, if hierarchical expansion is taking
    # place (i.e., a macro is getting expanded within an argument to another macro, or a
    # macro appeared in an expansion of another macro). When a nested / argument macro is
    # getting expanded, the value is the Perl object ID of that macro. Otherwise, this is
    # set to "TOP-LEVEL", indicating that a macro from the original text is getting expanded.
    currently_expanding = b"TOP-LEVEL"

    # A lookup table of control sequences for use in expanding nested / argument macros.
    control_sequences: Dict[bytes, ControlSequence] = {}

    def reset_state() -> None:
        """
        Call this method to reset the state of expansion. This should be called whenever
        one macro is finished being expanded, and another is being expanded.
        """
        expanded_tokens.clear()
        currently_expanding = b"TOP-LEVEL"
        control_sequences.clear()

    START_PATTERN = (
        b"^Start of expansion. "
        + b"Control sequence: T_CS[(?P<control_sequence_name>.*?)]\. "
        + b"\(object ID: (?P<object_id>.*?)\)\. "
        + b"Current expansion depth: \d+\. "
        + b"\(If this.*?, it appeared in (?P<path>.*?) "
        + b"from line (?P<start_line>\d+), col (?P<start_column>\d+) "
        + b"to line (?P<end_line>\d+), col (?P<end_column>\d+)\)\."
    )

    # When encountered start of expansion
    # If ID of token is for token in the WIP expansion, then start expanding that token.

    # If not, then start a new expansion.
    # Set 'start' and 'end' to the range of the control sequence.
    # Set the value of the control sequence.

    # If reading argument:
    # * update 'end'

    # If reading expansion:
    # * add to list for expansions of this token

    # Make sure there is a space after all control sequences that are not yet expanded
