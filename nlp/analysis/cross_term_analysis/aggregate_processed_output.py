import os
import re, regex
import sys
import glob
import json
from colorama import Fore,Style
from pprint import pprint
import pandas as pd
import numpy as np

# packages for nlp feature extraction
from nltk import word_tokenize
from collections import defaultdict
import scispacy
import spacy
from spacy.matcher import Matcher
from spacy.util import filter_spans
from scispacy.abbreviation import AbbreviationDetector

from load_dataset import read_arxiv_ids_from_acl_2020

# objects for nlp feature extraction
nlp = spacy.load("en_core_sci_md") #sm")
# Add the abbreviation pipe to the spacy pipeline.
abbreviation_pipe = AbbreviationDetector(nlp)
nlp.add_pipe(abbreviation_pipe)
verb_pattern = [{'POS': 'VERB', 'OP': '?'},
               {'POS': 'ADV', 'OP': '*'},
               {'POS': 'AUX', 'OP': '*'},
               {'POS': 'VERB', 'OP': '+'}]
# instantiate a Matcher instance
matcher = Matcher(nlp.vocab)
matcher.add("Verb phrase", None, verb_pattern)

# regex patterns for detecting entities from the extended tex
PATTERN_SECTION = r"\\(?:sub)*section[*]*\{[A-Za-z0-9 \{\}\\_.,:-]*\}"
PATTERN_LABEL = r"\\label\{[A-Za-z0-9 \\_.,:-]*\}"
PATTERN_ABSTRACT_BEGIN = r"\\begin\{abstract\}"
PATTERN_ABSTRACT_END = r"\\end\{abstract\}"
PATTERN_TABLE_BEGIN = r"\\begin\{table[*]*\}"
PATTERN_TABLE_END = r"\\end\{table[*]*\}"
PATTERN_FIGURE_BEGIN = r"\\begin\{figure[*]*\}"
PATTERN_FIGURE_END = r"\\end\{figure[*]*\}"
PATTERN_REF = r"\\ref\{[A-Za-z0-9 \\_.,:-]*\}"
PATTERN_CITE = r"\\cite[A-Za-z0-9 \\_.,:-]*\{[A-Za-z0-9 \\_.,:-]*\}"
PATTERN_SYMBOL = r"\$[A-Za-z0-9\\ \{\}\(\)\[\]^&*_.,\+:\;-\=#]*\$"
PATTERN_ANY = r"\\[A-Za-z0-9\\_.,:-]*[\{[A-Za-z0-9 \\_.,:-]*\}]*"



# objects for detecting nesting structures from the extended tex
NESTING_CHARACTERS_MAPPING = {'{':'}', '(':')', '[':']'}
NESTING_CHARACTERS_PAIR=[('{','}'), ('(',')'), ('[',']')]
NESTING_CHARACTERS = [char for pair in NESTING_CHARACTERS_PAIR for char in pair]

# regex pattern for detecting arxiv papers from acl 2020 paper list
PATTERN_ARXIV=r"arxiv.org/abs/\d*\.\d*"


def highlight(input, color='yellow'):
    input = str(input)
    color_obj =  Fore.YELLOW # default
    if color == 'green':
        color_obj = Fore.GREEN
    if color == 'cyan':
        color_obj =  Fore.CYAN
    return str(color_obj+str(input)+Style.RESET_ALL)


def check_dir_type(path):
    if os.path.isdir(path):
        return 'dir'
    elif os.path.isfile(path):
        return 'file'
    else:
        return None


def check_nesting_structure(nesting_chars):
    stack = []
    for nchar in nesting_chars:
        if nchar in ['{','(', '[']:
            stack.append(nchar)
        elif nchar in ['}',')',']']:
            if len(stack) == 0:
                return False
            else:
                if NESTING_CHARACTERS_MAPPING[stack[-1]] != nchar:
                    return False
                else:
                    stack.pop()
        else:
            print('Wrong nesting character', nchar)
            return False
    return True


def detect_complete_nesting(tex, verbose=False):
    nesting_characters_in_tex = []
    for c in tex:
        if c in NESTING_CHARACTERS:
            nesting_characters_in_tex.append(c)
    if not nesting_characters_in_tex:
        return True

    is_correct_nesting_structure = check_nesting_structure(nesting_characters_in_tex)
    if verbose:
        if is_correct_nesting_structure:
            print(is_correct_nesting_structure, nesting_characters_in_tex, tex)
        else:
            print('\t',is_correct_nesting_structure, nesting_characters_in_tex, tex)
    return is_correct_nesting_structure



