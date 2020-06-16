import logging
from typing import Iterator, List

import pysbd

from common.parse_tex import DEFAULT_CONTEXT_SIZE, EntityExtractor, PlaintextExtractor

from .types import Abbreviation

import spacy
from scispacy.abbreviation import AbbreviationDetector
import re
import sys
from TexSoup import *


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

symbols = ["%", "^", "{", "}", "[", "]", "\\", "=", "#", "&", "~", "$", "|", "_", ":", ";"]

#AbbreviationExtractor.parse("", "Natural Langauge Processing (NLP) is a sub-field of artificial intelligence (AI).")

class AbbreviationExtractor(EntityExtractor):
    """
    Extract plaintext sentences from TeX, with offsets of the characters they correspond to in
    the input TeX strings. The extracted sentences might include some junk TeX, having the same
    limitations as the plaintext produced by PlaintextExtractor.
    """

    def parse(self, tex_path: str, tex: str) -> Iterator[Abbreviation]:
        for reserved_char in PYSBD_RESERVED_CHARACTERS:
            if reserved_char in tex:
                logging.warning(
                    'Reserved character from pysbd "%s" found in tex string, this might break the sentence extractor.',
                    reserved_char,
                )

        # Extract plaintext segments from TeX
        #plaintext_extractor = PlaintextExtractor()

        #this is the most basic model and had no real performance difference on our inputs
        #other options include NER models and models with pretrained word vectors
        nlp = spacy.load("en_core_sci_sm")
        abbreviation_pipe = AbbreviationDetector(nlp)
        nlp.add_pipe(abbreviation_pipe)

        cons = tex
        soup = TexSoup(cons)
        soup_text = []
        self.get_text(soup, soup_text)
        contents = ""
        for p, l in soup_text:
            contents += p

        contents = re.sub("\n", " ", contents)
        abb_short_forms = {}
        doc = nlp(contents)
        for abrv in doc._.abbreviations:
            count = 0
            for s in symbols:
                count += str(abrv).count(s)
            if count == 0:
                abb_short_forms[str(abrv)] = [[m.start(), m.start() + len(str(abrv))] for m in re.finditer(str(abrv), cons)]

        count = 0
        for abb in abb_short_forms:
            for location in abb_short_forms[abb]:
                start, end = location
                tex_sub = cons[start:end]
                context_tex = cons[start - DEFAULT_CONTEXT_SIZE : end + DEFAULT_CONTEXT_SIZE]
                yield Abbreviation(
                    text= abb,
                    start=start,
                    end=end,
                    id_= count,
                    tex_path=tex_path,
                    tex=tex_sub,
                    context_tex=context_tex,
                )
                count += 1

    def get_text(self, soup, soup_text):
        for descendant in soup.contents:
            if isinstance(descendant, TokenWithPosition):
                soup_text.append([descendant, descendant.position])
            elif hasattr(descendant, 'text'):
                self.get_text(descendant, soup_text)
