import logging
import re
from typing import Dict, Iterator, List, NamedTuple, Optional, Set, Union

from TexSoup import RArg, TexNode, TexSoup, TokenWithPosition

from explanations.scan_tex import (EndOfInput, Match, Pattern, TexScanner,
                                   has_balanced_braces, scan_tex)
from explanations.types import (BeginDocument, Bibitem, Citation, ColorLinks,
                                Documentclass, Equation, Macro,
                                MacroDefinition)

"""
All citation commands from the biblatex package.
The citation extractor takes advantage of the fact that almost all of these citation commands
have the same format (see the regular expression in the citation extractor).

Some of these commands are defined in more than one package. If so, we only list it under
the first package comment subheading below.

If you commands to this list, make sure to escape special characters (e.g., "*") as needed
so these commands can be added to a regular expression.

References:
* biblatex manual. Section 3.8: Citation Commands,
  https://ctan.math.illinois.edu/macros/latex/contrib/biblatex/doc/biblatex.pdf
* natbib manual. Sections 2.3-6.
  http://texdoc.net/texmf-dist/doc/latex/natbib/natbib.pdf
* cite manual. http://ctan.mirrors.hoobly.com/macros/latex/contrib/cite/cite.pdf

TODO(andrewhead): Provide support for the 'multicite' family of commands.
TODO(andrewhead): Provide support for the 'volcite' family of commands.
TODO(andrewhead): Provide support for low-level commands ('citename', 'citelist', 'citefield')
TODO(andrewhead): Provide support for 'mcite' family of commands.
TODO(andrewhead): Provide support for 'citetext' family of commands.
"""
CITATION_COMMAND_NAMES = [
    # LaTeX built-in commands
    "cite",
    # biblatex
    "Cite",
    "parencite",
    "Parencite",
    "footcite",
    "footcitetext",
    "textcite",
    "Textcite",
    "smartcite",
    "Smartcite",
    r"cite\*",
    r"parencite\*",
    "supercite",
    "autocite",
    "Autocite",
    r"autocite\*",
    r"Autocite\*",
    "citeauthor",
    r"citeauthor\*",
    "Citeauthor",
    r"Citeauthor\*",
    "citetitle",
    r"citetitle\*",
    "citeyear",
    r"citeyear\*",
    "citedate",
    r"citedate\*",
    "citeurl",
    "fullcite",
    "footfullcite",
    "notecite",
    "Notecite",
    "pnotecite",
    "Pnotecite",
    "fnotecite",
    # natbib
    "citet",
    "Citet",
    r"citet\*",
    r"Citet\*",
    "citep",
    "Citep",
    r"citep\*",
    r"Citep\*",
    "citealt",
    "Citealt",
    r"citealt\*",
    r"Citealt\*",
    "citealp",
    "Citealp",
    r"citealp\*",
    r"Citealp\*",
    "citenum",
    "citeyearpar",
    "citefullauthor",
    "Citefullauthor",
    "citetalias",
    "citepalias",
    # 'cite' package
    "citen",
    "citeonline",
]


class CitationExtractor:
    def __init__(self) -> None:
        self.PATTERNS: List[Pattern] = [
            Pattern("citation", self._get_command_regex(CITATION_COMMAND_NAMES))
        ]

    def parse(self, tex: str) -> Iterator[Citation]:
        scanner = scan_tex(tex, self.PATTERNS)
        for match in scanner:
            keys = self._extract_keys(match.text)
            yield Citation(match.start, match.end, keys)

    def _get_command_regex(self, commands: List[str]) -> str:
        """
        A citation command typically has this structure:

        \\command[prenote][postnote]{keys}[punctuation]

        where prenote, postnote, and punctuation are all optional.
        Reference: https://ctan.math.illinois.edu/macros/latex/contrib/biblatex/doc/biblatex.pdf
        """
        command_names = r"(?:" + "|".join([r"\\" + c for c in commands]) + ")"
        return command_names + r"(?:\[[^\]]*\]){0,2}{[^}]*?}(?:\[[^\]]*\])?"

    def _extract_keys(self, command_tex: str) -> List[str]:
        keys_regex = r".*(?:\[[^\]]*\]){0,2}{([^}]*?)}(?:\[[^\]]*\])?$"
        keys_match = re.match(keys_regex, command_tex)
        if keys_match is None or keys_match.group(1) is None:
            logging.warning(
                "Unexpectedly, no keys were found in citation %s.", command_tex
            )
            return []
        return keys_match.group(1).split(",")


