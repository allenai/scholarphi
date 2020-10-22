import logging
import re
import string
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, Iterator, List, Optional, Union

from TexSoup import TexSoup

from common.scan_tex import (
    EndOfInput,
    Match,
    Pattern,
    TexScanner,
    has_balanced_braces,
    scan_tex,
)
from common.string import JournaledString
from common.types import (
    BeginDocument,
    CharacterRange,
    Documentclass,
    Equation,
    LengthAssignment,
    Macro,
    MacroDefinition,
    Phrase,
    SerializableEntity,
)

DEFAULT_CONTEXT_SIZE = 20
"""
Default number of characters to include in the context to either side of an entity in that
entity's 'context_tex' attribute.
"""


class EntityExtractor(ABC):
    """
    Interface for a class that extracts entities from TeX. Implement this interface when you
    intend to detect and colorize a new type of entity. This interface enforces the need to return
    'SerializableEntity's, which are embellished with unique identifiers that will be used in
    later stages of the pipeline, and the entity's TeX for debugging purposes.
    """

    @abstractmethod
    def parse(self, tex_path: str, tex: str) -> Iterator[SerializableEntity]:
        """
        Parse the 'tex', returning an iterator over the entities found. Entity extractors should
        not need to use the 'tex_path' for anything except for setting the 'tex_path' attribute
        on extracted entities.
        """


LEFT_BRACE = Pattern("left_brace", r"\{")
RIGHT_BRACE = Pattern("right_brace", r"\}")


@dataclass(frozen=True)
class NamedEnv:
    name: str
    star: bool
    arg_pattern: str = ""


@dataclass(frozen=True)
class DelimitedEnv:
    delimiter: str


@dataclass(frozen=True)
class StartEndEnv:
    start: str
    end: str


EnvSpec = Union[DelimitedEnv, NamedEnv, StartEndEnv]


