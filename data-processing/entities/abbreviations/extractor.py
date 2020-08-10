import re
from typing import Iterator

import spacy
from scispacy.abbreviation import AbbreviationDetector

from common.parse_tex import (
    DEFAULT_CONTEXT_SIZE,
    EntityExtractor,
    check_for_reserved_characters,
    plaintext_and_offset,
)

from .types import Abbreviation

NON_ACRONYM_CHARACTERS = [
    "%",
    "^",
    "{",
    "}",
    "[",
    "]",
    "\\",
    "=",
    "#",
    "&",
    "~",
    "$",
    "|",
    "_",
    ":",
    ";",
]


class AbbreviationExtractor(EntityExtractor):
    """
    Extracts the plaintext from TeX with the PlaintextExtractor then passes this through the scispacy
    abbreviation detection and expansion pipeline. Parse yields all the abbreviations and their corresponding
    expansions in the text.
    """

    def __init__(self) -> None:
        # This is the most basic model and had no real performance difference on our inputs,
        # other options include NER models and models with pretrained word vectors.
        self.nlp = spacy.load("en_core_sci_sm")

        abbreviation_pipe = AbbreviationDetector(self.nlp)
        self.nlp.add_pipe(abbreviation_pipe)

    def parse(self, tex_path: str, tex: str) -> Iterator[Abbreviation]:
        check_for_reserved_characters(tex)
        plaintext, plaintext_to_tex_offset_map = plaintext_and_offset(tex_path, tex)

        # These dictionaries hold abbreviated forms, their expansions, and the location of the expansions.
        # All of them use the abbreviated form as keys.
        abb_short_forms = {}
        abb_expansions = {}
        expanded_locations = {}
        doc = self.nlp(plaintext)

        # This extracts the abbreviations from the scispacy model.
        for abrv in doc._.abbreviations:
            count = 0
            for s in NON_ACRONYM_CHARACTERS:
                count += str(abrv).count(s)
            # count makes sure that we don't accidentally include symbols or variables.
            if count == 0:
                abb_short_forms[str(abrv)] = [
                    [
                        plaintext_to_tex_offset_map[m.start()],
                        plaintext_to_tex_offset_map[m.start() + len(str(abrv))],
                    ]
                    for m in re.finditer(str(abrv), plaintext)
                ]
                abb_expansions[str(abrv)] = str(abrv._.long_form)
                x = plaintext.find(str(abrv._.long_form))
                expanded_locations[str(abrv)] = [
                    plaintext_to_tex_offset_map[x],
                    plaintext_to_tex_offset_map[x + len(str(abrv._.long_form))],
                ]

        # If you want to use another abbreviation detection method in addition to scispacy
        # you may implement it here and add its results to the three dictionaries.

        # Yields abbreviated forms and their expansions.
        for exp_index, abb in enumerate(abb_short_forms):
            exp_start, exp_end = expanded_locations[abb]
            expanded = abb_expansions[abb]
            tex_sub = tex[exp_start:exp_end]
            context_tex = tex[
                exp_start - DEFAULT_CONTEXT_SIZE : exp_end + DEFAULT_CONTEXT_SIZE
            ]

            # Yields the expanded form as an Abbreviation type
            yield Abbreviation(
                id_=f"expansion-{exp_index}",
                text=abb,
                start=exp_start,
                end=exp_end,
                expansion=expanded,
                tex_path=tex_path,
                tex=tex_sub,
                context_tex=context_tex,
            )

            # Yields the abbreviated forms as Abbreviation types.
            for abb_index, location in enumerate(abb_short_forms[abb]):
                start, end = location
                tex_sub = tex[start:end]
                context_tex = tex[
                    start - DEFAULT_CONTEXT_SIZE : end + DEFAULT_CONTEXT_SIZE
                ]
                yield Abbreviation(
                    id_=f"abbreviation-{exp_index}-{abb_index}",
                    text=abb,
                    start=start,
                    end=end,
                    expansion=expanded,
                    tex_path=tex_path,
                    tex=tex_sub,
                    context_tex=context_tex,
                )
