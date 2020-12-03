import logging
import os.path
from typing import Iterator, List, Optional, Tuple

import pysbd
import regex
from common.parse_tex import (
    EntityExtractor,
    check_for_pysbd_reserved_characters,
    extract_plaintext,
)
from common.types import CharacterRange

from .types import Sentence

DIR_PATH = os.path.dirname(__file__)


def get_context(tex: str, before: int, after: int) -> str:
    """
    Extract context around a span of TeX. The extracted context should be
    rich enough to support pattern matching to determine the context in which
    a sentence appears. The context extracted is one full line above and
    below the the "before" and "after" character indexes.

    Given an original `tex` with `labelInTOC]{Convolutional layer}`, its corresponding
    context might be ` \\caption[labelInTOC]{Convolutional layer}`.
    """
    context_before = " ".join(tex[:before].splitlines()[-2:])
    context_after = " ".join(tex[after:].splitlines()[:2])
    return context_before + tex[before:after] + context_after


def extract_text_from_tex_group(tex_unit: str) -> str:
    return tex_unit[tex_unit.find("{") + 1 : tex_unit.find("}")]


class SentenceExtractor(EntityExtractor):
    def __init__(self, from_named_sections_only: bool = True,) -> None:
        self.from_named_sections_only = from_named_sections_only

        # Initialize a list of English words that can be used later to detect whether a sentence
        # is likely an English sentence (and not LaTeX junk). The English words come from the
        # public domain lists of English words of sizes '10' through '35' from the SCOWL project:
        # http://wordlist.aspell.net/. These lists are small lists of English words recommended
        # for spell checkers. For more details on how the lists were created, see the README in the
        # 'english_words' directory.
        self.english_words = set()
        for filename in ["english-words.10", "english-words.20", "english-words.35"]:
            word_list_path = os.path.join(DIR_PATH, "english_words", filename)
            with open(word_list_path, encoding="iso-8859-1") as english_words_file:
                for l in english_words_file:
                    self.english_words.add(l.strip())

    """
    Extract plaintext sentences from TeX, with offsets of the characters they correspond to in
    the input TeX strings. The extracted sentences might include some junk TeX, having the same
    limitations as the plaintext produced by PlaintextExtractor.
    """

    def parse(self, tex_path: str, tex: str) -> Iterator[Sentence]:
        check_for_pysbd_reserved_characters(tex)

        # Extract plaintext from TeX.
        plaintext = extract_plaintext(tex_path, tex)

        # Segment the plaintext. Return offsets for each setence relative to the TeX input
        segmenter = pysbd.Segmenter(language="en", clean=False, char_span=True)

        # As each sentence is scanned, keep track of what sections and environments the
        # sentence appears within.
        section_name = None
        in_figure = False
        in_table = False
        in_itemize = False

        # The pysbd module has several open bugs and issues which are addressed below.
        # As of 3/23/20 we know the module will fail in the following ways:
        # 1. pysbd will not break up the sentence when it starts with a punctuation mark or space.
        #    ex: ". hello. world. hi."
        #    sol: check for sentences being longer than 1000 characters. Also, see the
        #         plaintext extraction function, which attempts to clean up the text so that
        #         consecutive periods are removed before segmentation.
        # 2. pysbd uses reserved characters for splitting sentences
        #    ex: see PYSBD_RESERVED_CHARACTERS list.
        #    sol: throw a warning if the sentence contains any of these characters.
        sentence_ranges: List[CharacterRange] = []
        sentence_start: Optional[int] = None

        for span in segmenter.segment(str(plaintext)):
            if sentence_start is None:
                # Strip leading whitespace from sentence.
                sentence_start = span.start + regex.search(r"^(\s*)", span.sent).end()

            # Don't detect a sentence boundary in the middle of a equation
            is_boundary_in_equation = regex.search(
                r"EQUATION_DEPTH_0_START(?!.*EQUATION_DEPTH_0_END)",
                str(plaintext[sentence_start : span.end]),
                flags=regex.DOTALL,
            )
            if not is_boundary_in_equation:
                # Strip trailing whitespace from sentence.
                end = span.start + regex.search(r"(\s*)$", span.sent).start()
                sentence_ranges.append(CharacterRange(sentence_start, end))
                sentence_start = None

        for i, sentence_range in enumerate(sentence_ranges):
            tex_start, tex_end = plaintext.initial_offsets(
                sentence_range.start, sentence_range.end
            )
            if tex_start is None or tex_end is None:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "The span bounds (%d, %d) from pysbd for a sentence could not be mapped "
                    + "back to character offsets in the LaTeX for an unknown reason.",
                    sentence_range.start,
                    sentence_range.end,
                )
                continue

            sentence_tex = tex[tex_start:tex_end]

            # Save the sentence as a journaled string, which will allow the mapping of the cleaned
            # sentence text to the original TeX.
            sentence = plaintext.substring(
                sentence_range.start,
                sentence_range.end,
                # These truncation options are important for preserving the mapping from offsets in
                # the edited sentence to the initial offsets before the edits.
                include_truncated_left=False,
                include_truncated_right=False,
            )
            if len(sentence) > 1000:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "Exceptionally long sentence (length %d). This might indicate the sentence "
                    + "extractor failed to properly split text into sentences.",
                    len(sentence),
                )

            # Extract TeX around sentence to understand the environment in which it appears
            context_tex = get_context(tex, tex_start, tex_end)

            # Detect features describing the context the sentence appears in (i.e., the section it's in,
            # or if it's in a figure, etc.) using regular expressions.
            section = regex.findall(
                r"\\(?:sub)*section[*]*\{[A-Za-z0-9 \{\}\\_.,:-]*\}", context_tex
            )
            abstract_begin = regex.findall(r"\\begin\{abstract\}", context_tex)
            abstract_end = regex.findall(r"\\end\{abstract\}", context_tex)
            table_begin = regex.findall(r"\\begin\{tabular\}", context_tex)
            table_end = regex.findall(r"\\end\{tabular\}", context_tex)
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

            # Use heuristics about the surrounding text to determine whether or not this
            # sentence is valid. These heuristics have a number of limitations, and should be
            # replaced with more mature rules for detecting whether the sentence is indeed in
            # names section, the abstract, a figure, a table, etc. See documentation of its
            # limitations here: https://github.com/allenai/scholar-reader/issues/138#issue-678432430
            validity_guess = all(
                [
                    # Sentence should appear in a named section.
                    (not self.from_named_sections_only) or section_name,
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

            tokens = regex.split(r"[\s,;.!?()]+", str(sentence))
            contains_common_english_word = any(
                [len(t) > 1 and t.lower() in self.english_words for t in tokens]
            )
            ends_with_stop = bool(regex.search(r"[,.:;!?]\s*$", str(sentence)))
            is_clean = contains_common_english_word and ends_with_stop

            # Sanitize the text, replacing macros and unwanted TeX with text that will be easier
            # for the text processing algorithms to process.
            sanitized = sentence
            replace_patterns: List[Tuple[str, str]] = []

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
            # known word for each type of element. Currently depends on idiomatic patterns
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

            # Substitute patterns with replacements.
            for pattern, replacement in replace_patterns:
                if pattern == "":
                    continue
                match_start = 0
                while True:
                    match_offset = sanitized.find(pattern, match_start)
                    if match_offset == -1:
                        break
                    sanitized = sanitized.edit(
                        match_offset, match_offset + len(pattern), replacement
                    )
                    match_start = match_offset + len(pattern)

            yield Sentence(
                id_=str(i),
                tex_path=tex_path,
                start=tex_start,
                end=tex_end,
                text=str(sentence),
                text_journal=sentence,
                sanitized=str(sanitized),
                sanitized_journal=sanitized,
                tex=sentence_tex,
                context_tex=context_tex,
                validity_guess=validity_guess,
                is_clean=is_clean,
                section_name=section_name,
                in_figure=in_figure,
                in_table=in_table,
                in_itemize=in_itemize,
                label=label,
                ref=ref,
                cite=cite,
                url=url,
                others=other_tex_macros,
            )
