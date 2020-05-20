import json
import string
from typing import Iterator

from common.parse_tex import DEFAULT_CONTEXT_SIZE, EntityExtractor, PlaintextExtractor

from .types import GlossaryTerm, Term


def get_shingle(text: str, size: int) -> Iterator[str]:
    split_text = text.split()
    for i in range(0, len(split_text) - size + 1):
        yield " ".join(split_text[i : i + size])


MAX_TERM_LEN = 3
MAX_TERMS_PER_TEX = None


class TermExtractor(EntityExtractor):
    """
    Extract terms from TeX.
    """

    def __init__(self) -> None:
        # TODO(Raymond): Figure out how to make this path to the glossary file relative.
        with open(
            "/Users/raymondfok/research/s2reader/scholar-reader/data-processing/entities/terms/google_ml_glossary.json",
            "r",
        ) as f:
            self.google_glossary_json = json.load(f)

        self.google_glossary = {}
        for term, definition in self.google_glossary_json.items():
            self.google_glossary[term] = GlossaryTerm(name=term, definition=definition)

    def parse(self, tex_path: str, tex: str) -> Iterator[Term]:
        plaintext_extractor = PlaintextExtractor()
        plaintext_segments = plaintext_extractor.parse(tex_path, tex)

        term_count = 0
        for text_segment in plaintext_segments:
            text_segment_string = text_segment.text.lower().strip()
            if not text_segment_string:
                continue

            shingles = []
            for size in range(1, MAX_TERM_LEN + 1):
                for shingle in get_shingle(text_segment_string, size):
                    shingles.append(shingle)

            for cand in shingles:
                cand_punc_removed = cand.translate(
                    str.maketrans("", "", string.punctuation)
                )
                if cand_punc_removed in self.google_glossary:
                    definition = str(self.google_glossary[cand_punc_removed].definition)
                    start_in_segment = text_segment_string.find(cand)
                    end_in_segment = start_in_segment + len(cand)

                    start = text_segment.tex_start + start_in_segment
                    end = text_segment.tex_start + end_in_segment

                    if MAX_TERMS_PER_TEX and term_count >= MAX_TERMS_PER_TEX:
                        return
                    term = Term(
                        name=cand_punc_removed,
                        definition=definition,
                        id_=str(term_count),
                        start=start,
                        end=end,
                        tex_path=tex_path,
                        tex=tex,
                        context_tex=tex[
                            start - DEFAULT_CONTEXT_SIZE : end + DEFAULT_CONTEXT_SIZE
                        ],
                    )
                    term_count += 1
                    yield term
