import json
import os
from collections import defaultdict
from dataclasses import dataclass
from typing import Dict, Iterator, List

from common.parse_tex import EntityExtractor, PhraseExtractor
from common.types import Term

DIR_PATH = os.path.dirname(__file__)


@dataclass(frozen=True)
class GlossaryEntry:
    name: str
    definition: str
    source: str


class GlossaryTermExtractor(EntityExtractor):
    """
    Finds terms in TeX that are defined in a set of provided glossaries.
    """

    def __init__(self) -> None:
        self.glossary: Dict[str, List[GlossaryEntry]] = defaultdict(list)
        with open(os.path.join(DIR_PATH, "google_ml-glossary.json"), "r") as f:
            google_ml_glossary = json.load(f)

        glossaries = [google_ml_glossary]
        for glossary in glossaries:
            for gloss in glossary:
                self.glossary[gloss["name"]].append(
                    GlossaryEntry(
                        name=gloss["name"],
                        definition=gloss["definition"],
                        source=gloss["source"],
                    )
                )

    def parse(self, tex_path: str, tex: str) -> Iterator[Term]:
        phrase_extractor = PhraseExtractor(list(self.glossary.keys()))
        for i, phrase in enumerate(phrase_extractor.parse(tex_path, tex)):
            entries = self.glossary[phrase.text]
            definitions = [e.definition for e in entries]
            sources = [e.source for e in entries]
            yield Term(
                id_=f"glossary-term-{i}",
                start=phrase.start,
                end=phrase.end,
                tex=phrase.tex,
                text=phrase.text,
                type_=None,
                tex_path=tex_path,
                context_tex=phrase.context_tex,
                definitions=definitions,
                sources=sources,
                sentence_id=None,
            )