def extract_complete_tex(context_tex, tex):
    if context_tex is np.nan:
        return None
    surrounding_tex = context_tex.split(tex)
    # if surrounding tex includes multiple matched tex cases, we regard the most right-handed one is the final one
    # this is not a perfect heuristic though for some cases including next line inside the content
    if len(surrounding_tex) > 2:
        surrounding_tex = [tex.join(surrounding_tex[:-1]), surrounding_tex[-1]]
    before_tex, after_tex = surrounding_tex
    extracted_tex = before_tex.split('\n')[-1] + tex + after_tex.split('\n')[0]
    return extracted_tex



def extract_features(input, limit=False):
    doc = nlp(input)

    # (1) add acronym  [1 0 0 0 0 0 1 1 ..]
    abbrevs_tokens = []
    for abrv in doc._.abbreviations:
        # print(f"{abrv} \t ({abrv.start}, {abrv.end}) {abrv._.long_form}")
        abbrevs_tokens.append(str(abrv._.long_form).split())
    abbrevs_tokens = [t for et in abbrevs_tokens for t in et]

    # (2) add entities [1 0 0 1 1 1 0 0 ..]
    entities = [str(e) for e in doc.ents]
    entities_tokens = [e.split() for e in entities]
    entities_tokens = [t for et in entities_tokens for t in et]
    # print(entities)

   # (3) NPs [ 1 1 1 0 0 0 ...]
    np_tokens = []
    for chunk in doc.noun_chunks:
        # print(chunk.text, chunk.root.text, chunk.root.dep_,
        #         chunk.root.head.text)
        np_tokens.append(str(chunk.text).split())
    np_tokens = [t for et in np_tokens for t in et]

    # (3) VPs [ 1 1 1 0 0 0 ...]
    # call the matcher to find matches
    matches = matcher(doc)
    spans = [doc[start:end] for _, start, end in matches]
    vp_tokens = filter_spans(spans)
    vp_tokens = [str(t) for et in vp_tokens for t in et]

    #limite samples
    if limit:
        doc = doc[:limit]

    # aggregate
    data = []
    for token in doc:
        d = {}
        # print(token.text, token.lemma_, token.pos_, token.tag_, token.dep_,
        #         token.head, token.shape_, token.is_alpha, token.is_stop)
        d['token'] = str(token.text)
        d['pos'] = str(token.tag_) # previously token.pos_
        # d['head'] = str(token.head)
        # d['entity'] = 1 if token.text in entities_tokens else 0

        # d['np'] = 1 if token.text in np_tokens else 0
        # d['vp'] = 1 if token.text in vp_tokens else 0
        # d['acronym'] = 1 if token.text in abbrevs_tokens else 0
        data.append(d)
    return data