class NamedEnv(NamedTuple):
    name: str
    star: bool


class DelimitedEnv(NamedTuple):
    delimiter: str


class StartEndEnv(NamedTuple):
    start: str
    end: str


EnvSpec = Union[DelimitedEnv, NamedEnv, StartEndEnv]


"""
List of math environments from: https://latex.wikia.org/wiki/List_of_LaTeX_environments
TODO(andrewhead): Support 'alignat'.
"""
MATH_ENVIRONMENT_SPECS: Dict[str, EnvSpec] = {
    # Inline math
    "dollar": DelimitedEnv(r"\$(?!\$)"),
    "parens": StartEndEnv(r"\\\(", r"\\\)"),
    "math": NamedEnv("math", star=False),
    # Display math
    "dollardollar": DelimitedEnv(r"\$\$"),
    "bracket": StartEndEnv(r"\\\[", r"\\\]"),
    "displaymath": NamedEnv("displaymath", star=True),
    "equation": NamedEnv("equation", star=True),
    "split": NamedEnv("split", star=True),
    "array": NamedEnv("array", star=True),
    "eqnarray": NamedEnv("eqnarray", star=True),
    "multiline": NamedEnv("multiline", star=True),
    "gather": NamedEnv("gather", star=True),
    "align": NamedEnv("align", star=True),
    "flalign": NamedEnv("flalign", star=True),
}


def begin_environment_regex(name: str) -> str:
    return r"\\begin{" + name + r"}"


def end_environment_regex(name: str) -> str:
    return r"\\end{" + name + r"}"


def make_math_environment_patterns() -> List[Pattern]:

    begin = begin_environment_regex
    end = end_environment_regex

    patterns: List[Pattern] = []
    for name, spec in MATH_ENVIRONMENT_SPECS.items():
        if isinstance(spec, DelimitedEnv):
            patterns.append(Pattern(name + "_delimiter", spec.delimiter))
        elif isinstance(spec, StartEndEnv):
            patterns.append(Pattern(name + "_start", spec.start))
            patterns.append(Pattern(name + "_end", spec.end))
        elif isinstance(spec, NamedEnv):
            patterns.append(Pattern(name + "_start", begin(spec.name)))
            patterns.append(Pattern(name + "_end", end(spec.name)))
            if spec.star:
                patterns.append(Pattern(name + "s_start", begin(spec.name + r"\*")))
                patterns.append(Pattern(name + "s_end", end(spec.name + r"\*")))
    return patterns


