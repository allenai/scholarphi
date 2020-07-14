import logging
from typing import Iterator, List

import pysbd

from common.parse_tex import DEFAULT_CONTEXT_SIZE, EntityExtractor, check_for_reserved_characters, plaintext_and_offset

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


class SentenceExtractor(EntityExtractor):
    """
    Extract plaintext sentences from TeX, with offsets of the characters they correspond to in
    the input TeX strings. The extracted sentences might include some junk TeX, having the same
    limitations as the plaintext produced by PlaintextExtractor.
    """

    def parse(self, tex_path: str, tex: str) -> Iterator[Sentence]:
        check_for_reserved_characters(tex)
        plaintext, plaintext_to_tex_offset_map = plaintext_and_offset(tex_path, tex)

        # Segment the plaintext. Return offsets for each setence relative to the TeX input
        segmenter = pysbd.Segmenter(language="en", clean=False)
        # Record the current length of the plain text so account for the extractor bug
        length_so_far_in_plain_text = 0
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
            yield Sentence(
                text=sentence,
                start=start,
                end=end,
                id_=str(i),
                tex_path=tex_path,
                tex=tex_sub,
                context_tex=context_tex,
            )
