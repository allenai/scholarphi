import logging
from dataclasses import dataclass
from typing import Iterator, List

import pysbd

from common.parse_tex import DEFAULT_CONTEXT_SIZE, EntityExtractor, PlaintextExtractor
from common.types import SerializableEntity
# These are 'reserved characters' by the pysbd module and can potentially
# cause issues if they are present in a string. This list was compiled from the
# psybd source code as of 3/23/20
PYSBD_RESERVED_CHARACTERS: List[str] = ["∯", "ȸ", "♨", "☝", "✂", "⎋", "ᓰ", "ᓱ", "ᓳ", "ᓴ", "ᓷ", "ᓸ"]

@dataclass(frozen=True)
class Sentence(SerializableEntity):
    text: str


class SentenceExtractor(EntityExtractor):
    """
    Extract plaintext sentences from TeX, with offsets of the characters they correspond to in
    the input TeX strings. The extracted sentences might include some junk TeX, having the same
    limitations as the plaintext produced by PlaintextExtractor.
    """

    def parse(self, tex_path: str, tex: str) -> Iterator[Sentence]:
        for reserved_char in PSYDB_RESERVED_CHARACTERS:
            if reserved_char in tex:
                logging.warning('Reserved character from pysbd "%s" found in tex string, this might break the sentence extractor.', reserved_char)

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
        segmenter = pysbd.Segmenter(language="en", clean=False, char_span=True)
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
            #    ex: see PSYDB_RESERVED_CHARACTERS list.
            #    sol: throw a warning if the sentence contains any of these characters.
            if len(sentence.sent) > 1000:
                logging.warning('Exceptionally long sentence (length %d), this might indicate the sentence extractor failed to properly split text into sentences.', len(sentence.sent))

            real_start = plaintext.find(sentence.sent, length_so_far_in_plain_text)
            real_end = real_start + len(sentence.sent)
            if real_start not in plaintext_to_tex_offset_map or real_end not in plaintext_to_tex_offset_map:
                logging.warning('A sentence boundary was incorrect for sentence %s. This is probably an issue with pysbd. Skipping sentence in extractor.', sentences.sent)
                continue

            start = plaintext_to_tex_offset_map[real_start]
            end = plaintext_to_tex_offset_map[real_end]
            length_so_far_in_plain_text = real_end
            tex_sub = tex[start:end]
            context_tex = tex[start - DEFAULT_CONTEXT_SIZE : end + DEFAULT_CONTEXT_SIZE]
            yield Sentence(
                text=sentence.sent,
                start=start,
                end=end,
                id_=str(i),
                tex_path=tex_path,
                tex=tex_sub,
                context_tex=context_tex,
            )
