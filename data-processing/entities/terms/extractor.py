from dataclasses import dataclass
from typing import Iterator

import pandas as pd
import re
import json

import pysbd

from common.parse_tex import DEFAULT_CONTEXT_SIZE, EntityExtractor, PlaintextExtractor
from common.types import SerializableEntity

# Extracting all the terms from glossary csv
glossary = pd.read_csv("gloss.csv")
terms = glossary["terms"].tolist()

# Converting terms to lower case
terms = [item.lower() for item in terms]


# Edit location #1: Define a Term entity; the below code is probably okay.
@dataclass(frozen=True)
class Term(SerializableEntity):
    name: str


# Edit location #2: Create a term extractor;
# It should include your test code from last week; it just has an output
# in a slightly different shape.
class TermExtractor(EntityExtractor, glossary):
    """
    Extract plaintext terms from TeX, with the locations of the start and end characters they correspond to in
    the input TeX strings.
    """

    def parse(self, tex_path: str, tex: str) -> Iterator[Term]:
        # Extract plaintext segments from TeX
        plaintext_extractor = PlaintextExtractor()
        plaintext_segments = plaintext_extractor.parse(tex_path, tex)

        # Creating 3 columns for the dataframe, this dataframe will later be turned into final json
        matched_terms_start = []
        matched_terms_end = []
        matched_terms = []
        matched_terms_context_str = []

        for text_segment in plaintext_segments:
            text_segment_string = str(text_segment.text.lower())

            # Making two lists from the text_segment_string; one is to capture words without dashes
            # The other is to capture words such as "Gradient-Activated" (but this word happens to not be
            # in the glossary
            text_segment_string_split_on_dashes = re.split(
                "[-\s+]", text_segment_string)
            text_segment_string_not_split_on_dashes = re.split(
                "[\s+]", text_segment_string)

            # Adding all terms that were both in the glossary and in the .tex file into a
            # set so we don't get duplicates
            matches_tuples = []
            matches = set()
            for word in text_segment_string_split_on_dashes:
                for term in terms:
                    if term == word:

                        # Storing as a list because we want to keep the original text_segment_string for debugging (context_tex)
                        matches_tuples.append([term, text_segment_string])

            for word2 in text_segment_string_not_split_on_dashes:
                for term in terms:
                    if term == word2:
                        matches_tuples.append([term, text_segment_string])
            for term in terms:
                term_list = re.split("\s+", term)
                if len(term_list) > 1:
                    if term in text_segment_string:
                        matches_tuples.append([term, text_segment_string])
            for i in matches_tuples:
                matches.add(tuple(i))

            # Getting the start and end indices of the matched terms
            for match in matches:
                start_index_of_string = text_segment_string.find(match[0])
                end_index_of_string = start_index_of_string + len(match[0]) - 1
                matched_terms.append(match[0])
                matched_terms_context_str.append(match[1])
                matched_terms_start.append(
                    text_segment.tex_start + start_index_of_string)
                matched_terms_end.append(
                    text_segment.tex_start + end_index_of_string)

        data_frame_dict = {"term": matched_terms, "start": matched_terms_start,
                           "end": matched_terms_end, "context_str": matched_terms_context_str}
        data_frame = pd.DataFrame(data_frame_dict).sort_values(by=['end'])

        # Getting rid of cases where both "Neural Network" and "Neural Networks"
        # are included (when they start at the same index, i.e. same word except with an extra "s")
        data_frame = data_frame.drop_duplicates(subset=['start'], keep='last')
        data_dict = data_frame.to_dict('records')
        sorted_string = json.dumps(data_dict, indent=4, sort_keys=False)
        json_data = json.loads(sorted_string)

        index = 0
        for term_object in json_data:
            yield Term(
                name=term_object["term"],
                # start position of the term in the TeX
                start=term_object["start"],
                end=term_object["end"],  # end position
                id_=str(index),  # unique ID for each term (index)
                # tex_path (what was passed into the function)
                tex_path=tex_path,
                tex=tex,  # includes all of the spaces and the LaTeX junk
                # context_tex=term_object["context_str"],  # tex + 20 characters before + 20 characters after
                # Assuming DEFAULT_CONTEXT_SIZE is 20 characters
                context_tex=tex[start - \
                                DEFAULT_CONTEXT_SIZE: end + DEFAULT_CONTEXT_SIZE]
            )
            index += 1
