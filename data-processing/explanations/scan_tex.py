import logging
import re
from dataclasses import dataclass
from typing import Iterable, Iterator, List, Optional


@dataclass(frozen=True)
class Pattern:

    name: str
    " Names must be valid Python names. "

    regex: str
    " Regular expression should contain *no* capturing groups. "


@dataclass(frozen=True)
class Match:
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
    scanner = TexScanner(tex)
    while True:
        try:
            step = scanner.next(patterns, include_unmatched)
        except StopIteration:
            return
        if step.skipped is not None:
            for skipped in step.skipped:
                yield skipped
        yield step.match


@dataclass(frozen=True)
class ScanStep:

    match: Match
    " The match found in the most recent scan. "

    skipped: Optional[List[Match]]
    """
    If the caller requested that the scanner include 'unmatched' tokens, this includes an ordered
    list of uncommented tokens that appeared before the match.
    """


class TexScanner:
    def __init__(self, tex: str) -> None:
        self.tex = tex
        self.i: int = 0
        self.mode = NORMAL_MODE
        self.last_match = None

    def next(self, patterns: Iterable[Pattern], include_unmatched: bool) -> ScanStep:
        """
        Find next substring matching one of the input patterns. If 'include_unmatched' is True,
        the returned result will include an ordered list of skipped, uncommented tokens.
        Raises 'StopIteration' after the last match has been found.
        """
        scan_patterns = PRIVATE_PATTERNS + list(patterns)

        patterns_by_name = {p.name: p for p in scan_patterns}
        regexes = [f"(?P<{p.name}>{p.regex})" for p in scan_patterns]
        regex = re.compile("|".join(regexes), flags=re.DOTALL)

        skipped: List[Match] = []
        match = None

        while match is None:
            re_match = regex.search(self.tex, self.i)
            if re_match is None:
                raise StopIteration

            group_dict = re_match.groupdict()
            pattern_names = [
                name for name, text in group_dict.items() if text is not None
            ]
            if len(pattern_names) != 1:
                logging.warning("TeX scanner produced an invalid match: %s", re_match)
                raise StopIteration

            pattern_name = pattern_names[0]
            pattern = patterns_by_name[pattern_name]

            # If this is normal scanning mode and some characters were skipped, report these
            # as skipped tokens.
            if (
                self.mode is NORMAL_MODE
                and re_match.start() > self.i
                and include_unmatched
            ):
                skipped.append(
                    Match(
                        pattern=Pattern("UNKNOWN", "INVALID"),
                        start=self.i,
                        end=re_match.start(),
                        text=self.tex[self.i : re_match.start()],
                    )
                )

            if self.mode is COMMENT_MODE and pattern is NEWLINE:
                self.mode = NORMAL_MODE

            elif self.mode is NORMAL_MODE:
                if pattern is COMMENT:
                    self.mode = COMMENT_MODE
                elif pattern not in PRIVATE_PATTERNS:
                    match = Match(
                        pattern,
                        group_dict[pattern_name],
                        re_match.start(),
                        re_match.end(),
                    )

            self.i = re_match.end()

        skipped = skipped if include_unmatched else None
        return ScanStep(match, skipped)
