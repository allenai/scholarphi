import re
from dataclasses import dataclass
from typing import Dict, Iterator, List, Optional

from common.types import AbsolutePath


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


CatCode = int
LETTER = 11
CONTROL_SEQUENCE = 16


@dataclass
class TexToken:
    text: bytes
    object_id: bytes
    catcode: CatCode
    """
    Category code. The primary purpose of the category code is to distinguish between characters
    that are meant to be literal letters (e.g., 'a', 'b', 'c', ...) and those that are control
    sequences (e.g., '\\mymacro'), as extra spaces will have to be inserted after control
    sequences in expanded macros to make sure they are parsed by a TeX processor correctly.
    """


@dataclass
class ControlSequence(TexToken):
    expansion_tokens: Optional[List[TexToken]] = None
    """
    List of tokens that make up the expansion of a macro. The list can be nested:
    each token of type 'ControlSequence' might have its own expansions.

    Expansion begins as 'None', and only becomes and empty list if the LaTeXML log indiecates
    that the control sequence was expanded. A control sequence with an expansion of 'None'
    rather than an empty list should not be expanded.
    """

    expanded: bool = False
    """
    Flag indicating whether a control sequence has finished being expanded. Note that
    this only indicates whether it has been expanded at the top-most level: if the
    expansion contains other control sequences that must be expanded, this will still be 'True'.
    """


ControlSequenceId = bytes


def _get_expansion_text(control_sequence: ControlSequence) -> bytes:
    """
    Iterate over a list of tokens (which can include control sequences with their own expansions)
    to generate contiguous expanded string of text.
    """

    expansion_tokens = _expand_control_sequence(control_sequence)
    text = b""
    for i, token in enumerate(expansion_tokens):
        next_token = expansion_tokens[i + 1] if i < len(expansion_tokens) - 1 else None
        text += token.text

        # Control sequences should be followed by spaces in cases where either
        # 1. the control sequence is the last token in the stream (and hence
        #    we do not know what will appear after it in the TeX).
        # 2. the next token in the expansion is a letter, which would be grouped
        #    into the control sequence if not separated by a space.
        if isinstance(token, ControlSequence):
            if not next_token or next_token.catcode == LETTER:
                text += b" "

    return text


def _expand_control_sequence(control_sequence: ControlSequence) -> List[TexToken]:
    """
    Flatten the expansion of a control sequence (which may contain nested expansions).
    to a list of TeX tokens.
    """
    # A control sequence that does not have an expansion will just be returned as the control
    # sequence. Some control sequences (like '\operatorname') will not have expansions.
    if control_sequence.expansion_tokens is None:
        return [control_sequence]

    tokens: List[TexToken] = []
    for token in control_sequence.expansion_tokens:
        if isinstance(token, ControlSequence):
            tokens.extend(_expand_control_sequence(token))
        else:
            tokens.append(token)
    return tokens


# Regular expressions for parsing log outputs from LaTeXML.
START_PATTERN = re.compile(
    b"^Start of expansion. "
    + br"Control sequence: T_CS\[(?P<control_sequence_name>.*?)\]\. "
    + br"\(object ID: (?P<object_id>.*?)\)\. "
    + br"Current expansion depth: \d+\. "
    + br"\(If this.*?, it appeared in (?P<path>.*?) "
    + br"from line (?P<start_line>\d+), col (?P<start_column>\d+) "
    + br"to line (?P<end_line>\d+), col (?P<end_column>\d+)\)\.",
    flags=re.MULTILINE | re.DOTALL,
)

TOKEN_PATTERN = re.compile(
    b"Expansion token: (?P<token>.*?) "
    + br"\(object ID (?P<object_id>.*?)\)\. "
    + br"Category: (?P<category_code>\d+)\. "
    + br"Expandable: (?:true|false)\.",
    flags=re.MULTILINE | re.DOTALL,
)

ARGUMENT_PATTERN = re.compile(
    b"Argument token: "
    + br'".*?" \(source file (?P<path>.*?), '
    + br"from line (?P<start_line>\d+) col (?P<start_column>\d+) "
    + br"to line (?P<end_line>\d+) col (?P<end_column>\d+)\)\.",
    flags=re.MULTILINE | re.DOTALL,
)

END_PATTERN = re.compile(
    b"End of expansion "
    + br"\(object ID: (?P<object_id>.*?)\)\. "
    + br"Current expansion depth: \d+\. "
    + br"Expansion: .*?\.",
    flags=re.MULTILINE | re.DOTALL,
)

patterns = {
    START_PATTERN: "start-expansion",
    TOKEN_PATTERN: "add-expansion-token",
    ARGUMENT_PATTERN: "read-argument",
    END_PATTERN: "end-expansion",
}