"""
List of math environments from: https://latex.wikia.org/wiki/List_of_LaTeX_environments
TODO(andrewhead): Support 'alignat' and 'matrix'.
TODO(andrewhead): Determine if any other environments besides 'array' have arguments.
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
    "array": NamedEnv("array", arg_pattern=r"(?:\{[^}]*\})?", star=True),
    "eqnarray": NamedEnv("eqnarray", star=True),
    "multiline": NamedEnv("multiline", star=True),
    "gather": NamedEnv("gather", star=True),
    "align": NamedEnv("align", star=True),
    "flalign": NamedEnv("flalign", star=True),
}


def begin_environment_regex(name: str, arg_pattern: str = "") -> str:
    return r"\\begin{" + name + r"}" + r"(\s*" + arg_pattern + ")"


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
            patterns.append(
                Pattern(name + "_start", begin(spec.name, spec.arg_pattern))
            )
            patterns.append(Pattern(name + "_end", end(spec.name)))
            if spec.star:
                patterns.append(
                    Pattern(
                        name + "s_start", begin(spec.name + r"\*", spec.arg_pattern)
                    )
                )
                patterns.append(Pattern(name + "s_end", end(spec.name + r"\*")))
    return patterns


class EquationExtractor(EntityExtractor):
    """
    TODO(andrewhead): Cases that this doesn't yet handle:
    * Nested dollar signs: "$x + \\hbox{$y$}$"
    """

    def __init__(self) -> None:
        self.PATTERNS = make_math_environment_patterns()

    def parse(self, tex_path: str, tex: str) -> Iterator[Equation]:

        self._stack: List[Match] = []  # pylint: disable=attribute-defined-outside-init
        self._tex = tex  # pylint: disable=attribute-defined-outside-init
        self._tex_path = tex_path  # pylint: disable=attribute-defined-outside-init
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

            start = start_match.start
            end = match.end
            depth = len(self._stack)
            equation_tex = self._tex[start_match.start : match.end]
            content_tex = self._tex[start_match.end : match.start]
            context_tex = self._tex[
                start - DEFAULT_CONTEXT_SIZE : end + DEFAULT_CONTEXT_SIZE
            ]

            yield Equation(
                tex_path=self._tex_path,
                id_=str(self._equation_index),
                tex=equation_tex,
                context_tex=context_tex,
                start=start_match.start,
                end=match.end,
                i=self._equation_index,
                content_start=start_match.end,
                content_end=match.start,
                content_tex=content_tex,
                katex_compatible_tex=sanitize_equation(content_tex),
                depth=depth,
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


"""
Valid units of measure in TeX and related engines.
"""
LENGTH_UNITS = [
    # From The TeXBook, "Chapter 10: Dimensions", p57.
    "pt",
    "pc",
    "in",
    "bp",
    "cm",
    "mm",
    "dd",
    "cc",
    "sp",
    # From the LaTeX book on Wikibooks: https://en.wikibooks.org/wiki/LaTeX/Lengths
    "ex",
    "em",
    "nd",
    "nc",
]

"""
Parameters for laying out arrays in LaTeX. From "The LaTeX2E Sources" by Braams et al.,
version 2019-10-01 Patch Level 1, page 341.
"""
ARRAY_PARAMETERS = [
    "arraycolsep",
    "tabcolsep",
    "arrayrulewidth",
    "doublerulesep",
    "arraystretch",
]


class EquationLengthAssignmentExtractor:
    """
    Extracts length assignments of the form "\\[parameter]=[#][unit of measurement]",
    for example "\\arraycolsep=2pt"
    """

    def parse(self, tex: str) -> Iterator[LengthAssignment]:
        parameter_names_pattern = (
            r"(?:" + "|".join([r"\\" + p for p in ARRAY_PARAMETERS]) + ")"
        )
        unit_pattern = r"(?:" + "|".join(LENGTH_UNITS) + ")"
        assignment_pattern = (
            parameter_names_pattern + r"\s*=\s*[0-9\.]+\s*" + unit_pattern
        )
        pattern = Pattern("length_assignment", assignment_pattern)
        scanner = scan_tex(tex, [pattern])
        for match in scanner:
            yield LengthAssignment(match.start, match.end)


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


def delimit_equations(s: JournaledString, equations: List[Equation]) -> JournaledString:
    " Replace delimiters around TeX equations with standardized delimiters. "

    replacements: Dict[CharacterRange, str] = {}

    def needs_space_before(s: JournaledString, character_index: int) -> bool:
        return character_index > 0 and not s[character_index - 1].isspace()

    def needs_space_after(s: JournaledString, character_index: int) -> bool:
        return character_index < len(s) and not s[character_index].isspace()

    for equation in equations:

        start_replacement_range = CharacterRange(equation.start, equation.content_start)
        start_replacement = f"EQUATION_DEPTH_{equation.depth}_START"
        if needs_space_before(s, start_replacement_range.start):
            start_replacement = " " + start_replacement
        if needs_space_after(s, start_replacement_range.end):
            start_replacement = start_replacement + " "
        replacements[start_replacement_range] = start_replacement

        end_replacement_range = CharacterRange(equation.content_end, equation.end)
        end_replacement = f"EQUATION_DEPTH_{equation.depth}_END"
        if needs_space_before(s, end_replacement_range.start):
            end_replacement = " " + end_replacement
        if needs_space_after(s, end_replacement_range.end):
            end_replacement = end_replacement + " "
        replacements[end_replacement_range] = end_replacement

    for replacement_range in sorted(
        replacements.keys(), key=lambda r: r.start, reverse=True
    ):
        replacement_text = replacements[replacement_range]
        s = s.edit(replacement_range.start, replacement_range.end, replacement_text)

    return s


def extract_plaintext(tex_path: str, tex: str) -> JournaledString:
    """
    Extracts plaintext from TeX. Some TeX will be replaced (e.g., "\\\\" with "\n". Other TeX will be
    skipped (e.g., macros, braces, and brackets).

    The returned string is a 'JournaledString', which contains helper functions that allows
    the client to map from character offsets in the plaintext string back to character offsets in
    the original 'tex' string provided as input to this function.

    It's definitely not perfect: this extracted text will include text extracted from many
    command arguments, because we knew sometimes it would be wanted, and
    other times it wouldn't. Without more sophisticated macro processing, it's not possible to
    tell which arguments would be rendered as text and which wouldn't.

    For the use case of sentence boundary detection, spurious macro arguments are often
    okay to keep in the text as they only infrequently influence the detected boundaries. To
    support other natural language processing tasks, this extractor may need to be further refined.
    """

    # Patterns of text that should be kept verbatim (i.e., not scanned for the patterns below).
    KEEP_PATTERNS = [
        # TeX equations should be kept in tact. The 'EQUATION_DEPTH_*' markers are inserted into
        # the TeX around all equations as the first step in plaintext extraction.
        Pattern("equation", "EQUATION_DEPTH_0_START.*?EQUATION_DEPTH_0_END")
    ]

    # Patterns of text that should be replaced with other plaintext.
    REPLACE_PATTERNS = {
        # Separate sections and captions text from the rest of the text.
        Pattern("section", r"\s*\\(?:sub)*section\*?\{([^}]*)\}\s*"): "\n\n\\1.\n\n",
        Pattern("paragraph", r"\s*\\paragraph*?\{([^}]*)\}\s*"): "\n\n\\1.\n\n",
        Pattern("caption", r"(.)(?=\\caption\*?\{)"): "\\1\n\n",
        # Replace commands for which colorizing the contents will lead to compilation failures.
        CITATION_PATTERN: "Citation (\\1)",
        Pattern("label", r"\\label\{([^}]+)\}"): "(Label \\1)",
        Pattern("ref", r"\\(?:page|c)?ref\{([^}]+)\}"): "(Ref \\1)",
        Pattern("glossary_term", r"\\gls(?:pl)?\*?\{([^}]+)\}"): "Glossary term (\\1)",
        # Replace macros with spaces.
        Pattern("macro", r"\\[a-zA-Z]+\*?[ \t]*"): " ",
        # Replace TeX source spaces with semantic spacing.
        Pattern("linebreak_keep", r"(\\\\|\\linebreak)|\n(\s)*\n\s*"): "\n",
        Pattern("linebreak_ignore", r"\n"): " ",
        Pattern("space_macro", r"\\[ ,]"): " ",
        Pattern("tilde", r"~"): " ",
        # Replace characters that need to be escaped in TeX with unescaped text.
        Pattern("ampersand", r"\\&"): "&",
    }

    # Patterns of text the extractor should skip.
    SKIP_PATTERNS = [
        # Include specific macros first, before the more general-purpose 'macro'.
        Pattern("input", r"\\(input|include)(\s+\S+|\{[^}]+\})"),
        # Many patterns below were written with reference to the LaTeX tokenizer in Python's
        # 'doctools' sources at:
        # http://svn.python.org/projects/doctools/converter/converter/tokenizer.py
        Pattern("environment_tags", r"\\(begin|end)\{[^}]*\}"),
        RIGHT_BRACE,
        LEFT_BRACE,
        Pattern("left_bracket", r"\["),
        Pattern("right_bracket", r"\]"),
        # The following macros are a backslash followed by an ASCII symbol. This pattern was
        # written with reference to the command list at:
        # http://www.public.asu.edu/~rjansen/latexdoc/ltx-2.html
        # Pattern("symbol_macro", r"\\[@=><+'`-]"),
    ]

    # All math equations will be replaced in plaintext with the text "<<equation-{id}>>".
    # This ID should be the same as the one output by the equation pipeline.
    plaintext = JournaledString(tex)
    equation_extractor = EquationExtractor()
    equations = list(equation_extractor.parse(tex_path, tex))
    plaintext = delimit_equations(plaintext, equations)

    patterns = KEEP_PATTERNS + list(REPLACE_PATTERNS.keys()) + SKIP_PATTERNS
    scanner = scan_tex(str(plaintext), patterns, include_unmatched=True)

    # If the scanner yields a span of text, the span is either:
    # 1. a pattern to keep
    # 2. a pattern to skip
    # 3. a pattern to replace
    # 4. some other uncommented text
    # If some span of text is not returned by the scanner, then it is a comment,
    # or some other text that the scanner ignores. That text should be removed from the
    # plain text as if it was a pattern to skip.
    # Iterate over matches in reverse so as not to mess up character offsets for
    # earlier matches when replacing TeX in the string.
    keep_after = len(plaintext)
    for match in reversed(list(scanner)):
        if match.end < keep_after:
            plaintext = plaintext.edit(match.end, keep_after, "")
            keep_after = match.end
        if match.pattern in REPLACE_PATTERNS:
            plaintext = plaintext.edit(
                match.start,
                match.end,
                re.sub(
                    match.pattern.regex, REPLACE_PATTERNS[match.pattern], match.text
                ),
            )
        if match.pattern not in SKIP_PATTERNS:
            keep_after = match.start

    if keep_after > 0:
        plaintext = plaintext.edit(0, keep_after, "")

    # Finally, remove adjacent periods (which interfere with the pysbd sentence
    # segmenter), which may only be adjacent because the TeX grouping has been removed.
    # Do a lookahead for the last period (don't include it in the match) in order
    # to change as little of the original TeX as possible, to make it easier to map
    # back from the original period position (which will often occur at the end of
    # an extracted sentence) to its precise position in the original TeX.
    for m in reversed(list(re.finditer(r"[\s\.]+(?=\.)", str(plaintext)))):
        plaintext = plaintext.edit(m.start(), m.end(), "")

    return plaintext


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


def _make_citation_command_regex(commands: List[str]) -> str:
    """
    A citation command typically has this structure:
    \\command[prenote][postnote]{keys}[punctuation]
    where prenote, postnote, and punctuation are all optional.
    Reference: https://ctan.math.illinois.edu/macros/latex/contrib/biblatex/doc/biblatex.pdf
    """
    command_names = r"(?:" + "|".join([r"\\" + c for c in commands]) + ")"
    return command_names + r"(?:\[[^\]]*\]){0,2}{([^}]*?)}(?:\[[^\]]*\])?"


CITATION_PATTERN = Pattern(
    "citation", _make_citation_command_regex(CITATION_COMMAND_NAMES)
)


@dataclass(frozen=True)
class Shingle:
    " A shingle, with a start and end offset of where it's from in the text. "
    text: str
    start: int
    end: int


class PhraseExtractor(EntityExtractor):
    """
    Extracts known phrases from TeX.
    """

    def __init__(self, phrases: List[str], max_phrase_len: int = 5) -> None:
        self.phrases = phrases
        self.max_phrase_len = max_phrase_len

    @staticmethod
    def get_shingles(text: str, size: int) -> Iterator[Shingle]:
        tokens = []
        for match in re.finditer(r"[^\.!,?()\[\]{}\s]+", text):
            tokens.append((match.group(0), match.start(), match.end()))
        for i in range(0, len(tokens) - size + 1):
            shingle_tokens = tokens[i : i + size]
            yield Shingle(
                text=" ".join([t[0] for t in shingle_tokens]),
                start=min([t[1] for t in shingle_tokens]),
                end=max([t[2] for t in shingle_tokens]),
            )

    def parse(self, tex_path: str, tex: str) -> Iterator[Phrase]:
        plaintext = extract_plaintext(tex_path, tex)
        phrase_count = 0
        for size in range(1, self.max_phrase_len + 1):
            for shingle in PhraseExtractor.get_shingles(str(plaintext), size):
                cands = [shingle]
                for cand in list(cands):
                    cands.append(
                        Shingle(
                            cand.text.strip(string.punctuation), cand.start, cand.end
                        )
                    )
                for cand in list(cands):
                    cands.append(Shingle(cand.text.lower(), cand.start, cand.end))
                for cand in list(cands):
                    if cand.text.endswith("s"):
                        cands.append(Shingle(cand.text[:-1], cand.start, cand.end))
                final_cands = set(cands)
                for cand in final_cands:
                    if cand.text in self.phrases:
                        start, end = plaintext.initial_offsets(cand.start, cand.end)
                        if start is not None and end is not None:
                            yield Phrase(
                                id_=str(phrase_count),
                                start=start,
                                end=end,
                                tex_path=tex_path,
                                tex=tex[start:end],
                                context_tex=tex[
                                    start
                                    - DEFAULT_CONTEXT_SIZE : end
                                    + DEFAULT_CONTEXT_SIZE
                                ],
                                text=cand.text,
                            )
                            phrase_count += 1
                            break


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
    """
    Detected calls to the documentclass command, wherever it appears in a TeX file. See past
    implementations of this class if you want a version of this extractor that enforced the
    requirement that the documentclass was the first command in the TeX.
    """

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

            if match_stage == "start":
                if match.pattern.name != "documentclass":
                    continue
                start = match.start
                match_stage = "awaiting-required-arg"

            # Once we hit a token that's not the document class or argument, return the document
            # class if the required argument has been found; otherwise, abort.
            elif match.pattern.name == "UNKNOWN":
                if match_stage == "awaiting-optional-arg":
                    return Documentclass(start, match.start)
                if not match.text.isspace():
                    break

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


class MacroExtractor:
    """
    Extracts all instances of a macro defined by 'macro_definition'.
    This extractor follows the argument-parsing logic described on p203-4 of the TeXBook.
    """

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
            if tokens[0] == "":
                del tokens[0]
            if len(tokens) >= 1 and tokens[len(tokens) - 1] == "":
                del tokens[len(tokens) - 1]
            for i, token in enumerate(tokens):
                if re.match(r"#\d+", token):
                    if (i == len(tokens) - 1) or (re.match(r"#\d+", tokens[i + 1])):
                        token_end = self._scan_undelimited_parameter()
                    else:
                        token_end = self._scan_delimited_parameter(tokens[i + 1], tex)
                else:
                    token_end = self._scan_delimiter(token)

            # The macros text is the text of the name and all parameters.
            yield Macro(macro_start, token_end, tex[macro_start:token_end])

    def _scan_undelimited_parameter(self) -> int:
        patterns = [LEFT_BRACE, Pattern("nonspace_character", r"\S")]
        step = self.scanner.next(patterns)

        # If a non-space character, match just the first character.
        if step.match.pattern.name == "nonspace_character":
            return step.match.end

        # If the first match is a left-brace, parse until the braces are balanced.
        brace_depth = 1
        brace_patterns = [LEFT_BRACE, RIGHT_BRACE]
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
            text_before_delimiter = tex[scan_start : step.match.start]
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


# These are 'reserved characters' by the pysbd module and can potentially
# cause issues if they are present in a string. This list was compiled from the
# psybd source code as of 3/23/20. locations:
# ∯: https://github.com/nipunsadvilkar/pySBD/blob/master/pysbd/abbreviation_replacer.py, https://github.com/nipunsadvilkar/pySBD/blob/master/pysbd/lists_item_replacer.py
# ȸ: https://github.com/nipunsadvilkar/pySBD/blob/master/pysbd/processor.py
# ♨: https://github.com/nipunsadvilkar/pySBD/blob/master/pysbd/lists_item_replacer.py
# ☝: https://github.com/nipunsadvilkar/pySBD/blob/master/pysbd/lists_item_replacer.py
# ✂: https://github.com/nipunsadvilkar/pySBD/blob/master/pysbd/lists_item_replacer.py
# ⎋: https://github.com/nipunsadvilkar/pySBD/blob/master/pysbd/punctuation_replacer.py
# ᓰ: https://github.com/nipunsadvilkar/pySBD/blob/master/pysbd/punctuation_replacer.py
# ᓱ: https://github.com/nipunsadvilkar/pySBD/blob/master/pysbd/punctuation_replacer.py
# ᓳ: https://github.com/nipunsadvilkar/pySBD/blob/master/pysbd/punctuation_replacer.py
# ᓴ: https://github.com/nipunsadvilkar/pySBD/blob/master/pysbd/processor.py, https://github.com/nipunsadvilkar/pySBD/blob/master/pysbd/punctuation_replacer.py
# ᓷ: https://github.com/nipunsadvilkar/pySBD/blob/master/pysbd/cleaner.py, https://github.com/nipunsadvilkar/pySBD/blob/master/pysbd/punctuation_replacer.py
# ᓸ: https://github.com/nipunsadvilkar/pySBD/blob/master/pysbd/processor.py, https://github.com/nipunsadvilkar/pySBD/blob/master/pysbd/punctuation_replacer.py
PYSBD_RESERVED_CHARACTERS: List[str] = [
    "∯",
    "ȸ",
    "♨",
    "☝",
    "✂",
    "⎋",
    "ᓰ",
    "ᓱ",
    "ᓳ",
    "ᓴ",
    "ᓷ",
    "ᓸ",
]


def check_for_pysbd_reserved_characters(tex: str) -> None:
    for reserved_char in PYSBD_RESERVED_CHARACTERS:
        if reserved_char in tex:
            logging.warning(
                'Reserved character from pysbd "%s" found in tex string, this might break the sentence extractor.',
                reserved_char,
            )


def get_containing_entity(
    entity: SerializableEntity, entities: List[SerializableEntity]
) -> Optional[SerializableEntity]:
    """
    Find the first entity from 'entities' that fully contains 'entity' (i.e., the TeX character
    range of 'entity' falls within the range of the returned entity). Performs brute force search.
    """
    for e in entities:
        if (
            e.tex_path == entity.tex_path
            and e.start <= entity.start
            and e.end >= entity.end
        ):
            return e
    return None


def overlaps(entity1: SerializableEntity, entity2: SerializableEntity) -> bool:
    """
    Determine whether two entities overlap in TeX.
    """
    if not entity1.tex_path == entity2.tex_path:
        return False
    intersection_left = max(entity1.start, entity2.start)
    intersection_right = min(entity1.end, entity2.end)
    return intersection_right - intersection_left > 0


class TexSoupParseError(Exception):
    """
    Error parsing a TeX file using TexSoup.
    """
