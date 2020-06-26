import logging
import re, regex
from typing import Iterator, List
import numpy as np
from nltk import word_tokenize


import pysbd

from common.parse_tex import DEFAULT_CONTEXT_SIZE, EntityExtractor, PlaintextExtractor

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
PATTERN_REF = r"\\ref\{[A-Za-z0-9 \\_.,:-]*\}"
#TODO @dykang Fix to capture citations patterns like \cite[GRUs;][]{cho2004}
PATTERN_CITE = r"\\cite[A-Za-z0-9 \\_.,:-]*\{[A-Za-z0-9 \\_.,:-]*\}"
PATTERN_SYMBOL = r"\$[A-Za-z0-9\\ \{\}\(\)\[\]^&*_.,\+:\;-\=#]*\$"
PATTERN_ANY = r"\\[A-Za-z0-9\\_.,:-]*[\{[A-Za-z0-9 \\_.,:-]*\}]*"

# objects for detecting nesting structures from the extended tex
NESTING_CHARACTERS_MAPPING = {'{':'}', '(':')', '[':']'}


def check_nesting_structure(nesting_chars):
    stack = []
    for nchar in nesting_chars:
        if nchar in ['{','(', '[']:
            stack.append(nchar)
        elif nchar in ['}',')',']']:
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


def check_sentence_or_not(tex, entity_dict):
    if tex is None:
        return False

    # check whether text in section or not
    if 'current_section' not in entity_dict or not entity_dict['current_section']:
        return False
    # check whether text is caption in figure/table or not. currently, we remove all text including captions in figure/table
    # TODO @dykang later, distinguish lines in table and lines in captions
    if 'current_figure' in entity_dict and entity_dict['current_figure']:
        return False
    if 'current_table' in entity_dict and entity_dict['current_table']:
        return False

    # check nesting structures from tex_sub
    nesting_characters_in_tex = []
    for c in tex:
        if c in list(NESTING_CHARACTERS_MAPPING.keys()) + list(NESTING_CHARACTERS_MAPPING.values()):
            nesting_characters_in_tex.append(c)
    if not nesting_characters_in_tex:
        return True
    return check_nesting_structure(nesting_characters_in_tex)



def extract_richer_tex(context_tex, tex):
    """
    if surrounding tex includes multiple matched tex cases, we regard the most right-handed one is the final one. This is not a perfect heuristic though for some cases including next line inside the content
    """
    if context_tex is '':
        return None
    surrounding_tex = context_tex.split(tex)
    if len(surrounding_tex) > 2:
        surrounding_tex = [tex.join(surrounding_tex[:-1]), surrounding_tex[-1]]
    before_tex, after_tex = surrounding_tex
    richer_tex = before_tex.split('\n')[-1] + tex + after_tex.split('\n')[0]
    return richer_tex


def extract_text_from_tex_entity(entity):
    return entity[entity.find("{")+1:entity.find("}")]



