import logging
import re
from enum import Enum
from typing import Iterator, List, Tuple, Optional

import pysbd
import regex

from common.parse_tex import (
    EntityExtractor,
    PlaintextExtractor,
    check_for_reserved_characters,
)

from common.types import Symbol
from .types import Sentence

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


def get_context(tex: str, before: int, after: int) -> str:
    """
    Extract context around a span of TeX. The extracted context should be
    rich enough to support pattern matching to determine the context in which
    a sentence appears. The context extracted is one full line above and
    below the the "before" and "after" character indexes.

    Given an original `tex` with `labelInTOC]{Convolutional layer}`, its corresponding
    context might be ` \caption[labelInTOC]{Convolutional layer}`.
    """
    try:
        context_before = " ".join(
            regex.search(r"([^\n\r]*)(?:\n|\r|\r\n)([^\n\r]*?)$", tex[:before]).groups()
        )
    except AttributeError:
        context_before = tex[:before]

    try:
        context_after = " ".join(
            regex.search(r"^([^\n\r]*?)(?:\n|\r|\r\n)([^\n\r]*)", tex[after:]).groups()
        )
    except AttributeError:
        context_after = tex[after:]

    return context_before + tex[before:after] + context_after


def extract_text_from_tex_group(tex_unit: str) -> str:
    return tex_unit[tex_unit.find("{") + 1 : tex_unit.find("}")]


class EquationFormat(Enum):
    " Format of equation information to include in the extracted sentences. "
    OMIT = 1
    " Replace the equation with a placeholder. "
    ID = 2
    " Include the equation ID. "
    BAG_OF_SYMBOLS = 3
    " List all symbols used in the equation. "
    LITERAL = 4
    " Include the literal text of the equation."


