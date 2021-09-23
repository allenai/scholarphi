import logging
import re
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Iterator, List, Optional, Union

from TexSoup import TexSoup

from common.scan_tex import (EndOfInput, Pattern, TexScanner,
                             has_balanced_braces, scan_tex)
from common.types import (BeginDocument, Documentclass, Macro, MacroDefinition,
                          SerializableEntity)

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
