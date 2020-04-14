# import pandas as pd
import re
import json

from common.parse_tex import PlaintextExtractor

# from resources import aggregate_glossary.json

plaintext_extractor = PlaintextExtractor()

###First convert the aggregate glossary json into a csv, this was done on a seperate file

###Extracting all the terms from glossary csv
# glossary = pd.read_csv("gloss.csv")
# terms = glossary["terms"].tolist()

# Time to extract all the terms from the json, instead of the glossary csv
with open('/Users/jusheen/Documents/BID/scholar-reader/data-processing/resources/aggregate_glossary.json') as f:
	json_glossary = json.load(f)

# json_glossary = json.load(aggregate_glossary.json)
terms = []
for obj in json_glossary:
	terms.append(obj["terms"])
# terms = json_glossary["terms"]
# .tolist()

###Converting terms to lower case
terms = [item.lower() for item in terms]

###Creating 3 columns for the dataframe, this dataframe will later be turned into final json
matched_terms = []
matched_terms_start = []
matched_terms_end = []
matched_terms_context_str = []

###Open the sample tex file and extract the plaintext
with open("paper.tex") as file_:
	tex = file_.read()
	for text_segment in plaintext_extractor.parse(tex, tex):
		text_segment_string = str(text_segment.text.lower())

		###Making two lists from the text_segment_string; one is to capture words without dashes
		###The other is to capture words such as "Gradient-Activated" (but this word happens to not be
		###in the glossary

		text_segment_string_split_on_dashes = re.split("[-\s+]", text_segment_string)
		text_segment_string_not_split_on_dashes = re.split("[\s+]", text_segment_string)

		##Adding all terms that were both in the glossary and in the .tex file into a
		###set so we don't get duplicates
		matches_tuples = []
		matches = set()
		for word in text_segment_string_split_on_dashes:
			for term in terms:
				if term == word:
					matches_tuples.append([term, text_segment_string])
				###For future efficiency I can probably add a break statement or not use a for loop at all
		for word2 in text_segment_string_not_split_on_dashes:
			for term in terms:
				if term == word2:
					matches_tuples.append([term, text_segment_string])
		for term in terms:
			term_list = re.split("\s+", term)
			if len(term_list) > 1:
				if term in text_segment_string:
					matches_tuples.append([term, text_segment_string])

		# matches = list(matches)
		for i in matches_tuples:
			matches.add(tuple(i))

		###Getting the start and end indices of the matched terms
		for match in matches:
			start_index_of_string = text_segment_string.find(match[0])
			end_index_of_string = start_index_of_string + len(match[0]) - 1
			matched_terms.append(match[0])
			matched_terms_context_str.append(match[1])
			matched_terms_start.append(text_segment.tex_start + start_index_of_string)
			matched_terms_end.append(text_segment.tex_start + end_index_of_string)

	# Enumerate all the lists above (actually i dont have to, they are already lists which have indices
	# , find indices that have duplicate start indices. Delete the larger indice from start
	# list, and then afterwards delete the corresponding indices in the other lists
	# i should do this in a for loop and delete the indices for each list as i find them so as to
	# not have issues discerning which indices correspond to which object

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
				print("OH NO")
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

	delete_duplicate_start(matched_terms, matched_terms_start, matched_terms_end, matched_terms_context_str)
	data_dict = {"term": matched_terms, "start": matched_terms_start, "end": matched_terms_end,
					   "context_str": matched_terms_context_str}


	sorted_string = json.dumps(data_dict, indent=4, sort_keys=False)
	json_data = json.loads(sorted_string)
	with open("found_terms_json_only.json", "w") as f:
		f.write(sorted_string)
