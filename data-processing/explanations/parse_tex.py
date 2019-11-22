import logging
import re
from typing import Iterator, List, NamedTuple, Optional, Set

from TexSoup import RArg, TexNode, TexSoup, TokenWithPosition

from explanations.scan_tex import Match, Pattern, scan_tex
from explanations.types import Bibitem, Equation

TexFileName = str
TexContents = str


CITATION_COMMAND_NAMES = ["cite"]


class Citation(NamedTuple):
    keys: List[str]
    """
    Indexes of characters in TeX where the citation appears.
    """
    start: int
    end: int


class CitationExtractor:
    def __init__(self) -> None:
        self.PATTERNS: List[Pattern] = []
        for command in CITATION_COMMAND_NAMES:
            self.PATTERNS.append(Pattern(command, self._get_command_regex(command)))

    def parse(self, tex: str) -> Iterator[Citation]:
        scanner = scan_tex(tex, self.PATTERNS)
        for match in scanner:
            keys = self._extract_keys(match.pattern.name, match.text)
            yield Citation(keys, match.start, match.end)

    def _get_command_regex(self, command_name: str) -> str:
        return r"\\" + command_name + "{[^}]*?}"

    def _extract_keys(self, command_name: str, command_tex: str) -> List[str]:
        keys_regex = r"\\" + command_name + "{([^}]*?)}"
        keys_match = re.match(keys_regex, command_tex)
        if keys_match is None or keys_match.group(1) is None:
            logging.warning(
                "Unexpectedly, no keys were found in citation %s.", command_tex
            )
            return []
        return keys_match.group(1).split(",")


MATH_ENVIRONMENT_PAIRS = {
    "dollar": {"delimiter": r"(?<![\\])\$"},
    "equation": {"start": r"\\begin{equation}", "end": r"\\end{equation}"},
    "bracket": {"start": r"(?<![\\])\[", "end": r"(?<![\\])\]"},
}


class EquationExtractor:
    """
    TODO(andrewhead): Cases that this doesn't yet handle:
    * Nested dollar signs: "$x + \\hbox{$y$}$"
    """

    def __init__(self) -> None:
        self.PATTERNS: List[Pattern] = []
        for name, spec in MATH_ENVIRONMENT_PAIRS.items():
            if "delimiter" in spec:
                self.PATTERNS.append(Pattern(name + "_delimiter", spec["delimiter"]))
            if "start" in spec and "end" in spec:
                self.PATTERNS.append(Pattern(name + "_start", spec["start"]))
                self.PATTERNS.append(Pattern(name + "_end", spec["end"]))

    def parse(self, tex: str) -> Iterator[Equation]:

        self._stack: List[Match] = []  # pylint: disable=attribute-defined-outside-init
        self._tex = tex  # pylint: disable=attribute-defined-outside-init
        self._equation_index = 0  # pylint: disable=attribute-defined-outside-init

        scanner = scan_tex(tex, self.PATTERNS)
        for match in scanner:
            for equation in self._process_token(match):
                yield equation

    def _process_token(self, match: Match) -> Iterator[Equation]:
        pattern_name = match.pattern.name

        if pattern_name.endswith("_start"):
            self._stack.append(match)

        elif self._in_environment(pattern_name):
            start_pattern_name = self._get_start_pattern_name(pattern_name)
            while self._stack[-1].pattern.name != start_pattern_name:
                self._stack.pop()
            start_match = self._stack.pop()

            equation_tex = self._tex[start_match.start : match.end]
            content_tex = self._tex[start_match.end : match.start]
            yield Equation(
                equation_tex,
                content_tex,
                self._equation_index,
                start_match.start,
                match.end,
                start_match.end,
            )
            self._equation_index += 1

        elif pattern_name.endswith("_delimiter"):
            self._stack.append(match)

    def _get_start_pattern_name(self, end_pattern_name: str) -> str:
        if end_pattern_name.endswith("_delimiter"):
            return end_pattern_name
        return re.sub("_end$", "_start", end_pattern_name)

    def _in_environment(self, end_pattern_name: str) -> bool:
        start_pattern_name = self._get_start_pattern_name(end_pattern_name)
        return any([m.pattern.name == start_pattern_name for m in self._stack])


class ColorLinks(NamedTuple):
    value: str
    value_start: int
    value_end: int


class ColorLinksExtractor:
    def parse(self, tex: str) -> Iterator[ColorLinks]:
        usepackage_pattern = Pattern(
            "usepackage", r"\\usepackage(?:\[[^\]]*?\])?{[^}]*?}"
        )
        scanner = scan_tex(tex, [usepackage_pattern])
        for match in scanner:
            for colorlinks in self._extract_colorlinks(match):
                yield colorlinks

    def _extract_colorlinks(self, match: Match) -> Iterator[ColorLinks]:
        optional_args_regex = r"\\usepackage(?:\[([^\]]*?)\])?"
        optional_args_match = re.search(optional_args_regex, match.text)
        if optional_args_match is not None and optional_args_match.group(1) is not None:
            optional_args = optional_args_match.group(1)
            for colorlinks_match in re.finditer(
                "(?:(?<=^)|(?<=,))\\s*colorlinks\\s*=\\s*(true)\\s*(?=,|$)",
                optional_args,
            ):
                if colorlinks_match.group(1) is not None:
                    yield ColorLinks(
                        "true",
                        optional_args_match.start(1) + colorlinks_match.start(1),
                        optional_args_match.start(1) + colorlinks_match.end(1),
                    )


class BibitemExtractor:
    def __init__(self) -> None:
        self.current_bibitem_label: Optional[str] = None
        self.bibitem_text = ""
        self.nodes_scanned: Set[TexNode] = set()
        self.bibitems: List[Bibitem] = []

    def parse(self, tex: str) -> Iterator[Bibitem]:
        bibitem_pattern = Pattern("bibitem", r"\\bibitem.*?(?=\\bibitem|\n\n|$|\\end{)")
        for bibitem in scan_tex(tex, [bibitem_pattern]):
            try:
                bibitem_soup = parse_soup(bibitem.text)
            except TexSoupParseError:
                continue
            key = self._extract_key(bibitem_soup)
            tokens = self._extract_text(bibitem_soup)
            yield Bibitem(key, tokens)

    def _extract_key(self, bibitem: TexSoup) -> Optional[str]:
        for arg in bibitem[0].args:
            if isinstance(arg, RArg):
                return str(arg.value)
        return None

    def _extract_text(self, bibitem: TexSoup) -> str:
        text = ""
        for content in list(bibitem.contents)[1:]:
            if isinstance(content, TexNode) and content.string is not None:
                text += content.string
            elif isinstance(content, TokenWithPosition):
                text += str(content)
        return _clean_bibitem_text(text)


def _clean_bibitem_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def parse_soup(tex: str) -> TexSoup:
    """
    Use this utility method for parsing TeX fragment into a TexSoup object.
    Only use this for parsing fragments of TeX. Do not use it for parsing full files: TexSoup fails
    on them often enough that your parser will fail on many files. Instead, for processing full TeX
    files, consider using 'scan_tex' which is more bare but much more fault tolerant. You can use it
    to build your own lightweight task-specific parsers like EquationExtractor.
    """
    try:
        soup = TexSoup(tex)
        return soup
    except (TypeError, EOFError) as e:
        raise TexSoupParseError(str(e))


class TexSoupParseError(Exception):
    """
    Error parsing a TeX file using TexSoup.
    """
