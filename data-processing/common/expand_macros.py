import re
from dataclasses import dataclass
from typing import Dict, Iterator, List, Optional, Pattern, Match

from common.types import AbsolutePath

# TeX category codes. TeX processes different tokens differently (i.e., it has different ways
# for processing letters, numbers, etc.). Each token is assigned a category code to tell TeX how
# it should be processed. We can detect category codes from TeX to unambiguously determine whether
# a token is a letter, a control sequence, etc. For a list of available category codes see:
# https://www.overleaf.com/learn/latex/Table_of_TeX_category_codes.
# Not that while it seems control sequences have category code 0 in regular TeX, LaTeXML detects
# them with category code 16. We use the latter value in this script.
CatCode = int
LETTER = 11
CONTROL_SEQUENCE = 16


@dataclass
class TexToken:
    """
    A token read that was read in a TeX file.
    """

    text: bytes
    object_id: bytes
    """
    Corresponds to the memory address where the token is stored in LaTeXML. In some cases, the
    object ID is not necessarily unique. For letter tokens with the same TeX
    (e.g., two tokens with the text 'x'), they have observed to have the same object ID. For
    control sequences, it appears that all instances of a control sequence have a unique object ID.
    """

    catcode: CatCode
    """
    Category code. The primary purpose of the category code is to distinguish between characters
    that are meant to be literal letters (e.g., 'a', 'b', 'c', ...) and those that are control
    sequences (e.g., '\\mymacro'), as extra spaces will have to be inserted after control
    sequences in expanded macros to make sure they are parsed by a TeX processor correctly.
    """


@dataclass
class ControlSequence(TexToken):
    """
    A control sequence that was read in a TeX file. Control sequences include macros, definitions,
    and commands, among other primitives.
    """

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


# A unique ID for a control sequence (in this script, its memory location).
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

        # Control sequences should be followed by spaces in cases where either
        # 1. the control sequence is the last token in the stream (and hence
        #    we do not know what will appear after it in the TeX).
        # 2. the next token in the expansion is a letter, which would be grouped
        #    into the control sequence if not separated by a space (see\
        #    https://tex.stackexchange.com/a/423018/198728).
        if isinstance(token, ControlSequence):
            if _should_include_control_sequence(token):
                text += token.text
                if next_token and next_token.catcode == LETTER:
                    text += b" "
        else:
            text += token.text

    return text


def _should_include_control_sequence(control_sequence: ControlSequence) -> bool:
    """
    Determine whether a control sequence should be included (i.e., removed) from an expansion.
    """
    # When expanding control sequences defined with \DeclareMathOperator, LaTeXML inserts a
    # '@wrapper' control sequence into the expansion (e.g., '\op@wrapper' for an operator named
    # '\op'). I do not know why, though it seems to be a noop in LaTeXML and does not seem to
    # have an analog in LaTeX. Therefore all '\*@wrapper' control sequences are treated as
    # noops and removed from the expansion.
    if control_sequence.text.endswith(b"@wrapper"):
        return False
    return True


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


# Regular expressions for detecting macro expansions in LaTeXML log outputs. Each pattern
# includes named groups (i.e., (?P<name>...)) to capture important information about macros.
DEFINITION_PATTERN_PREFIX = b"Control sequence '\\"
DEFINITION_PATTERN = re.compile(
    b"Control sequence '(?P<control_sequence_name>.*?)' "
    + rb"defined when reading file (?P<path>.*?)\.$",
    flags=re.MULTILINE | re.DOTALL,
)

START_PATTERN_PREFIX = b"Start of expansion."
START_PATTERN = re.compile(
    b"Start of expansion. "
    + br"Control sequence: T_CS\[(?P<control_sequence_name>.*?)\]\. "
    + br"\(object ID: (?P<object_id>.*?)\)\. "
    + br"Current expansion depth: \d+\. "
    + br"\(If this.*?, it appeared in (?P<path>.*?) "
    + br"from line (?P<start_line>\d+), col (?P<start_column>\d+) "
    + br"to line (?P<end_line>\d+), col (?P<end_column>\d+)\)\.",
    flags=re.MULTILINE | re.DOTALL,
)

TOKEN_PATTERN_PREFIX = b"Expansion token:"
TOKEN_PATTERN = re.compile(
    b"Expansion token: (?P<token>.*?) "
    + br"\(object ID (?P<object_id>.*?)\)\. "
    + br"Category: (?P<category_code>\d+)\. "
    + br"Expandable: (?:true|false)\.",
    flags=re.MULTILINE | re.DOTALL,
)

