import logging
import re
from typing import Dict, Iterator, List

import pysbd
import regex

from common.parse_tex import (
    DEFAULT_CONTEXT_SIZE,
    EntityExtractor,
    PlaintextExtractor,
    check_for_reserved_characters,
)

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

# regex patterns for detecting entities from the richer tex
PATTERN_SECTION = r"\\(?:sub)*section[*]*\{[A-Za-z0-9 \{\}\\_.,:-]*\}"
PATTERN_LABEL = r"\\label\{[A-Za-z0-9 \\_.,:-]*\}"
PATTERN_ABSTRACT_BEGIN = r"\\begin\{abstract\}"
PATTERN_ABSTRACT_END = r"\\end\{abstract\}"
PATTERN_TABLE_BEGIN = r"\\begin\{table[*]*\}"
PATTERN_TABLE_END = r"\\end\{table[*]*\}"
PATTERN_FIGURE_BEGIN = r"\\begin\{figure[*]*\}"
PATTERN_FIGURE_END = r"\\end\{figure[*]*\}"
PATTERN_ITEMIZE_BEGIN = r"\\begin\{itemize[*]*\}"
PATTERN_ITEMIZE_END = r"\\end\{itemize[*]*\}"

PATTERN_REF = r"\\ref\{[A-Za-z0-9 \\_.,:-]*\}"
PATTERN_CITE = r"\\cite[A-Za-z0-9 \\_\[\].,:-]*\{[A-Za-z0-9 \\_.,:-]*\}"
PATTERN_SYMBOL = r"\$[A-Za-z0-9\\ \{\}\(\)\[\]^&*_.,\+:\;-\=#]*\$"
PATTERN_URL = r"\\url\{[A-Za-z0-9 \{\}/\\_.,:-]*\}"
PATTERN_ANY = r"\\[A-Za-z0-9\\\[\]_.,:-]*[\{[A-Za-z0-9 \\_.,:-]*\}]*"

# PATTERN_IFFALSE_BEGIN = r"\\iffalse"
# PATTERN_IFFALSE_END = r"\\fi"

PATTERN_BEGIN = r"\\begin\{[A-Za-z0-9 \{\}\\_.,:-]*\}"
PATTERN_END = r"\\end\{[A-Za-z0-9 \{\}\\_.,:-]*\}"


PATTERN_MATH = r"\[\[math:id-[0-9]*:[A-Za-z0-9 \\\{\}\(\)\^&\*_.,\+:;\-=#]*\]\]"

# objects for detecting nesting structures from the extended tex
NESTING_CHARACTERS_MAPPING = {"{": "}", "[": "]"}


# (deprecated function)
def check_nesting_structure(nesting_chars: List[str]) -> bool:
    stack = []
    for nchar in nesting_chars:
        if nchar in list(NESTING_CHARACTERS_MAPPING.keys()):
            stack.append(nchar)
        elif nchar in list(NESTING_CHARACTERS_MAPPING.values()):
            if len(stack) == 0:
                return False
            else:
                if NESTING_CHARACTERS_MAPPING[stack[-1]] != nchar:
                    return False
                else:
                    stack.pop()
        else:
            return False
    return True


