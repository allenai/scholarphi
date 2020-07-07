import logging
from typing import Iterator, List

import pysbd

from common.parse_tex import DEFAULT_CONTEXT_SIZE, EntityExtractor, reserved_char_check, plaintext_and_offset

from .types import Abbreviation

import spacy
from scispacy.abbreviation import AbbreviationDetector
import re
import sys

NON_ACRONYM_CHARACTERS = ["%", "^", "{", "}", "[", "]", "\\", "=", "#", "&", "~", "$", "|", "_", ":", ";"]

class AbbreviationExtractor(EntityExtractor):
    """
    Extract plaintext sentences from TeX, with offsets of the characters they correspond to in
    the input TeX strings. The extracted sentences might include some junk TeX, having the same
    limitations as the plaintext produced by PlaintextExtractor.
    """

    def parse(self, tex_path: str, tex: str) -> Iterator[Abbreviation]:
        reserved_char_check(tex)
        plaintext, plaintext_to_tex_offset_map = plaintext_and_offset(tex_path, tex)

        # This is the most basic model and had no real performance difference on our inputs,
        # other options include NER models and models with pretrained word vectors.
        nlp = spacy.load("en_core_sci_sm")
        abbreviation_pipe = AbbreviationDetector(nlp)
        nlp.add_pipe(abbreviation_pipe)

        # These dictionaries hold abbreviated forms, their expansions, and the location of the expansions.
        # All of them use the abbreviated form as keys.
        abb_short_forms = {}
        abb_expansions = {}
        expanded_locations = {}
        doc = nlp(plaintext)

        # This extracts the abbreviations from the scispacy model.
        for abrv in doc._.abbreviations:
            count = 0
            for s in NON_ACRONYM_CHARACTERS:
                 count += str(abrv).count(s)
            # count makes sure that we don't accidentally include symbols or variables.
            if count == 0:
                abb_short_forms[str(abrv)] = [[plaintext_to_tex_offset_map[m.start()], plaintext_to_tex_offset_map[m.start() + len(str(abrv))]] for m in re.finditer(str(abrv), plaintext)]
                abb_expansions[str(abrv)] = str(abrv._.long_form)
                x = plaintext.find(str(abrv._.long_form))
                expanded_locations[str(abrv)] = [plaintext_to_tex_offset_map[x], plaintext_to_tex_offset_map[x + len(str(abrv._.long_form))]]

        # If you want to use another abbreviation detection method in addition to scispacy
        # you may implement it here and add its results to the three dictionaries.

        count = 0
        full_count = 1
        # Yields abbreviated forms and their expansions.
        for abb in abb_short_forms:
            exp_start, exp_end = expanded_locations[abb]
            expanded = abb_expansions[abb]
            tex_sub = tex[exp_start:exp_end]
            context_tex = tex[exp_start - DEFAULT_CONTEXT_SIZE : exp_end + DEFAULT_CONTEXT_SIZE]

            # Yields the expanded form as an Abbreviation type
            yield Abbreviation(
                text=abb,
                start=exp_start,
                end=exp_end,
                expansion=expanded,
                id_=count,
                tex_path=tex_path,
                tex=tex_sub,
                context_tex=context_tex,
                str_id="f" + str(full_count) + "-0"
            )
            count += 1
            short_count = 0

            # Yields the abbreviated forms as Abbreviation types.
            for location in abb_short_forms[abb]:
                short_count += 1
                start, end = location
                tex_sub = tex[start:end]
                context_tex = tex[start - DEFAULT_CONTEXT_SIZE : end + DEFAULT_CONTEXT_SIZE]
                yield Abbreviation(
                    text=abb,
                    start=start,
                    end=end,
                    expansion=expanded,
                    id_=count,
                    tex_path=tex_path,
                    tex=tex_sub,
                    context_tex=context_tex,
                    str_id="s" + str(full_count) + "-" + str(short_count)
                )
                count += 1

            full_count += 1