ARGUMENT_PATTERN_PREFIX = b"Argument token (from file):"
ARGUMENT_PATTERN = re.compile(
    br"Argument token \(from file\): "
    + br'".*?" \(object ID: (?P<object_id>.*?)\)\. '
    + br"\(source file (?P<path>.*?), "
    + br"from line (?P<start_line>\d+) col (?P<start_column>\d+) "
    + br"to line (?P<end_line>\d+) col (?P<end_column>\d+)\)\.",
    flags=re.MULTILINE | re.DOTALL,
)

END_PATTERN_PREFIX = b"End of expansion "
END_PATTERN = re.compile(
    b"End of expansion "
    + br"\(object ID: (?P<object_id>.*?)\)\. "
    + br"Current expansion depth: \d+\. "
    + br"Expansion: .+?\.",
    flags=re.MULTILINE | re.DOTALL,
)


@dataclass
class LogPattern:
    prefix: bytes
    capture: Pattern[bytes]


patterns: Dict[str, LogPattern] = {
    "definition": LogPattern(DEFINITION_PATTERN_PREFIX, DEFINITION_PATTERN),
    "start-expansion": LogPattern(START_PATTERN_PREFIX, START_PATTERN),
    "add-expansion-token": LogPattern(TOKEN_PATTERN_PREFIX, TOKEN_PATTERN),
    "read-argument": LogPattern(ARGUMENT_PATTERN_PREFIX, ARGUMENT_PATTERN),
    "end-expansion": LogPattern(END_PATTERN_PREFIX, END_PATTERN),
}


@dataclass
class LogMatch:
    match: Match[bytes]
    event_name: str


