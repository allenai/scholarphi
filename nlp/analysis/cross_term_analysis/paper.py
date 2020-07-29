import os
import sys
import glob

import re
import pandas as pd
import numpy as np
from pprint import pprint
from collections import defaultdict
import latex2mathml.converter

from utils import convert_str_to_list, convert_math_to_raw_symbol, get_indexes_symbol

def merge_symbols_and_text_splits(symbol_raw_list, text_split_list):
    combined = []
    for symbol, text_substr in zip(symbol_raw_list, text_split_list[:len(symbol_raw_list)]):
        combined.append(str(text_substr))
        combined.append(str(symbol))
    combined.append(str(text_split_list[-1]))
    return ''.join(combined)




PATTERN_SYMBOL_FENCE='\\\\[a-zA-Z0-9]*\{[^\}\{]*\}'
def remove_styles_in_symbols(symbol_str):
    matched = re.findall(PATTERN_SYMBOL_FENCE, symbol_str)
    # if "mathbf" in symbol_str:
        # # print(symbol_str)
    #     # print(matched)
    for match in matched:
        match_only_content = match.split('{')[1].split('}')[0]
        symbol_str = symbol_str.replace('\\'+match, match_only_content)
    return symbol_str

class Paper():
    def __init__(self, arxiv_id, target_dirs):
        self.arxiv_id = arxiv_id
        self.target_dirs = target_dirs
        self.sentences = None
        self.definitions = None

        self.num_symbols = 0
        self.num_citations = 0

    def load(self, use_raw_math=False ):
        self.load_detected_sentences()
        self.load_detected_definitions(use_raw_math=use_raw_math)

    def load_detected_sentences(self, filename='entities.csv', verbose=False):
        target_dir=None
        for tdir in self.target_dirs:
            if '23-detected-sentences' in tdir:
                target_dir = tdir
        if target_dir is None:
            return None

        data = pd.read_csv(os.path.join(target_dir, filename))

        if data is None:
            return none

        # get some statistics
        symbols = [convert_str_to_list(d['symbol']) for _,d in data.iterrows() if 'is_sentence' in d and d['is_sentence']]
        cites = [convert_str_to_list(d['cite']) for _,d in data.iterrows() if 'is_sentence' in d and d['is_sentence']]
        self.num_symbols = sum([len(s) for s in symbols])
        self.num_citations = sum([len(s) for s in cites])

        self.sentences = data



    def load_detected_definitions(self, use_raw_math=False, filename='entities.csv', verbose=False):
        target_dir=None
        for tdir in self.target_dirs:
            if '39-detected-definitions' in tdir:
                target_dir = tdir
        if target_dir is None:
            return None

        data = pd.read_csv(os.path.join(target_dir, filename))

        # drop rows that have duplicate items. Ideally, this issue should be fixed in definition extractor
        data = data.drop_duplicates(subset=['text', 'term_text', 'definition_text'], keep='last')
        num_not_matched = 0

        for did, definition in data.iterrows():
            # get the matched sentence with the id_
            sentence = self.sentences.loc[(self.sentences.id_ == definition.sentence_index) & (self.sentences.tex_path == definition.tex_path)]
            sentence = sentence.iloc[0]

            assert sentence.cleaned_text == definition.text


            # stylistic fenses in symbols: e.g., \mathbf{W}^a_i => W^a_i
            sentence_symbol_without_styles = remove_styles_in_symbols(sentence.symbol)

            # extract math raw symbols
            symbol_list = convert_str_to_list(sentence_symbol_without_styles)
            symbol_raw_list = [convert_math_to_raw_symbol(s) for s in symbol_list]

            # replace SYMBOL in text
            text_split_list = sentence.cleaned_text.split('SYMBOL') # len(symbol)+1 size
            if use_raw_math and len(text_split_list) > 1:
                #assert len(symbol_list) == len(text_split_list) - 1
                if len(symbol_list) != len(text_split_list) - 1:
                    print(symbol_list)
                    print(text_split_list)
                    from pdb import set_trace; set_trace()
                merged_text = merge_symbols_and_text_splits(symbol_raw_list, text_split_list)
                data.at[did, 'text'] = merged_text

            # replace SYMBOL in term_text
            data.at[did, 'term_text_type'] = 'term'
            text_split_list_in_term = str(definition.term_text).split('SYMBOL')
            if use_raw_math and len(text_split_list_in_term) > 1:
                symbol_raw_list_in_term = get_indexes_symbol(sentence.cleaned_text,
                             definition.term_start-definition.start,
                             definition.term_end-definition.start, symbol_raw_list)
                #assert len(symbol_raw_list_in_term) == len(text_split_list_in_term) - 1
                if len(symbol_raw_list_in_term) != len(text_split_list_in_term) - 1:
                    print(symbol_raw_list_in_term)
                    print(text_split_list_in_term)
                    from pdb import set_trace; set_trace()
                merged_text_in_term = merge_symbols_and_text_splits(symbol_raw_list_in_term, text_split_list_in_term)
                data.at[did, 'term_text'] = merged_text_in_term
                data.at[did, 'term_text_type'] = 'symbol'

            # replace SYMBOL in definition_text
            text_split_list_in_definition = str(definition.definition_text).split('SYMBOL')
            if use_raw_math and len(text_split_list_in_definition) > 1:
                symbol_raw_list_in_definition = get_indexes_symbol(sentence.cleaned_text,
                               definition.definition_start-definition.start,
                               definition.definition_end-definition.start, symbol_raw_list)
                #assert len(symbol_raw_list_in_definition) == len(text_split_list_in_definition) - 1
                if len(symbol_raw_list_in_definition) != len(text_split_list_in_definition) - 1:
                    print(symbol_raw_list_in_definition)
                    print(text_split_in_definition)
                    from pdb import set_trace; set_trace()
                merged_text_in_definition = merge_symbols_and_text_splits(symbol_raw_list_in_definition, text_split_list_in_definition)
                data.at[did, 'definition_text'] = merged_text_in_definition


        #data['text_with_symbols'] = combined_text_with_symbol_list
        # print('Total {} definitions out of {} sentences'.format(len(data), len(sentence)))
        self.definitions = data
        if data is None:
            return none

        # print(self.num_symbols)
        # print(symbols)





