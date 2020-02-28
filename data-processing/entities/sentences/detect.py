from dataclasses import dataclass
from typing import Iterator

import pysbd

from common.parse_tex import EntityExtractor, PlaintextExtractor
from common.types import Entity


@dataclass(frozen=True)
class Sentence(Entity):
    text: str


class SentenceExtractor(EntityExtractor):
    """
    Extract plaintext sentences from TeX, with offsets of the characters they correspond to in
    the input TeX strings. The extracted sentences might include some junk TeX, having the same
    limitations as the plaintext produced by PlaintextExtractor.
    """

    def parse(self, tex: str) -> Iterator[Sentence]:
        # Extract plaintext segments from TeX
        plaintext_extractor = PlaintextExtractor()
        plaintext_segments = plaintext_extractor.parse(tex)

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
        for sentence in segmenter.segment(plaintext):
            yield Sentence(
                text=sentence.sent,
                start=plaintext_to_tex_offset_map[sentence.start],
                end=plaintext_to_tex_offset_map[sentence.end],
            )
