from common.parse_tex import (
    EquationLengthAssignmentExtractor,
    MacroExtractor,
    begin_environment_regex,
    end_environment_regex,
)
from common.scan_tex import Pattern, scan_tex
from common.types import MacroDefinition


def sanitize_equation(tex: str) -> str:
    tex = _replace_unwanted_commands_with_spaces(tex)
    return tex


def _replace_unwanted_commands_with_spaces(tex: str) -> str:
    """
    KaTeX isn't programmed to support the entire vocabulary of LaTeX equation markup (though it
    does support a lot, see https://katex.org/docs/support_table.html).

    For those commands that we don't need to have parsed (e.g., 'label'), this function will
    strip those commands out, so that they cause KaTeX to crash or have unexpected behavior.
    'label', for example, if not removed, will have its argument parsed as an equation, and
    will be identified as consisting of many symbols.
    """
    UNWANTED_MACROS = [
        MacroDefinition("ref", "#1"),
        MacroDefinition("label", "#1"),
        MacroDefinition("nonumber", ""),
    ]
    macro_extractor = MacroExtractor()
    for macro_definition in UNWANTED_MACROS:
        for macro in macro_extractor.parse(tex, macro_definition):
            tex = _replace_substring_with_space(tex, macro.start, macro.end)

    length_assignment_extractor = EquationLengthAssignmentExtractor()
    length_assignments = length_assignment_extractor.parse(tex)
    for assignment in length_assignments:
        tex = _replace_substring_with_space(tex, assignment.start, assignment.end)

    UNWANTED_PATTERNS = [
        Pattern("ampersand", "&"),
        Pattern("split_start", begin_environment_regex("split")),
        Pattern("split_end", end_environment_regex("split")),
    ]
    unwanted_matches = scan_tex(tex, UNWANTED_PATTERNS)
    for match in unwanted_matches:
        tex = _replace_substring_with_space(tex, match.start, match.end)

    return tex


def _replace_substring_with_space(s: str, start: int, end: int) -> str:
    return s[:start] + (" " * (end - start)) + s[end:]