def detect_expansions(
    stdout: bytes, in_files: List[AbsolutePath]
) -> Iterator[Expansion]:
    """
    'stdout' is the console output produced by running our custom instrumented version of
    LaTeXML on a TeX project. It will include log statements indicating when macros are
    encountered and how they are expanded. 'in_files' is the list of files that expansions
    will be detected in (expansions that appear in the project outside of these files
    will not be detected).
    """

    # Positions of start and end of a macro being expanded, and all of its arguments (i.e.,
    # an entire span of text that should be replaced with an expansion).
    start_line: Optional[int] = None
    start_col: Optional[int] = None
    end_line: Optional[int] = None
    end_col: Optional[int] = None

    # A top level macro that is currently being expanded (i.e., one that appears in
    # the TeX of one of the 'in_files').
    top_level_macro: Optional[ControlSequence] = None

    # ID of a macro that is being expanded. Need not be top-level---it will often be a
    # macro that appears as an argument, or in an expansion of another macro.
    expanding: Optional[ControlSequenceId] = None

    # A lookup table from object IDs to control sequences. This table is used when expanding
    # macros nested within others, or passed as arguments to others.
    active_macros: Dict[ControlSequenceId, ControlSequence] = {}

    def _make_expansion_from_last_control_sequence() -> Optional[Expansion]:
        """
        Wrap up the last expanded control sequence into an Expansion object.
        """

        if not top_level_macro:
            return None

        if (
            not top_level_macro.expanded
            or start_line is None
            or start_col is None
            or end_line is None
            or end_col is None
        ):
            return None

        return Expansion(
            macro_name=top_level_macro.text,
            start_line=start_line,
            start_col=start_col,
            end_line=end_line,
            end_col=end_col,
            expansion=_get_expansion_text(top_level_macro),
        )

    # Repeatedly scan for macro expansion-related events in the LaTeXML log.
    last_match_end = -1
    while True:

        # Find the next segment of the log containing an expansion event.
        first_pattern = None
        match = None
        for pattern in patterns:
            pattern_match = pattern.search(stdout, pos=last_match_end)
            if pattern_match is None:
                continue
            if not match or pattern_match.start() < match.start():
                match = pattern_match
                first_pattern = pattern

        # When there are no more log messages to process, stop iteration.
        if not match or not first_pattern:
            expansion = _make_expansion_from_last_control_sequence()
            if expansion:
                yield expansion
            return

        # Save the position of the end of this match for resuming for the next log event.
        last_match_end = match.end()

        event_type = patterns[first_pattern]
        if event_type == "start-expansion":

            # Extract data for the expansion.
            cs_name = match.group("control_sequence_name")
            cs_id = match.group("object_id")
            path = match.group("path").decode("utf-8", errors="ignore")
            cs_start_line = int(match.group("start_line"))
            cs_start_col = int(match.group("start_column"))
            cs_end_line = int(match.group("end_line"))
            cs_end_col = int(match.group("end_column"))

            if top_level_macro:
                # If this macro is a nested macro or an argument, then start expanding it.
                # Upcoming expansion tokens will be assigned to the control sequence.
                if cs_id in active_macros:
                    expanding = cs_id
                    active_macros[cs_id].expansion_tokens = []

                # If an unexpected control sequence was encountered, then what is most likely is that
                # prior macros have finished expanding, and a new macro is being expanded. Finish the
                # prior expansion and start a new one.
                if not cs_id in active_macros and path in in_files:
                    expansion = _make_expansion_from_last_control_sequence()
                    if expansion:
                        yield expansion

                    start_line = start_col = end_line = end_col = None
                    expanding = None
                    active_macros = {}

            # When a macro appears in a file of interest and another macro is not being expanded...
            if not expanding and path in in_files:

                # Set the expansion stack to indicate that this macro is being expanded.
                expanding = cs_id

                # Create a new control sequence object.
                control_sequence = ControlSequence(cs_name, cs_id, CONTROL_SEQUENCE, [])

                # Set the control sequence as the top-level macro to expand next.
                top_level_macro = control_sequence
                active_macros = {cs_id: control_sequence}

                # Save the positions of the control sequence. This forms the basis of the
                # character range of the original text that will be replaced with an expansion.
                start_line = cs_start_line
                start_col = cs_start_col
                end_line = cs_end_line
                end_col = cs_end_col

        # If a token is read that is part of an expansion of a control sequence, assign the token
        # to whichever control sequence is being expanded.
        if event_type == "add-expansion-token":
            text = match.group("token")
            object_id = match.group("object_id")
            category = int(match.group("category_code"))

            if expanding:
                control_sequence = active_macros[expanding]
                token: TexToken
                if category == CONTROL_SEQUENCE:
                    token = ControlSequence(text, object_id, CONTROL_SEQUENCE)
                    # Start tracking the nested macro so it will be expanded later.
                    active_macros[object_id] = token
                else:
                    token = TexToken(text, object_id, category)

                if control_sequence.expansion_tokens is not None:
                    control_sequence.expansion_tokens.append(token)

        # If LaTeXML has read an argument for a control sequence, expand the range of text that will
        # be replaced to include the argument.
        if event_type == "read-argument":
            if top_level_macro:
                path = match.group("path").decode("utf-8", errors="ignore")
                if path in in_files:
                    end_line = int(match.group("end_line"))
                    end_col = int(match.group("end_column"))

        # If LaTeXML has finished expanding a control sequence, then mark the control sequence as
        # having been expanded and pop it from the stack of macros to expand.
        if event_type == "end-expansion":
            cs_id = match.group("object_id")

            cs = active_macros.get(cs_id)
            if cs:
                cs.expanded = True

            if expanding == cs_id:
                expanding = None
