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

    disallow_leading_backslash: bool = True
    """
    If True, adjust the regular expression so the pattern will only match if there is no backslash
    before the pattern. Useful especially for detecting symbols in TeX, e.g., if you want to
    match "$" but not "\\$".
    """


@dataclass(frozen=True)
class Match:
    pattern: Pattern
    text: str
    start: int
    end: int


"""
Patterns for parsing
"""
COMMENT = Pattern("comment", "%[^\n]*(\n|$)")
" Comments are parsed from the '%' through the end of the line. "

PRIVATE_PATTERNS = [COMMENT]


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
        except EndOfInput as e:
            if e.skipped is not None:
                for skipped in e.skipped:
                    yield skipped
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


class EndOfInput(Exception):
    def __init__(self, skipped: Optional[List[Match]]):
        super().__init__()
        self.skipped = skipped


class TexScanner:
    """
    For simple TeX scanning, you should be able to use the 'scan_tex' convenience method above.
    If you need to vary which patterns you're searching for based on where you are in the scan,
    then create a 'TeXScanner' object and invoke like it is invoked in 'scan_tex'.
    """

    def __init__(self, tex: str, i: int = 0) -> None:
        self.tex = tex
        self.i = i
        self.last_match = None

    def next(
        self, patterns: Iterable[Pattern], include_unmatched: bool = False
    ) -> ScanStep:
        """
        Find next substring matching one of the input patterns. If 'include_unmatched' is True,
        the returned result will include an ordered list of skipped, uncommented tokens.
        Raises 'StopIteration' after the last match has been found.
        """
        scan_patterns = PRIVATE_PATTERNS + list(patterns)

        # Create a master regular expression pattern for all input patterns.
        patterns_by_name = {p.name: p for p in scan_patterns}
        regexes = []
        for p in scan_patterns:
            p_regex = p.regex
            if p.disallow_leading_backslash:
                p_regex = r"(?<![\\])" + p_regex
            regexes.append(f"(?P<{p.name}>{p_regex})")
        regex = re.compile("|".join(regexes), flags=re.DOTALL)

        skipped: List[Match] = []
        match = None

        # Search through the TeX for the next matching pattern.
        while match is None:
            re_match = regex.search(self.tex, self.i)

            # If the next match is none, the end of the TeX has been reached.
            if re_match is None:
                if include_unmatched and len(self.tex) > self.i:
                    skipped.append(
                        Match(
                            pattern=Pattern("UNKNOWN", "INVALID"),
                            start=self.i,
                            end=len(self.tex),
                            text=self.tex[self.i : len(self.tex)],
                        )
                    )
                raise EndOfInput(skipped)

            # Get the pattern that produced the next match in the TeX.
            group_dict = re_match.groupdict()
            pattern_names = [
                name for name, text in group_dict.items() if text is not None
            ]
            if len(pattern_names) != 1:
                logging.warning("TeX scanner produced an invalid match: %s", re_match)
                raise ValueError("TeX scanner produced an invalid match: %s" % re_match)

            pattern_name = pattern_names[0]
            pattern = patterns_by_name[pattern_name]

            # If characters were skipped between the last match and this one, get those characters.
            # Note that comments are not considered skipped TeX, and will not be returned.
            if re_match.start() > self.i and include_unmatched:
                skipped.append(
                    Match(
                        pattern=Pattern("UNKNOWN", "INVALID"),
                        start=self.i,
                        end=re_match.start(),
                        text=self.tex[self.i : re_match.start()],
                    )
                )

            # If the matched text is not a comment but rather a caller-supplied pattern, report
            # that there was a match and return the match.
            if pattern is not COMMENT:
                match = Match(
                    pattern, group_dict[pattern_name], re_match.start(), re_match.end(),
                )

            # Update the position of the scanner in the TeX so that the next search for a pattern
            # starts where this search ended.
            self.i = re_match.end()

        skipped = skipped if include_unmatched else None
        return ScanStep(match, skipped)


def has_balanced_braces(tex: str) -> bool:
    """
    Determine whether a TeX string contains balanced braces.
    """

    LEFT_BRACE = Pattern("left_brace", r"\{")
    RIGHT_BRACE = Pattern("right_brace", r"\}")
    patterns = [LEFT_BRACE, RIGHT_BRACE]

    brace_depth = 0
    scanner = TexScanner(tex)
    while True:
        try:
            step = scanner.next(patterns)
        except EndOfInput:
            return brace_depth == 0
        if step.match.pattern.name == "left_brace":
            brace_depth += 1
        elif step.match.pattern.name == "right_brace":
            brace_depth -= 1