@dataclass
class Expansion:
    """
    The output of the method for detecting expansions. Includes all the information that should
    be needed to replace each appearance of a macro with its expansion---the position of the
    macro and its arguments, and the text (as bytes) to replace it with.
    """

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

    For 'start_line' and 'end_line', the first line in a file is 1 (not 0). For 'start_col' and
    'end_col', the first character on the line is at col 0 (not 1, in contrast to the line number).
    """

    expansion: bytes


def detect_expansions(
    expansion_log: bytes, used_in: List[AbsolutePath], defined_in: List[AbsolutePath]
) -> Iterator[Expansion]:
    """
    Scan a log output by LaTeXML to detect the appearance of macros and their expansions.
    'expansion_log' is the console output produced by running our custom instrumented version of
    LaTeXML on a TeX project. It will include log statements indicating when macros are
    encountered and how they are expanded. 'used_in' is a list of absolute paths to files
    in which expansions will be detected in. Expansions outside these files will not be detected.
    'defined_in' is a list of absolute paths to files where macros must have been defined
    in order to be are expanded. The purpose of the 'defined_in' argument is to prevent
    expansion of low-level macros, or those that are defined in external pacakges, like
    '\\number', '\\left[', or '\\textnormal'.
    """

    detector = MacroExpansionDetector()
    return detector.detect_expansions(expansion_log, used_in, defined_in)


class MacroExpansionDetector:
    def __init__(self) -> None:

        self._expandable: List[bytes]
        """
        List of macros that can be expanded, specified by control sequence name (i.e., the name
        of the macro like '\mymacro'). Contains macros that have been defined in the files
        specified by 'defined_in', and omits all others.
        """

        self._top_level_macro: Optional[ControlSequence]
        """
        A top level macro that is currently being expanded (i.e., one that appears in
        the TeX of one of the 'in_files').
        """

        self._expanding: Optional[ControlSequenceId]
        """
        ID of a macro that is being expanded. Need not be top-level---it will often be a
        macro that appears as an argument, or in an expansion of another macro.
        """

        self._active_macros: Dict[ControlSequenceId, ControlSequence]
        """
        A lookup table from object IDs to control sequences. This table is used when expanding
        macros nested within others, or passed as arguments to others.
        """

        self._start_line: Optional[int]
        self._start_col: Optional[int]
        self._end_line: Optional[int]
        self._end_col: Optional[int]
        """
        Positions of start and end of a macro being expanded, and all of its arguments (i.e.,
        an entire span of text that should be replaced with an expansion).
        """

        self._expansion_log: bytes
        " Console output from running LaTeXML macro expansion branch on a TeX project. "

        self._used_in: List[AbsolutePath]
        self._defined_in: List[AbsolutePath]
        """
        Lists of paths to files where macros are used or defined to filter which macro expansions
        will be detected. See 'detect_expansions' documentation for more details.
        """

    def detect_expansions(
        self,
        expansion_log: bytes,
        used_in: List[AbsolutePath],
        defined_in: List[AbsolutePath],
    ) -> Iterator[Expansion]:
        self._used_in = used_in
        self._defined_in = defined_in

        # Reset state of macro expansion every time the public detection function is called.
        self._expandable = []
        self._top_level_macro = None
        self._expanding = None
        self._active_macros = {}
        self._start_line = None
        self._start_col = None
        self._end_line = None
        self._end_col = None

        for event in self._read_events(expansion_log):
            event_type = event.event_name

            # Detect all macros defined in the specified files (ignoring the rest).
            if event_type == "definition":
                self._process_definition(event)

            if event_type == "start-expansion":
                last_expansion = self._process_start_expansion(event)
                if last_expansion:
                    yield last_expansion

            # If a token is read that is part of an expansion of a control sequence, assign the token
            # to whichever control sequence is being expanded.
            if event_type == "add-expansion-token":
                self._process_add_expansion_token(event)

            # If LaTeXML has read an argument for a control sequence, expand the range of text that will
            # be replaced to include the argument.
            if event_type == "read-argument":
                self._process_read_argument(event)

            # If LaTeXML has finished expanding a control sequence, then mark the control sequence as
            # having been expanded and pop it from the stack of macros to expand.
            if event_type == "end-expansion":
                self._process_end_expansion(event)

        expansion = self._make_expansion_from_last_control_sequence()
        if expansion:
            yield expansion

    def _read_events(self, log: bytes) -> Iterator[LogMatch]:
        # Repeatedly scan for macro expansion-related events in the LaTeXML log.
        last_match_end = 0
        while True:

            # Find the next segment of the log containing an expansion event.
            first_pattern_name = None
            first_prefix_start = None
            for name, pattern in patterns.items():
                prefix_start = log.find(pattern.prefix, last_match_end)
                if prefix_start == -1:
                    continue
                if first_prefix_start is None or prefix_start < first_prefix_start:
                    first_prefix_start = prefix_start
                    first_pattern_name = name

            # When there are no more log messages to process, stop iteration.
            if first_prefix_start is None or not first_pattern_name:
                return

            # Capture data fields for the pattern.
            pattern = patterns[first_pattern_name]
            match = pattern.capture.search(log, pos=first_prefix_start)
            if match is None:
                last_match_end = first_prefix_start + 1
                continue

            yield LogMatch(match, first_pattern_name)

            # Save the position of the end of this match for resuming for the next log event.
            last_match_end = match.end()

    def _process_definition(self, log_match: LogMatch) -> None:
        match = log_match.match
        cs_name = match.group("control_sequence_name")
        path = match.group("path").decode("utf-8", errors="ignore")
        if path in self._defined_in:
            self._expandable.append(cs_name)

    def _process_start_expansion(self, log_match: LogMatch) -> Optional[Expansion]:
        """
        If a new expansion has started, then that often means that the last expansion is finished.
        This method returns an expansion whenever it is inferred that the start of this expansion
        means that the prior expansion has finished being processed.
        """

        # Extract data for the expansion.
        match = log_match.match
        cs_name = match.group("control_sequence_name")
        cs_id = match.group("object_id")
        path = match.group("path").decode("utf-8", errors="ignore")
        cs_start_line = int(match.group("start_line"))
        cs_start_col = int(match.group("start_column"))
        cs_end_line = int(match.group("end_line"))
        cs_end_col = int(match.group("end_column"))

        # Set 'expansion' if the start of this expansion means another expansion has finished.
        expansion = None

        # Skip expansion of macros that were not defined in a set of specified TeX files.
        if cs_name not in self._expandable:
            return None

        if self._top_level_macro:
            # If this macro is a nested macro or an argument, then start expanding it.
            # Upcoming expansion tokens will be assigned to the control sequence.
            # XXX(andrewhead): Check that the macro also has the same name as the macro
            # that is expected next, as in some rare cases, two macros have had the same
            # cs_id, despite being different macros.
            if (
                cs_id in self._active_macros
                and self._active_macros[cs_id].text == cs_name
            ):
                self._expanding = cs_id
                self._active_macros[cs_id].expansion_tokens = []

            # If an unexpected control sequence was encountered, then what is most likely is that
            # prior macros have finished expanding, and a new macro is being expanded. Finish the
            # prior expansion and start a new one.
            elif path in self._used_in:
                expansion = self._make_expansion_from_last_control_sequence()

                self._start_line = (
                    self._start_col
                ) = self._end_line = self._end_col = None
                self._expanding = None
                self._active_macros = {}

        # When a macro appears in a file of interest and another macro is not being expanded...
        if not self._expanding and path in self._used_in:

            # Set the expansion stack to indicate that this macro is being expanded.
            self._expanding = cs_id

            # Create a new control sequence object.
            control_sequence = ControlSequence(cs_name, cs_id, CONTROL_SEQUENCE, [])

            # Set the control sequence as the top-level macro to expand next.
            self._top_level_macro = control_sequence
            self._active_macros = {cs_id: control_sequence}

            # Save the positions of the control sequence. This forms the basis of the
            # character range of the original text that will be replaced with an expansion.
            self._start_line = cs_start_line
            self._start_col = cs_start_col
            self._end_line = cs_end_line
            self._end_col = cs_end_col

        return expansion

    def _process_add_expansion_token(self, log_match: LogMatch) -> None:

        match = log_match.match
        text = match.group("token")
        object_id = match.group("object_id")
        category = int(match.group("category_code"))

        if self._expanding:
            control_sequence = self._active_macros[self._expanding]
            token: TexToken
            if category == CONTROL_SEQUENCE:
                token = ControlSequence(text, object_id, CONTROL_SEQUENCE)
                # Start tracking the nested macro so it will be expanded later.
                self._active_macros[object_id] = token
            else:
                token = TexToken(text, object_id, category)

            if control_sequence.expansion_tokens is not None:
                control_sequence.expansion_tokens.append(token)

    def _process_read_argument(self, log_match: LogMatch) -> None:
        match = log_match.match
        if self._top_level_macro and self._expanding:
            path = match.group("path").decode("utf-8", errors="ignore")
            if path in self._used_in:
                self._end_line = int(match.group("end_line"))
                self._end_col = int(match.group("end_column"))

    def _process_end_expansion(self, log_match: LogMatch) -> None:
        match = log_match.match
        cs_id = match.group("object_id")

        cs = self._active_macros.get(cs_id)
        if cs:
            cs.expanded = True

        if self._expanding == cs_id:
            self._expanding = None

    def _make_expansion_from_last_control_sequence(self) -> Optional[Expansion]:
        """
        Wrap up the last expanded control sequence into an Expansion object.
        """

        if not self._top_level_macro:
            return None

        if (
            not self._top_level_macro.expanded
            or self._start_line is None
            or self._start_col is None
            or self._end_line is None
            or self._end_col is None
        ):
            return None

        return Expansion(
            macro_name=self._top_level_macro.text,
            start_line=self._start_line,
            start_col=self._start_col,
            end_line=self._end_line,
            end_col=self._end_col,
            expansion=_get_expansion_text(self._top_level_macro),
        )


def expand_macros(
    contents: bytes,
    expansions: List[Expansion],
    wrap_expansions_in_groups: bool = False,
) -> bytes:
    """
    Apply expansions to the contents of a TeX file. It is recommended that this method
    is called with 'wrap_expansions_in_groups' set. This will wrap all expansions in
    curly braces (i.e., '{' and '}', or group delimiters in TeX). The advantage of wrapping
    in groups is that it averts several potential sources of TeX compilation errors that
    could arise from expanding macros, including:

    - expanding a macro right after another unexpanded macro such that it then gets
      merged into the macro name before it
      Example: \\unexpandable\\expandstox -> \\unexpandablex
    """

    # Sort expansions from last to first.
    expansions_sorted = sorted(
        expansions, key=lambda e: (e.start_line, e.start_col), reverse=True
    )

    # Map from expansions (by their index in the list of sorted expansions) to their
    # start offsets and end offsets in the file (in number of bytes from the very
    # start of the file; first character is at offset 0).
    start_offsets: List[int] = [-1] * len(expansions_sorted)
    end_offsets: List[int] = [-1] * len(expansions_sorted)

    # Need to keep the line ends (i.e., newline characters at the ends of lines) as
    # they should be included in the character offset.
    lines = contents.splitlines(keepends=True)
    line_start = 0
    for line_number, line in enumerate(lines, start=1):
        for ei, expansion in enumerate(expansions_sorted):
            if start_offsets[ei] == -1 and expansion.start_line == line_number:
                start_offsets[ei] = line_start + expansion.start_col
            if end_offsets[ei] == -1 and expansion.end_line == line_number:
                end_offsets[ei] = line_start + expansion.end_col

        line_start += len(line)

    # Apply expansions (in reverse order)
    contents_copy = bytes(contents)
    for ei, expansion in enumerate(expansions_sorted):
        macro_start = start_offsets[ei]
        macro_end = end_offsets[ei]
        if macro_start == -1 or macro_end == -1:
            continue
        # Do not replace macro if the text to be expanded does not start with the macro name.
        if not contents_copy[macro_start:macro_end].startswith(expansion.macro_name):
            continue

        expansion_tex = expansion.expansion
        if wrap_expansions_in_groups:
            expansion_tex = b"{" + expansion_tex + b"}"

        contents_copy = (
            contents_copy[:macro_start] + expansion_tex + contents_copy[macro_end:]
        )

    return contents_copy
