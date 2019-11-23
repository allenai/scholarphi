import logging
import re
from typing import Iterator, List, NamedTuple


class Pattern(NamedTuple):
    """
    Names must be valid Python names.
    """

    name: str
    """
    Regular expression should contain *no* capturing groups.
    """
    regex: str


class Match(NamedTuple):
    pattern: Pattern
    text: str
    start: int
    end: int


"""
Scanning modes
"""
NORMAL_MODE = 0
COMMENT_MODE = 1

"""
Patterns for parsing
"""
COMMENT = Pattern("comment", "(?<![\\\\])%")
NEWLINE = Pattern("newline", "\n")
PRIVATE_PATTERNS = [COMMENT, NEWLINE]


def scan_tex(
    tex: str, patterns: List[Pattern], include_unmatched: bool = False
) -> Iterator[Match]:
    """
    TODO(andrewhead): Generally, don't report matches for input patterns when escaped.
    """
    all_patterns = []
    all_patterns.extend(PRIVATE_PATTERNS)
    all_patterns.extend(patterns)

    patterns_by_name = {p.name: p for p in all_patterns}

    all_regex = [f"(?P<{p.name}>{p.regex})" for p in all_patterns]
    regex = re.compile("|".join(all_regex), flags=re.DOTALL)

    scan_mode = NORMAL_MODE
    last_match = None

    for re_match in regex.finditer(tex):
        group_dict = re_match.groupdict()
        pattern_names = [name for name, text in group_dict.items() if text is not None]
        if len(pattern_names) != 1:
            logging.warning("TeX scanner produced an invalid match: %s", re_match)
            continue

        pattern_name = pattern_names[0]
        pattern = patterns_by_name[pattern_name]

        match = Match(
            pattern, group_dict[pattern_name], re_match.start(), re_match.end()
        )

        if scan_mode is COMMENT_MODE and pattern is NEWLINE:
            scan_mode = NORMAL_MODE

        elif scan_mode is NORMAL_MODE:
            if include_unmatched:
                if last_match is not None:
                    if match.start != last_match.end:
                        yield Match(
                            pattern=Pattern("UNKNOWN", "INVALID"),
                            start=last_match.end,
                            end=match.start,
                            text=tex[last_match.end : match.start],
                        )
                last_match = match
            if pattern is COMMENT:
                scan_mode = COMMENT_MODE
            elif pattern not in PRIVATE_PATTERNS:
                yield match

        last_match = match