class EquationExtractor:
    """
    TODO(andrewhead): Cases that this doesn't yet handle:
    * Nested dollar signs: "$x + \\hbox{$y$}$"
    """

    def __init__(self) -> None:
        self.PATTERNS = make_math_environment_patterns()

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

            depth = len(self._stack)
            equation_tex = self._tex[start_match.start : match.end]
            content_tex = self._tex[start_match.end : match.start]
            yield Equation(
                start_match.start,
                match.end,
                self._equation_index,
                equation_tex,
                start_match.end,
                match.start,
                content_tex,
                depth,
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


class BeginDocumentExtractor:
    def parse(self, tex: str) -> Optional[BeginDocument]:
        pattern = Pattern("begin_document", r"\\begin{document}")
        scanner = scan_tex(tex, [pattern], include_unmatched=False)
        try:
            match = next(scanner)
            return BeginDocument(match.start, match.end)
        except StopIteration:
            return None


class DocumentclassExtractor:
    def parse(self, tex: str) -> Optional[Documentclass]:
        patterns = [
            Pattern("documentclass", r"\\documentclass"),
            Pattern("optional_arg", r"\[[^\]]*?\]"),
            Pattern("required_arg", r"{[^}]*?}"),
        ]

        match_stage = "start"
        start: int = -1
        required_arg = None

        scanner = scan_tex(tex, patterns, include_unmatched=True)
        for match in scanner:

            # Once we hit a token that's not the document class or argument, return the document
            # class if the required argument has been found; otherwise, abort.
            if match.pattern.name == "UNKNOWN":
                if match_stage == "awaiting-optional-arg":
                    return Documentclass(start, match.start)
                elif not match.text.isspace():
                    break

            elif match_stage == "start":
                if match.pattern.name != "documentclass":
                    return None
                start = match.start
                match_stage = "awaiting-required-arg"

            elif match_stage == "awaiting-required-arg":
                if match.pattern.name == "required_arg":
                    match_stage = "awaiting-optional-arg"
                    required_arg = match

            elif match_stage == "awaiting-optional-arg":
                if match.pattern.name == "optional_arg":
                    end = match.end
                    return Documentclass(start, end)

        if required_arg is not None:
            return Documentclass(start, required_arg.end)
        return None


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
                        match.start
                        + optional_args_match.start(1)
                        + colorlinks_match.start(1),
                        match.start
                        + optional_args_match.start(1)
                        + colorlinks_match.end(1),
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


class MacroExtractor:
    """
    This extractor follows the argument-parsing logic described on p203-4 of the TeXBook.
    """

    LEFT_BRACE = Pattern("left_brace", r"\{")
    RIGHT_BRACE = Pattern("right_brace", r"\}")

    def parse(self, tex: str, macro_definition: MacroDefinition) -> Iterator[Macro]:
        parser = self._parse(tex, macro_definition)
        while True:
            try:
                macro = next(parser)
                yield macro
            # Run until the scanner has indicated that the end of input has been reached.
            except EndOfInput:
                return

    def _parse(self, tex: str, macro_definition: MacroDefinition) -> Iterator[Macro]:
        self.scanner = TexScanner(tex)  # pylint: disable=attribute-defined-outside-init
        name_pattern = Pattern("macro", r"\\" + macro_definition.name)

        # This loop will run until the scanner raises an 'EndOfInput' or indicates another error.
        while True:

            # Parse the macro name.
            step = self.scanner.next([name_pattern])
            macro_start = step.match.start
            token_end = step.match.end

            # Parse each of the expected tokens in the parameter string.
            tokens = re.split(r"(#\d+)", macro_definition.parameter_string)
            if tokens[0] == '':
                del tokens[0]
            if len(tokens) >= 1 and tokens[len(tokens) - 1] == '':
                del tokens[len(tokens) - 1]
            for i, token in enumerate(tokens):
                if re.match(r"#\d+", token):
                    if ((i == len(tokens) - 1) or
                        (re.match(r"#\d+", tokens[i + 1]))):
                        token_end = self._scan_undelimited_parameter()
                    else:
                        token_end = self._scan_delimited_parameter(tokens[i + 1], tex)
                else:
                    token_end = self._scan_delimiter(token)

            # The macros text is the text of the name and all parameters.
            yield Macro(macro_start, token_end, tex[macro_start: token_end])

    def _scan_undelimited_parameter(self) -> int:
        patterns = [self.LEFT_BRACE, Pattern("nonspace_character", r"\S")]
        step = self.scanner.next(patterns)

        # If a non-space character, match just the first character.
        if step.match.pattern.name == "nonspace_character":
            return step.match.end

        # If the first match is a left-brace, parse until the braces are balanced.
        brace_depth = 1
        brace_patterns = [self.LEFT_BRACE, self.RIGHT_BRACE]
        while True:
            step = self.scanner.next(brace_patterns)
            if step.match.pattern.name == "left_brace":
                brace_depth += 1
            elif step.match.pattern.name == "right_brace":
                brace_depth -= 1
            if brace_depth == 0:
                return step.match.end

    def _scan_delimited_parameter(self, delimiter: str, tex: str) -> int:
        scan_start = self.scanner.i

        # Scan for the delimiter with a lookahead so that the scanner doesn't consume the tokens
        # for the delimiter while searching for it.
        delimiter_pattern = Pattern("delimiter", "(?=" + re.escape(delimiter) + ")")

        while True:
            step = self.scanner.next([delimiter_pattern])
            text_before_delimiter = tex[scan_start: step.match.start]
            if has_balanced_braces(text_before_delimiter):
                return step.match.start

    def _scan_delimiter(self, delimiter: str) -> int:
        pattern = Pattern("delimiter", re.escape(delimiter))
        step = self.scanner.next([pattern], include_unmatched=True)
        if step.skipped is not None and len(step.skipped) > 0:
            logging.warning(
                "Unexpectedly found unmatched text before macro argument delimiter."
            )
        return step.match.end


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