class SentenceExtractor(EntityExtractor):

    def __init__(self, equation_format: EquationFormat = EquationFormat.OMIT, symbols: Optional[List[Symbol]] = None) -> None:
        """
        Initialize sentence extractor. Optionally a format for the equations that are in the
        sentence can be specified with 'equation_format'. If the equation format is set to
        a bag of symbols, then a list of all symbols used must be passed in as 'symbols'.
        """
        self.equation_format = equation_format
        self.symbols = symbols

    """
    Extract plaintext sentences from TeX, with offsets of the characters they correspond to in
    the input TeX strings. The extracted sentences might include some junk TeX, having the same
    limitations as the plaintext produced by PlaintextExtractor.
    """

    def parse(self, tex_path: str, tex: str) -> Iterator[Sentence]:
        check_for_reserved_characters(tex)

        # Extract plaintext segments from TeX
        plaintext_extractor = PlaintextExtractor()
        plaintext_segments = plaintext_extractor.parse(tex_path, tex)

        # Build a map from character offsets in the plaintext to TeX offsets. This will let us
        # map from the character offsets of the sentences returned from the sentence boundary
        # detector back to positions in the original TeX.
        plaintext_to_tex_offset_map = {}
        plaintext = ""
        last_segment = None
        equations = {}
        for segment in plaintext_segments:

            # Replace each equation with its unique ID.
            segment_text = segment.text
            math_patterns = list(re.finditer(r"\[\[math\]\]", segment.text))
            for patt_index in range(len(math_patterns) - 1, -1, -1):
                patt = math_patterns[patt_index]
                equation = segment.equations[patt_index]
                segment_text = (
                    segment_text[: patt.start()]
                    + f"[[equation-{equation.id_}]]"
                    + segment_text[patt.end() :]
                )
                equations[equation.id_] = equation.content_tex

            for i in range(len(segment_text)):
                tex_offset = (
                    (segment.tex_start + i)
                    if not segment.transformed
                    else segment.tex_start
                )
                plaintext_to_tex_offset_map[len(plaintext) + i] = tex_offset

            # While building the map, also create a contiguous plaintext string
            plaintext += segment_text
            last_segment = segment

        if last_segment is not None:
            plaintext_to_tex_offset_map[len(plaintext)] = last_segment.tex_end

        # Segment the plaintext. Return offsets for each setence relative to the TeX input
        segmenter = pysbd.Segmenter(language="en", clean=False)

        # Record the current length of the plain text to account for the extractor bug.
        length_so_far_in_plain_text = 0

        # As each sentence is scanned, keep track of what sections and environments the
        # sentence appears within.
        section_name = None
        in_figure = False
        in_table = False
        in_itemize = False

        for i, sentence in enumerate(segmenter.segment(plaintext)):
            # The pysbd module has several open bugs and issues which are addressed below.
            # As of 3/23/20 we know the module will fail in the following ways:
            # 1. pysbd will not break up the sentence when it starts with a punctuation mark or space.
            #    ex: ". hello. world. hi."
            #    sol: check for sentences being longer than 1000 characters.
            # 2. pysbd indexes are sometimes incorrectly set
            #    ex: "hello. world. 1) item one. 2) item two. 3) item three" or "hello!!! world."
            #    sol: set indexes manually using string search + sentence length
            # 3. pysbd uses reserved characters for splitting sentences
            #    ex: see PYSBD_RESERVED_CHARACTERS list.
            #    sol: throw a warning if the sentence contains any of these characters.
            if len(sentence) > 1000:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "Exceptionally long sentence (length %d). This might indicate the sentence "
                    + "extractor failed to properly split text into sentences.",
                    len(sentence),
                )

            plaintext_start = plaintext.find(sentence, length_so_far_in_plain_text)
            plaintext_end = plaintext_start + len(sentence)
            if (
                plaintext_start not in plaintext_to_tex_offset_map
                or plaintext_end not in plaintext_to_tex_offset_map
            ):
                logging.warning(  # pylint: disable=logging-not-lazy
                    "A sentence boundary was incorrect for sentence %s. This is probably "
                    + "an issue with pysbd. Skipping sentence in extractor.",
                    sentence,
                )
                continue
            if plaintext_start - 500 > length_so_far_in_plain_text:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "Sentence boundary start for sentence %s was %d characters ahead of "
                    + "the previous sentence, this might indicate the sentence extractor "
                    + "failed to properly split text.",
                    sentence,
                    plaintext_start - length_so_far_in_plain_text,
                )

            start = plaintext_to_tex_offset_map[plaintext_start]
            end = plaintext_to_tex_offset_map[plaintext_end]
            length_so_far_in_plain_text = plaintext_end
            sentence_tex = tex[start:end]

            # Extract TeX around sentence to understand the environment in which it appears
            context_tex = get_context(tex, start, end)

            # Detect features describing the context the sentence appears in (i.e., the section it's in,
            # or if it's in a figure, etc.) using regular expressions.
            section = regex.findall(
                r"\\(?:sub)*section[*]*\{[A-Za-z0-9 \{\}\\_.,:-]*\}", context_tex
            )
            abstract_begin = regex.findall(r"\\begin\{abstract\}", context_tex)
            abstract_end = regex.findall(r"\\end\{abstract\}", context_tex)
            table_begin = regex.findall(r"\\begin\{table[*]*\}", context_tex)
            table_end = regex.findall(r"\\end\{table[*]*\}", context_tex)
            figure_begin = regex.findall(r"\\begin\{figure[*]*\}", context_tex)
            figure_end = regex.findall(r"\\end\{figure[*]*\}", context_tex)
            itemize_begin = regex.findall(r"\\begin\{itemize[*]*\}", context_tex)
            itemize_end = regex.findall(r"\\end\{itemize[*]*\}", context_tex)
            cite = regex.findall(
                r"\\cite[A-Za-z0-9 \\_\[\].,:-]*\{[A-Za-z0-9 \\_.,:-]*\}", context_tex
            )
            url = regex.findall(
                r"\\url\{[A-Za-z0-9 \{\}/\\_.,:-]*\}", context_tex, overlapped=False
            )
            label = regex.findall(r"\\label\{[A-Za-z0-9 \\_.,:-]*\}", context_tex)
            ref = regex.findall(r"\\ref\{[A-Za-z0-9 \\_.,:-]*\}", context_tex)
            tex_macros = set(
                regex.findall(
                    r"\\[A-Za-z0-9\\\[\]_.,:-]*[\{[A-Za-z0-9 \\_.,:-]*\}]*", context_tex
                )
            )

            # Save a list of other TeX macros that aren't captured by any of the other
            # categories: { any } - { section, label, ... }.
            other_tex_macros: List[str] = []
            named_macros = {
                m
                for l in [
                    abstract_begin,
                    abstract_end,
                    table_begin,
                    table_end,
                    figure_begin,
                    figure_end,
                    itemize_begin,
                    itemize_end,
                    cite,
                ]
                for m in l
            }
            other_tex_macros = list(tex_macros - named_macros)

            # Save section name.
            if abstract_begin:
                section_name = "ABSTRACT"
            if abstract_end:
                section_name = None
            if section:
                section_name = extract_text_from_tex_group(section[0])

            # Save information about whether a sentence is in a figure, table, or other environment.
            # TODO(dykang): considering using \label{} in table/figure to improve matching.
            if figure_begin:
                in_figure = True
            if figure_end:
                in_figure = False
            if table_begin:
                in_table = True
            if table_end:
                in_table = False
            if itemize_begin:
                in_itemize = True
            if itemize_end:
                in_itemize = False

            # Filter sentences to those for which further text processing would be appropriate.
            # A number of heuristics are used (commented below).
            is_valid_sentence = all(
                [
                    # Sentence should appear in a named section.
                    section_name,
                    # Sentence should not appear in a figure or table.
                    # TODO(dykang, andrewhead): eventually, this should be rewritten to permit the
                    # extraction of sentences from captions.
                    not in_figure,
                    not in_table,
                    # If the sentence contained regular expression patterns for the start or end of
                    # an environment, it's probably not a sentence, bur rather just TeX macros.
                    not abstract_begin,
                    not abstract_end,
                    not section,
                    not table_end,
                    not figure_end,
                    not itemize_begin,
                    not itemize_end,
                ]
            )

            if not is_valid_sentence:
                continue

            # Sanitize the text, replacing macros and unwanted TeX with text that will be easier
            # for the text processing algorithms to process.
            sanitized = sentence
            replace_patterns: List[Tuple[str, str]] = []

            # Replace all formulas each with a single word "SYMBOL".
            maths = []
            for math in regex.findall(
                r"\[\[math:id-[0-9]*:[A-Za-z0-9 \\\{\}\(\)\^&\*_.,\+:;\-=#]*\]\]",
                sentence,
                overlapped=False,
            ):
                replace_patterns.append((math, "SYMBOL"))
                maths.append(math)

            # Replace citations with "CITATION".
            for citation in cite:
                citation_text = extract_text_from_tex_group(citation)
                for key in citation_text.split(","):
                    replace_patterns.append((key, "CITATION"))

            # Replace URLs with "URL".
            for url_item in url:
                url_text = extract_text_from_tex_group(url_item)
                replace_patterns.append((url_text, "URL"))

            # Replace references to text elements like figures and tables with a single
            # known word for each type of element. Currently depens on idiomatic patterns
            # for naming elements, like \ref{{fig,tab,sec,eq}:XXX}, to distinguish between
            # element types. Also, the code keeps the token ahead of the reference (e.g.,
            # the word "Table" in "Table\ref{...}"), although it might duplicate the
            # information in the replaced label.
            for reference in ref:
                reference_text = extract_text_from_tex_group(reference)
                for r in reference_text.split(","):
                    if reference.lower().startswith("tab"):
                        replace_patterns.append((r, "TABLE"))
                    if reference.lower().startswith("fig"):
                        replace_patterns.append((r, "FIGURE"))
                    if reference.lower().startswith("sec"):
                        replace_patterns.append((r, "SECTION"))
                    if reference.lower().startswith("eq"):
                        replace_patterns.append((r, "EQUATION"))

            # substtitue with detected patterns
            for pattern, replacement in replace_patterns:
                sanitized = sanitized.replace(pattern, replacement)

            yield Sentence(
                id_=str(i),
                tex_path=tex_path,
                start=start,
                end=end,
                text=sentence,
                sanitized_text=sanitized,
                tex=sentence_tex,
                context_tex=context_tex,
                section_name=section_name,
                in_figure=in_figure,
                in_table=in_table,
                in_itemize=in_itemize,
                label=label,
                ref=ref,
                cite=cite,
                symbol=maths,
                url=url,
                others=other_tex_macros,
            )