def check_sentence_or_not(tex: str, tex_unit_dict: Dict[str, List[str]]) -> bool:
    if tex is None:
        return False

    # check whether tex in section or not
    if "current_section" not in tex_unit_dict or not tex_unit_dict["current_section"]:
        return False
    # check whether tex is caption in figure/table or not. currently, we remove all text including captions in figure/table
    # TODO @dykang later, distinguish lines in table and lines in captions
    if (
        "is_sentence_in_figure" in tex_unit_dict
        and tex_unit_dict["is_sentence_in_figure"]
    ):
        return False
    if (
        "is_sentence_in_table" in tex_unit_dict
        and tex_unit_dict["is_sentence_in_table"]
    ):
        return False

    # if "is_iffalse" in tex_unit_dict and tex_unit_dict["is_iffalse"]:
    #     return False

    # ignore the tex line that declares sections or begin/end of abstract section
    if len(tex_unit_dict["abstract_begin"]) > 0:
        return False
    if len(tex_unit_dict["abstract_end"]) > 0:
        return False
    if len(tex_unit_dict["section"]) > 0:
        return False
    if len(tex_unit_dict["table_end"]) > 0:
        return False
    if len(tex_unit_dict["figure_end"]) > 0:
        return False
    if len(tex_unit_dict["itemize_begin"]) > 0:
        return False
    if len(tex_unit_dict["itemize_end"]) > 0:
        return False

    return True


    # # check whether tex has incomplete nesting structure or not
    # # There are some cases that the previous section/figure/table filters do not cover. For instance, some lines in section declaration have very noisy lines like "Introduction}" or "-9pt}". Those cases can be simply filtered by checking their nesting structures.
    # nesting_characters_in_tex = []
    # for c in tex:
    #    if c in list(NESTING_CHARACTERS_MAPPING.keys()) + list(
    #        NESTING_CHARACTERS_MAPPING.values()
    #    ):
    #        nesting_characters_in_tex.append(c)
    # return check_nesting_structure(nesting_characters_in_tex)


def extract_richer_tex(context_tex: str, tex: str) -> str:
    """
    Extracting richer context tex for better regex matching:
    Currently `context_tex` is made of concatenating a fixed length of prefix and postfix of `tex`. In that case, `context_tex` may include a lot of other information, causing errors in extraction. For instance, given an original `tex` with `labelInTOC]{Convolutional layer}`, its corresponding `context_tex` and `richer_tex` are `ter.pdf}   \caption[labelInTOC]{Convolutional layer}   \label{fig:convla` and ` \caption[labelInTOC]{Convolutional layer}`, respectively. If the `\label{fig:convla` was actually a complete form, it would be detected by our regex extraction.
    If surrounding tex includes multiple matched tex cases, we regard the most right-handed one is the final one. This is not a perfect heuristic though for some cases including next line inside the content
    """
    if context_tex is "":
        return ""
    surrounding_tex = context_tex.split(tex)
    if len(surrounding_tex) > 2:
        surrounding_tex = [tex.join(surrounding_tex[:-1]), surrounding_tex[-1]]
    before_tex, after_tex = surrounding_tex
    richer_tex = before_tex.split("\n")[-1] + tex + after_tex.split("\n")[0]
    return richer_tex


def extract_text_from_tex_group(tex_unit: str) -> str:
    """ Extracting text from a TeX group """
    return tex_unit[tex_unit.find("{") + 1 : tex_unit.find("}")]