class Paper():
    def __init__(self, arxiv_id, target_dirs):
        self.arxiv_id = arxiv_id
        self.target_dirs = target_dirs
        self.sentences = None
        self.equations = None
        self.bibitems = None

    def load(self):
        self.load_detected_sentences()
        self.load_detected_equations()
        self.load_detected_equation_tokens()
        self.load_bibitems()

    def load_detected_sentences(self, filename='entities.csv', verbose=False):
        target_dir=None
        for tdir in self.target_dirs:
            if '23-detected-sentences' in tdir:
                target_dir = tdir
        if target_dir is None:
            return None

        data = pd.read_csv(os.path.join(target_dir, filename))

        extracted_tex_list, tex_dict_list, is_sentence_list = [], [], []
        current_section, current_table, current_figure = False, False, False
        for index, sentence in data.iterrows():
            tex = sentence['tex']
            context_tex = sentence['context_tex']
            text = sentence['text']

            # get complete tex information from context_tex
            extracted_tex = extract_complete_tex(context_tex, tex)
            extracted_tex_list.append(extracted_tex)

            # detect entity fields using pre-defined regex
            tex_dict = {}
            if extracted_tex is not None and '\\' in extracted_tex:
                tex_dict['section'] = re.findall(PATTERN_SECTION, extracted_tex)
                tex_dict['label'] = re.findall(PATTERN_LABEL, extracted_tex)
                tex_dict['abstract_begin'] = re.findall(PATTERN_ABSTRACT_BEGIN, extracted_tex)
                tex_dict['abstract_end'] = re.findall(PATTERN_ABSTRACT_END, extracted_tex)
                tex_dict['table_begin'] = re.findall(PATTERN_TABLE_BEGIN, extracted_tex)
                tex_dict['table_end'] = re.findall(PATTERN_TABLE_END, extracted_tex)
                tex_dict['figure_begin'] = re.findall(PATTERN_FIGURE_BEGIN, extracted_tex)
                tex_dict['figure_end'] = re.findall(PATTERN_FIGURE_END, extracted_tex)
                tex_dict['ref'] = re.findall(PATTERN_REF, extracted_tex)
                tex_dict['cite'] = re.findall(PATTERN_CITE, extracted_tex)
                tex_dict['symbol'] = regex.findall(PATTERN_SYMBOL, extracted_tex, overlapped=False)
                tex_dict['any'] = re.findall(PATTERN_ANY, extracted_tex)

                tex_fields = ['section', 'label', 'abstract_begin', 'abstract_end', 'table_begin', 'table_end', 'figure_begin', 'figure_end', 'ref', 'cite', 'symbol']
                tex_values = [fone for f in tex_fields for fone in tex_dict[f]]
                if len(tex_dict['any']) > 0:
                    others = []
                    for any_field in tex_dict['any']:
                        if any_field not in tex_values:
                            # print('\t',highlight(any_field))
                            others.append(any_field)
                    tex_dict['others'] = others

                if len(tex_dict['abstract_begin']) > 0 :
                    current_section = 'ABSTRACT' #tex_dict['section'][0]
                if len(tex_dict['abstract_end']) > 0 :
                    current_section = False #'ABSTRACT' #tex_dict['section'][0]

                if len(tex_dict['section']) > 0 :
                    current_section = tex_dict['section'][0]

                if len(tex_dict['figure_begin']) > 0 :
                    current_figure = True
                if len(tex_dict['figure_end']) > 0 :
                    current_figure = False

                if len(tex_dict['table_begin']) > 0 :
                    current_table = True
                if len(tex_dict['table_end']) > 0 :
                    current_table = False

            if current_section:
                tex_dict['current_section'] = current_section
            if current_figure:
                tex_dict['current_figure'] = current_figure
            if current_table:
                tex_dict['current_table'] = current_table

            tex_dict = {k: v for k, v in tex_dict.items() if v}
            tex_dict_list.append(tex_dict)

            # detect whether current line is sentence or not
            is_sentence = True
            if not detect_complete_nesting(tex, verbose=False):
                is_sentence = False
            if '&' in tex:
                is_sentence = False
            is_sentence_list.append(is_sentence)

        data['extracted_tex'] = extracted_tex_list
        data['tex_dict'] = tex_dict_list
        data['is_sentence'] = is_sentence_list

        num_is_sentence = sum([1 if f else 0 for f in data['is_sentence']])
        print('Total number of correct sentences selected {} out of {}'.format(num_is_sentence, len(data)))
        if verbose:
            for index, sentence in data.iterrows():
                print(index, sentence['start'], sentence['end'], sentence['tex'], sentence['text'])
        self.sentences = data

    def load_detected_equations(self, filename='entities.csv', verbose=False):
        target_dir=None
        for tdir in self.target_dirs:
            if '17-detected-equations' in tdir:
                target_dir = tdir
        if target_dir is None:
            return None

        data = pd.read_csv(os.path.join(target_dir, filename))
        if verbose:
            print(data)

        print('Total number of equations {}'.format(len(data)))
        self.equations = data


    def load_detected_equation_tokens(self, filename='entities.csv', verbose=False):
        target_dir=None
        for tdir in self.target_dirs:
            if '30-detected-equation-tokens' in tdir:
                target_dir = tdir
        if target_dir is None:
            return None

        data = pd.read_csv(os.path.join(target_dir, filename))
        if verbose:
            print(data)

        print('Total number of equation-tokens {}'.format(len(data)))
        self.equation_tokens = data


    # FIXME [citation] 09-bibitem-resolutions/<arxiv_id>/resolutions.csv
    def load_bibitems(self, filename='bibitems.csv', verbose=False):
        target_dir=None
        for tdir in self.target_dirs:
            if '08-bibitems' in tdir:
                target_dir = tdir
        if target_dir is None:
            return None

        data = pd.read_csv(os.path.join(target_dir, filename))
        if verbose:
            print(data)

        print('Total number of bibitems {}'.format(len(data)))
        self.bibitems = data


    def merge_sentences_with_entities(self, show_raw = False, verbose=True):
        """
        TBW
        """
        if self.sentences is None or self.equations is None or self.bibitems is None:
            print('Empty entities')
            return None

        for index, sentence in self.sentences.iterrows():
            text = sentence['text']
            extracted_tex = sentence['extracted_tex']
            tex_dict = sentence['tex_dict']
            tex_fields = ['section', 'label', 'ref', 'cite', 'others', 'current_section', 'current_figure', 'current_table', 'symbol']
            tex_dict = {f:tex_dict[f] for f in tex_fields if f in tex_dict}


            # filter out non-sentence lines using different filters
            if not show_raw:
                if not sentence['is_sentence']:
                    continue
                if 'current_section' not in tex_dict or not tex_dict['current_section']:
                    continue
                if 'current_figure' in tex_dict and not tex_dict['current_figure']:
                    continue
                if  'current_table' in tex_dict and not tex_dict['current_table']:
                    continue

            # substitute entities detected with placeholders
            substitutions = []
            substitutions.append(('[[math]]', 'SYMBOL'))
            for token in self.bibitems['key'].tolist():
                substitutions.append((token, 'CITATION'))
            # substitutions from space tokenizer
            tokens = text.split()
            for index, token in enumerate(tokens):
                if token == 'Figure':
                    substitutions.append((' '.join(tokens[index:index+2]), 'FIGURE'))
                if token == 'Table':
                    substitutions.append((' '.join(tokens[index:index+2]), 'TABLE'))
            # substitutions from NLTK's word_tokenize
            tokens = word_tokenize(text)
            for index, token in enumerate(tokens):
                if token == 'Figure':
                    substitutions.append((' '.join(tokens[index:index+2]), 'FIGURE'))
                if token == 'Table':
                    substitutions.append((' '.join(tokens[index:index+2]), 'TABLE'))
            # substtitue with detected patterns
            for substitution in substitutions:
                text = text.replace(substitution[0], substitution[1])

            features = extract_features(text, limit=10)

            # highlighting
            for tag in ['CITATION', 'TABLE', 'FIGURE', 'SYMBOL']:
                text = text.replace(tag, highlight(tag, color='yellow'))

            if verbose:
                print(highlight('Original tex:\t', color='cyan'),repr(sentence['tex'])) #sentence['tex'],
                print(highlight('Original text:\t', color='cyan'),text) #sentence['tex'],
                print('----------------------')
                print(highlight('Extended tex:\t', color='cyan'),extracted_tex)

                for k,v in tex_dict.items():
                    print("{}\t{}".format(highlight(k,color='cyan'),highlight(v,color='green')))
                print(highlight('Final text:\t', color='cyan'),text)
                print(highlight('Features', color='cyan'))
                pprint(features)

                print("\n\n")



def main():
    # load arxiv ids to process
    arxiv_ids = read_arxiv_ids_from_acl_2020('papers_with_arxiv_link.md')
    # arxiv_ids = ['1802.05365'] #'2004.14500'] #'1601.00978',
    print('Total number of arxiv_ids', len(arxiv_ids))

    for arxiv_id in arxiv_ids:
        print('Loading output from ',arxiv_id)
        sub_dirs_with_arxiv_id = []
        for out_dir in sorted(glob.glob('./data/*')):
            sub_dirs = glob.glob(out_dir+'/*')
            sub_dir_with_arxiv_id = [d for d in sub_dirs if arxiv_id in d]
            if len(sub_dirs) ==0 or len(sub_dir_with_arxiv_id) == 0:
                continue
            sub_dirs_with_arxiv_id.append(sub_dir_with_arxiv_id[0])

        paper = Paper(arxiv_id, sub_dirs_with_arxiv_id)
        paper.load()
        paper.merge_sentences_with_entities()

        from pdb import set_trace; set_trace()

if __name__ == '__main__':
    main()

