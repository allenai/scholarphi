from dataclasses import dataclass
from typing import Iterator

import re
import json

import pysbd

from common.parse_tex import DEFAULT_CONTEXT_SIZE, EntityExtractor, PlaintextExtractor
from common.types import SerializableEntity


@dataclass(frozen=True)
class Term(SerializableEntity):
	name: str
	defintion_text: str

	# List if there is more than one string for the definition html; str otherwise.
	definition_html: Union[str, list]


class GlossaryTerm:
	def __init__(self, gloss_term, gloss_def_text, gloss_def_html):
		self.term = gloss_term
		self.def_text = gloss_def_text
		self.def_html = gloss_def_html




class TermExtractor(EntityExtractor):
	"""
	Extract plaintext terms from TeX, with the locations of the start and end characters they correspond to in
	the input TeX strings.
	"""

	# Added a new init function to add glossary parameter.
	def __init__(self, input_glossary):
		super().__init__()
		self.glossary = input_glossary

	def parse(self, tex_path: str, tex: str) -> Iterator[Term]:

		# Extract plaintext segments from TeX
		plaintext_extractor = PlaintextExtractor()
		plaintext_segments = plaintext_extractor.parse(tex_path, tex)

		# Extracting all the terms, definition_text and definition_html from glossary
		# TODO: DELETE THE COMMENT BELOW AFTER MAKING DECISION
		# Not sure if concise_glossary is necessary; object properties of list type
		# might come in handy later on.
		concise_glossary = []

		for glossary_word in self.glossary:
			new_glossary_word = GlossaryTerm(glossary_word["terms"].lower(),
											 glossary_word["definition_text"],
											 glossary_word["definition_html"])
			concise_glossary.append(new_glossary_word)

		matched_terms = []
		matched_definition_texts = []
		matched_definition_htmls = []
		matched_terms_start = []
		matched_terms_end = []
		matched_terms_context_str = []

		for text_segment in plaintext_segments:
			text_segment_string = str(text_segment.text.lower())

			# Making two lists from the text_segment_string; one is to capture words without dashes
			# The other is to capture words such as "Gradient-Activated" (but this word happens to not be
			# in the glossary
			# TODO: Split on periods, commas, any special character to catch cases with
			#  trailing punctuation such as "segmentation."
			text_segment_string_split_on_dashes = re.split(
				"[-\s]+", text_segment_string)
			text_segment_string_not_split_on_dashes = re.split(
				"[\s]+", text_segment_string)

			# Adding all terms that were both in the glossary and in the .tex file into a
			# set so we don't get duplicates
			# TODO: Make python class for matches_tuples; or utilize term object class
			matches_tuples = []
			matches = set()
			for word in text_segment_string_split_on_dashes:
				for glossary_word in concise_glossary:

					# Object[0] is the term
					if glossary_word.term == word:
						# Adding term name, text_segment from which term was found, def text and def html
						matches_tuples.append([glossary_word.term,
											   text_segment_string,
											   glossary_word.def_text,
											   glossary_word.def_html])

			for word in text_segment_string_not_split_on_dashes:
				for glossary_word in concise_glossary:
					if glossary_word.term == word:
						matches_tuples.append([glossary_word.term,
											   text_segment_string,
											   glossary_word.def_text,
											   glossary_word.def_html])

			for glossary_word in concise_glossary:
				term_list = re.split("\s+", object[0])
				if len(term_list) > 1:
					if glossary_word.term in text_segment_string:
						matches_tuples.append([glossary_word.term,
											   text_segment_string,
											   glossary_word.def_text,
											   glossary_word.def_html])

			for i in matches_tuples:
				list_to_add = i[:-1]
				if isinstance(i[-1], list):
					last_elem = tuple(i[-1])
				else:
					last_elem = i[-1]
				list_to_add.append(last_elem)
				tuple_to_add = tuple(list_to_add)
				matches.add(tuple_to_add)

			###Getting the start and end indices of the matched terms
			for match in matches:
				start_index_of_string = text_segment_string.find(match[0])
				end_index_of_string = start_index_of_string + len(match[0]) - 1
				matched_terms.append(match[0])
				matched_terms_context_str.append(match[1])
				matched_definition_texts.append(match[2])
				matched_definition_htmls.append(match[3])
				matched_terms_start.append(text_segment.tex_start + start_index_of_string)
				matched_terms_end.append(text_segment.tex_start + end_index_of_string)

		def duplicates(lst, item):
			return [i for i, x in enumerate(lst) if x == item]

		# To Do:
		# 1) Determine the objects that share the same start index.
		# 2) Keep the object with the largest end index.
		# 3) Remove all other objects from all lists.

		def delete_duplicate_start(term, start, end, context_str):
			for start_index in start:

				# 1)
				duplicate_indices = duplicates(start, start_index)

				# 2) Keep the object with the largest end index.
				if len(duplicate_indices) > 1:
					ending_indices = []
					for duplicate_index in duplicate_indices:
						ending_indices.append(matched_terms_end[duplicate_index])

					# get the index of the largest ending index
					index_of_largest_ending_index = ending_indices.index(max(ending_indices))
					duplicate_index_to_keep = index_of_largest_ending_index

					# remove the index that we are going to keep from the list of duplicate indices.
					duplicate_indices.pop(duplicate_index_to_keep)

					# remove the objects that are located at the remaining indices from all lists.
					for index in duplicate_indices:
						matched_terms.pop(index)
						matched_terms_start.pop(index)
						matched_terms_end.pop(index)
						matched_terms_context_str.pop(index)
						matched_definition_texts.pop(index)
						matched_definition_htmls.pop(index)

		delete_duplicate_start(matched_terms, matched_terms_start, matched_terms_end, matched_terms_context_str)

		# TODO: Order terms objects by their start index.

		index = 0
		for term_object_number in enumerate(matched_terms):
			start = matched_terms_start[term_object_number]
			end = matched_terms_end[term_object_number]
			yield Term(
				name=matched_terms[term_object_number],
				defintion_text=matched_definition_texts[term_object_number],
				definition_html=matched_definition_htmls[term_object_number],
				start=matched_terms_start[term_object_number],
				end=matched_terms_end[term_object_number],
				id_=str(index),
				tex_path=tex_path,
				tex=tex,
				context_tex=tex[start - \
								DEFAULT_CONTEXT_SIZE: end + DEFAULT_CONTEXT_SIZE]
			)
			index += 1