class SentenceExtractor(EntityExtractor):
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
        for segment in plaintext_segments:

            # Andrew's changes start here
            segment_text = segment.text
            math_patterns = list(re.finditer(r"\[\[math\]\]", segment.text))
            for patt_index in range(len(math_patterns) - 1, -1, -1):
                patt = math_patterns[patt_index]
                equation = segment.equations[patt_index]
                segment_text = (
                    segment_text[: patt.start()]
                    + f"[[math:id-{equation.id_}:{equation.content_tex}]]"
                    + segment_text[patt.end() :]
                )

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
        # Record the current length of the plain text so account for the extractor bug
        length_so_far_in_plain_text = 0

        current_section = ""
        # is_iffalse = False
        is_sentence_in_table, is_sentence_in_figure, is_sentence_in_itemize = (
            False,
            False,
            False,
        )
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
                logging.warning(
                    "Exceptionally long sentence (length %d), this might indicate the sentence extractor failed to properly split text into sentences.",
                    len(sentence),
                )

            plaintext_start = plaintext.find(sentence, length_so_far_in_plain_text)
            plaintext_end = plaintext_start + len(sentence)
            if (
                plaintext_start not in plaintext_to_tex_offset_map
                or plaintext_end not in plaintext_to_tex_offset_map
            ):
                logging.warning(
                    "A sentence boundary was incorrect for sentence %s. This is probably an issue with pysbd. Skipping sentence in extractor.",
                    sentence,
                )
                continue
            if plaintext_start - 500 > length_so_far_in_plain_text:
                logging.warning(
                    "Sentence boundary start for sentence %s was %d characters ahead of the previous sentence, this might indicate the sentence extractor failed to properly split text.",
                    sentence,
                    plaintext_start - length_so_far_in_plain_text,
                )

            start = plaintext_to_tex_offset_map[plaintext_start]
            end = plaintext_to_tex_offset_map[plaintext_end]
            length_so_far_in_plain_text = plaintext_end
            tex_sub = tex[start:end]
            context_tex = tex[ max(start - DEFAULT_CONTEXT_SIZE, 0) : end + DEFAULT_CONTEXT_SIZE]

            # extract richer context of tex using '\n\n'
            extended_tex_sub = extract_richer_tex(context_tex, tex_sub)

            # detect tex units (e.g., section, figure) using pre-defined regex
            tex_unit_dict = {}
            if extended_tex_sub is not None:
                tex_unit_dict["section"] = regex.findall(
                    PATTERN_SECTION, extended_tex_sub
                )
                tex_unit_dict["label"] = regex.findall(PATTERN_LABEL, extended_tex_sub)
                tex_unit_dict["abstract_begin"] = regex.findall(
                    PATTERN_ABSTRACT_BEGIN, extended_tex_sub
                )
                tex_unit_dict["abstract_end"] = regex.findall(
                    PATTERN_ABSTRACT_END, extended_tex_sub
                )
                tex_unit_dict["table_begin"] = regex.findall(
                    PATTERN_TABLE_BEGIN, extended_tex_sub
                )
                tex_unit_dict["table_end"] = regex.findall(
                    PATTERN_TABLE_END, extended_tex_sub
                )
                tex_unit_dict["figure_begin"] = regex.findall(
                    PATTERN_FIGURE_BEGIN, extended_tex_sub
                )
                tex_unit_dict["figure_end"] = regex.findall(
                    PATTERN_FIGURE_END, extended_tex_sub
                )
                tex_unit_dict["itemize_begin"] = regex.findall(
                    PATTERN_ITEMIZE_BEGIN, extended_tex_sub
                )
                tex_unit_dict["itemize_end"] = regex.findall(
                    PATTERN_ITEMIZE_END, extended_tex_sub
                )
                # tex_unit_dict["iffalse_begin"] = regex.findall(
                #    PATTERN_IFFALSE_BEGIN, extended_tex_sub
                # )
                # tex_unit_dict["iffalse_end"] = regex.findall(
                #    PATTERN_IFFALSE_END, extended_tex_sub
                # )
                tex_unit_dict["ref"] = regex.findall(PATTERN_REF, extended_tex_sub)
                tex_unit_dict["cite"] = regex.findall(PATTERN_CITE, extended_tex_sub)
                tex_unit_dict["symbol"] = regex.findall(
                    PATTERN_SYMBOL, extended_tex_sub, overlapped=False
                )
                tex_unit_dict["url"] = regex.findall(
                    PATTERN_URL, extended_tex_sub, overlapped=False
                )
                tex_unit_dict["any"] = regex.findall(PATTERN_ANY, extended_tex_sub)

                # store 'others' field by [any] - [section,label,...]
                if len(tex_unit_dict["any"]) > 0:
                    tex_unit_values_flattened = [
                        fone
                        for f in tex_unit_dict.keys()
                        if f != "any"
                        for fone in tex_unit_dict[f]
                    ]
                    others = []
                    for any_field in tex_unit_dict["any"]:
                        if any_field not in tex_unit_values_flattened:
                            others.append(any_field)
                    tex_unit_dict["others"] = others
                tex_unit_dict.pop("any", None)

                # store section information
                if len(tex_unit_dict["abstract_begin"]) > 0:
                    current_section = "ABSTRACT"
                if len(tex_unit_dict["abstract_end"]) > 0:
                    current_section = None
                # if len(tex_unit_dict["iffalse_end"]) > 0:
                #    is_iffalse = False
                # if len(tex_unit_dict["iffalse_begin"]) > 0:
                #     is_iffalse = True

                if len(tex_unit_dict["section"]) > 0:
                    section = tex_unit_dict["section"][0]
                    current_section = extract_text_from_tex_group(section)

                # store figure/table information
                # TODO @dykang add \label{} in table/figure for better matching
                if len(tex_unit_dict["figure_begin"]) > 0:
                    is_sentence_in_figure = True
                if len(tex_unit_dict["figure_end"]) > 0:
                    is_sentence_in_figure = False
                if len(tex_unit_dict["table_begin"]) > 0:
                    is_sentence_in_table = True
                if len(tex_unit_dict["table_end"]) > 0:
                    is_sentence_in_table = False
                if len(tex_unit_dict["itemize_begin"]) > 0:
                    is_sentence_in_itemize = True
                if len(tex_unit_dict["itemize_end"]) > 0:
                    is_sentence_in_itemize = False

            # decide whether current line is in section/figure/table
            if current_section:
                tex_unit_dict["current_section"] = current_section
            # #if is_iffalse:
            # tex_unit_dict["is_iffalse"] = is_iffalse
            if is_sentence_in_figure:
                tex_unit_dict["is_sentence_in_figure"] = is_sentence_in_figure
            if is_sentence_in_table:
                tex_unit_dict["is_sentence_in_table"] = is_sentence_in_table
            if is_sentence_in_itemize:
                tex_unit_dict["is_sentence_in_itemize"] = is_sentence_in_itemize

            # detect whether current line is sentence or not
            is_sentence = check_sentence_or_not(tex_sub, tex_unit_dict)

            # clean sentence
            cleaned_sentence = sentence if is_sentence else ""
            maths = []
            if is_sentence:
                if "math" in sentence:
                    maths = regex.findall(
                        PATTERN_MATH, sentence, overlapped=False
                    )

                # substitute entities detected with placeholders
                replace_patterns = []

                # patterns for symbols
                # TODO @dykang replace [[math]] with SYMBOL in PlaintextExtractor
                for math in maths:
                    replace_patterns.append((math, "SYMBOL"))

                # patterns for citations
                for citation in tex_unit_dict["cite"]:
                    citation_text = extract_text_from_tex_group(citation)
                    for cite in citation_text.split(","):
                        replace_patterns.append((cite, "CITATION"))

                # patterns for urls
                for url in tex_unit_dict["url"]:
                    url_text = extract_text_from_tex_group(url)
                    replace_patterns.append((url_text, "URL"))


                # replace_patterns from space tokenizer. Current version relies on patterns like \ref{{fig,tab,sec,eq}:XXX} in distinguishing reference types. Also, I keep the token ahead of the reference, although they somewhat duplicate (e.g., Table \reftab:xxx} -> Table TABLE)
                for reference in tex_unit_dict["ref"]:
                    reference_text = extract_text_from_tex_group(reference)
                    for reference in reference_text.split(","):
                        if reference.lower().startswith("tab"):
                            replace_patterns.append((reference, "TABLE"))
                        if reference.lower().startswith("fig"):
                            replace_patterns.append((reference, "FIGURE"))
                        if reference.lower().startswith("sec"):
                            replace_patterns.append((reference, "SECTION"))
                        if reference.lower().startswith("eq"):
                            replace_patterns.append((reference, "EQUATION"))

                # substtitue with detected patterns
                for substitution in replace_patterns:
                    cleaned_sentence = cleaned_sentence.replace(
                        substitution[0], substitution[1]
                    )


            yield Sentence(
                text=sentence,
                cleaned_text = cleaned_sentence,
                start=start,
                end=end,
                id_=str(i),
                tex_path=tex_path,
                tex=tex_sub,
                context_tex=context_tex,
                extended_tex=extended_tex_sub,
                is_sentence=True if is_sentence else False,
                current_section=tex_unit_dict.get("current_section", ""),
                # is_iffalse=tex_unit_dict.get("is_iffalse", False),
                is_sentence_in_figure=tex_unit_dict.get("is_sentence_in_figure", False),
                is_sentence_in_table=tex_unit_dict.get("is_sentence_in_table", False),
                is_sentence_in_itemize=tex_unit_dict.get(
                    "is_sentence_in_itemize", False
                ),
                label=tex_unit_dict.get("label", []),
                ref=tex_unit_dict.get("ref", []),
                cite=tex_unit_dict.get("cite", []),
                symbol=maths,
                url=tex_unit_dict.get("url", []),
                others=tex_unit_dict.get("others", []),
            )
