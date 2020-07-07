import json
import os
import string
from collections import defaultdict
from typing import Iterator

from common.parse_tex import DEFAULT_CONTEXT_SIZE, EntityExtractor, PlaintextExtractor

from .types import GlossaryTerm, Term

MAX_TERM_LEN = 3
MAX_TERMS_PER_TEX = None
DIR_PATH = os.path.dirname(__file__)


class TermExtractor(EntityExtractor):
    """
    Extract terms from TeX.
    """

    def __init__(self) -> None:
        self.glossary = defaultdict(list)
        with open(os.path.join(DIR_PATH, "google_ml-glossary.json"), "r") as f:
            google_ml_glossary = json.load(f)

        glossaries = [google_ml_glossary]
        for glossary in glossaries:
            for gloss in glossary:
                self.glossary[gloss["name"]].append(
                    GlossaryTerm(
                        name=gloss["name"],
                        definition=gloss["definition"],
                        source=gloss["source"],
                    )
                )

    @staticmethod
    def get_shingle(text: str, size: int) -> Iterator[str]:
        split_text = text.split()
        for i in range(0, len(split_text) - size + 1):
            yield " ".join(split_text[i : i + size])

    def parse(self, tex_path: str, tex: str) -> Iterator[Term]:
        plaintext_extractor = PlaintextExtractor()
        plaintext_segments = plaintext_extractor.parse(tex_path, tex)

        term_count = 0
        for text_segment in plaintext_segments:
            text_segment_string = text_segment.text.strip()
            if not text_segment_string:
                continue

            for size in range(1, MAX_TERM_LEN + 1):
                for shingle in TermExtractor.get_shingle(text_segment_string, size):
                    cands = []
                    cands.append(shingle)
                    cands.append(shingle.strip(string.punctuation))
                    for cand in list(cands):
                        cands.append(cand.lower())
                    for cand in list(cands):
                        if cand.endswith("s"):
                            cands.append(cand[:-1])
                    final_cands = set(cands)
                    for cand in final_cands:
                        if cand in self.glossary:
                            definition = str(self.glossary[cand][0].definition)
                            start_in_segment = text_segment.text.find(shingle)
                            end_in_segment = start_in_segment + len(shingle)
                            start = text_segment.tex_start + start_in_segment
                            end = text_segment.tex_start + end_in_segment

                            term = Term(
                                name=cand,
                                definition=definition,
                                id_=str(term_count),
                                start=start,
                                end=end,
                                tex_path=tex_path,
                                tex=text_segment,
                                context_tex=tex[
                                    start
                                    - DEFAULT_CONTEXT_SIZE : end
                                    + DEFAULT_CONTEXT_SIZE
                                ],
                            )
                            term_count += 1
                            yield term
                            if MAX_TERMS_PER_TEX and term_count >= MAX_TERMS_PER_TEX:
                                return
                            break
