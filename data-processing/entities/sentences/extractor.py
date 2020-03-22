from dataclasses import dataclass
from typing import Iterator

import pysbd

from common.parse_tex import DEFAULT_CONTEXT_SIZE, EntityExtractor, PlaintextExtractor
from common.types import SerializableEntity


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
            # Since the sentence extractor has several bugs related to finding start and end indicies
            # we will simply set them ourselves.
            real_start = plaintext.find(sentence.sent, length_so_far_in_plain_text)
            start = plaintext_to_tex_offset_map[real_start]
            real_end = real_start + (sentence.end - sentence.start)
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