class SentenceExtractor(EntityExtractor):
    """
    Extract plaintext sentences from TeX, with offsets of the characters they correspond to in
    the input TeX strings. The extracted sentences might include some junk TeX, having the same
    limitations as the plaintext produced by PlaintextExtractor.
    """

    def parse(self, tex_path: str, tex: str) -> Iterator[Sentence]:
        for reserved_char in PYSBD_RESERVED_CHARACTERS:
            if reserved_char in tex:
                logging.warning(
                    'Reserved character from pysbd "%s" found in tex string, this might break the sentence extractor.',
                    reserved_char,
                )

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
            for i in range(len(segment.text)):
                tex_offset = (
                    (segment.tex_start + i)
                    if not segment.transformed
                    else segment.tex_start
                )
                plaintext_to_tex_offset_map[len(plaintext) + i] = tex_offset

            # While building the map, also create a contiguous plaintext string
            plaintext += segment.text
            last_segment = segment

        if last_segment is not None:
            plaintext_to_tex_offset_map[len(plaintext)] = last_segment.tex_end
        # Segment the plaintext. Return offsets for each setence relative to the TeX input
        segmenter = pysbd.Segmenter(language="en", clean=False)
        # Record the current length of the plain text so account for the extractor bug
        length_so_far_in_plain_text = 0


        current_section, current_table, current_figure = False, False, False
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
            context_tex = tex[start - DEFAULT_CONTEXT_SIZE : end + DEFAULT_CONTEXT_SIZE]

            # extract richer context of tex using '\n'
            extended_tex_sub = extract_richer_tex(context_tex, tex_sub)

            # detect entity fields using pre-defined regex
            entity_dict = {}
            if extended_tex_sub is not None:
                entity_dict['section'] = re.findall(PATTERN_SECTION, extended_tex_sub)
                entity_dict['label'] = re.findall(PATTERN_LABEL, extended_tex_sub)
                entity_dict['abstract_begin'] = re.findall(PATTERN_ABSTRACT_BEGIN, extended_tex_sub)
                entity_dict['abstract_end'] = re.findall(PATTERN_ABSTRACT_END, extended_tex_sub)
                entity_dict['table_begin'] = re.findall(PATTERN_TABLE_BEGIN, extended_tex_sub)
                entity_dict['table_end'] = re.findall(PATTERN_TABLE_END, extended_tex_sub)
                entity_dict['figure_begin'] = re.findall(PATTERN_FIGURE_BEGIN, extended_tex_sub)
                entity_dict['figure_end'] = re.findall(PATTERN_FIGURE_END, extended_tex_sub)
                entity_dict['ref'] = re.findall(PATTERN_REF, extended_tex_sub)
                entity_dict['cite'] = re.findall(PATTERN_CITE, extended_tex_sub)
                entity_dict['symbol'] = regex.findall(PATTERN_SYMBOL, extended_tex_sub, overlapped=False)
                entity_dict['any'] = re.findall(PATTERN_ANY, extended_tex_sub)

                # store 'others' field by [any] - [section,label,...]
                if len(entity_dict['any']) > 0:
                    entity_values_flattend = [fone for f in entity_dict.keys() if f != 'any' for fone in entity_dict[f]]
                    others = []
                    for any_field in entity_dict['any']:
                        if any_field not in entity_values_flattend:
                            others.append(any_field)
                    entity_dict['others'] = others
                entity_dict.pop('any', None)

                # store section information
                if len(entity_dict['abstract_begin']) > 0 :
                    current_section = 'ABSTRACT'
                if len(entity_dict['abstract_end']) > 0 :
                    current_section = False
                if len(entity_dict['section']) > 0 :
                    section = entity_dict['section'][0]
                    current_section = extract_text_from_tex_entity(section)



                # store figure/table information
                #TODO @dykang add \label{} in table/figure for better matching
                if len(entity_dict['figure_begin']) > 0 :
                    current_figure = True
                if len(entity_dict['figure_end']) > 0 :
                    current_figure = False
                if len(entity_dict['table_begin']) > 0 :
                    current_table = True
                if len(entity_dict['table_end']) > 0 :
                    current_table = False

            # decide whether current line is in section/figure/table
            if current_section:
                entity_dict['current_section'] = current_section
            if current_figure:
                entity_dict['current_figure'] = current_figure
            if current_table:
                entity_dict['current_table'] = current_table

            # detect whether current line is sentence or not
            is_sentence = check_sentence_or_not(tex_sub, entity_dict)

            # clean sentence
            cleaned_sentence = "{}".format(sentence) if is_sentence else ""
            if is_sentence:
                # substitute entities detected with placeholders
                replace_patterns = []

                # patterns for symbols
                #TODO @dykang replace [[math]] with SYMBOL in PlaintextExtractor
                replace_patterns.append(('[[math]]', 'SYMBOL'))

                # patterns for citations
                for citation in entity_dict['cite']:
                    citation_text = extract_text_from_tex_entity(citation)
                    for cite in citation_text.split(","):
                        replace_patterns.append((cite, "CITATION"))

                # replace_patterns from space tokenizer. Current version relies on patterns like \ref{{fig,tab,sec,eq}:XXX} in distinguishing reference types. Also, I keep the token ahead of the reference, although they somewhat duplicate (e.g., Table \reftab:xxx} -> Table TABLE)
                for reference in entity_dict['ref']:
                    reference_text = extract_text_from_tex_entity(reference)
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
                    cleaned_sentence = cleaned_sentence.replace(substitution[0], substitution[1])

            yield Sentence(
                text=sentence,
                start=start,
                end=end,
                id_=str(i),
                tex_path=tex_path,
                tex=tex_sub,
                context_tex=context_tex,
                cleaned_text=cleaned_sentence,
                is_sentence=is_sentence,
                current_section=entity_dict.get('current_section',False),
                current_figure=entity_dict.get('current_figure',False),
                current_table=entity_dict.get('current_table',False),
                label=entity_dict.get('label',None),
                ref=entity_dict.get('ref',None),
                cite=entity_dict.get('cite',None),
                symbol=entity_dict.get('symbol',None),
                others=entity_dict.get('others',None),
            )
