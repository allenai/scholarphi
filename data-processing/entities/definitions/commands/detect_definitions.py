import logging
import os.path
import re
import pickle as pkl
import urllib
from argparse import ArgumentParser
from collections import defaultdict
from dataclasses import dataclass
from typing import Any, Dict, Iterator, List, Optional, Union, cast

from tqdm import tqdm
from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.parse_tex import PhraseExtractor, get_containing_entity, overlaps
from common.types import ArxivId, CharacterRange, FileContents, SerializableEntity

from ..nlp import DefinitionDetectionModel
from ..types import Definiendum, Definition, EmbellishedSentence, TermReference

"""
Deployment TODOs:
* TODO(dykang): add dependencies to Dockerfile
* TODO(dykang): document model download instructions in README
* TODO(dykang): make model location configurable in config.ini

Detection improvement TODOs:
* TODO(dykang): aggregation over terms / definitions (e.g., coreference links)
"""

TermName = str
DefinitionId = str


@dataclass(frozen=True)
class DetectDefinitionsTask:
    arxiv_id: ArxivId
    sentences: List[EmbellishedSentence]
    tex_by_file: Dict[str, FileContents]


@dataclass(frozen=True)
class TermDefinitionPair:
    term_start: int
    term_end: int
    term_text: str
    term_type: str
    term_confidence: float
    definition_start: int
    definition_end: int
    definition_text: str
    definition_type: str
    definition_confidence: float


def get_token_character_ranges(text: str, tokens: List[str]) -> List[CharacterRange]:
    """
    Extract start and end charcter positions for each token in featurized tokens
    """
    ranges = []
    current_position = 0
    for token in tokens:
        start_index = text[current_position:].index(token)
        ranges.append(
            CharacterRange(
                current_position + start_index,
                current_position + start_index + len(token) - 1,
            )
        )
        current_position += (len(token) + start_index)
    return ranges


def get_term_definition_pairs(
    text: str, featurized_text: Dict[Any, Any],
    slot_preds: List[str],
    slot_pred_confs: List[float]
) -> List[TermDefinitionPair]:

    # Make index from tokens to their character positions.
    ranges = get_token_character_ranges(text, featurized_text["tokens"])

    # Extract ranges for all terms and definitions.
    terms: List[List[CharacterRange]] = []
    definitions: List[List[CharacterRange]] = []
    term_confidence_list: List[float] = []
    definition_confidence_list: List[float] = []
    term_ranges, definition_ranges = [], []
    term_confs, definition_confs = [], []

    for (slot_label, slot_conf, r) in zip(slot_preds, slot_pred_confs, ranges):
        if slot_label == "TERM":
            term_ranges.append(r)
            term_confs.append(slot_conf)
        if slot_label == "DEF":
            definition_ranges.append(r)
            definition_confs.append(slot_conf)
        if slot_label == "O":
            if len(term_ranges) > 0:
                terms.append(term_ranges)
                term_confidence_list.append(sum(term_confs)/len(term_confs))
            if len(definition_ranges) > 0:
                definitions.append(definition_ranges)
                definition_confidence_list.append(sum(definition_confs)/len(definition_confs))
            term_ranges, definition_ranges = [], []

    # Extract ranges for all abbreviations.
    abbreviation_ranges: List[CharacterRange] = []
    for (abbreviation_label, token_char_range) in zip(featurized_text['abbreviation'], ranges):
        # 1 means the token is a part of abbreviation
        if abbreviation_label == 1:
            abbreviation_ranges.append(token_char_range)

    # Extract ranges for all entities.
    entity_ranges: List[CharacterRange] = []
    for (entity_label, token_char_range) in zip(featurized_text['entity'], ranges):
        # 1 means the token is a part of abbreviation
        if entity_label == 1:
            entity_ranges.append(token_char_range)

    # Match pairs of term and definitions sequentially ( O T O O D then (T, D)). This
    # does not handle multi-term / definitions pairs
    num_term_definition_pairs = min(len(terms), len(definitions))
    pairs: List[TermDefinitionPair] = []
    for pair_index in range(num_term_definition_pairs):
        logging.debug(
            "Found slot predictions for tokens: (tokens: %s), (slots: %s)",
            featurized_text["tokens"],
            slot_preds,
        )
        logging.debug(
            "Processing term-definition pair %d of %d",
            pair_index,
            num_term_definition_pairs,
        )

        term_rangelist = terms[pair_index]
        definition_rangelist = definitions[pair_index]
        term_confidence = term_confidence_list[pair_index]
        definition_confidence = definition_confidence_list[pair_index]

        term_start = min([r.start for r in term_rangelist])
        term_end = max([r.end for r in term_rangelist]) + 1
        definition_start = min([r.start for r in definition_rangelist])
        definition_end = max([r.end for r in definition_rangelist]) + 1

        term_type = "symbol" if "SYMBOL" in text[term_start:term_end] else "term"
        definition_type = "definition"

        # # Check whether a term is a part of entity or not.
        # for entity_range in entity_ranges:
            # # check whether definiendum contains an entiity.
            # if term_start <= entity_range.start and entity_range.end <= term_end:
                # if term_type == "term":
        #             term_type = "entity"

        # # Check whether a term is a part of abbreviation or not.
        # for abbreviation_range in abbreviation_ranges:
            # # check whether definiendum contains an abbreviation.
            # if term_start <= abbreviation_range.start and abbreviation_range.end <= term_end:
                # # abbreviation over-write entitiy type because entity type is optional
                # if term_type == "term":
        #             term_type = "abbreviation"

        pair = TermDefinitionPair(
            term_start=term_start,
            term_end=term_end,
            term_text=text[term_start:term_end],
            term_type=term_type,
            term_confidence=term_confidence,
            definition_start=definition_start,
            definition_end=definition_end,
            definition_text=text[definition_start:definition_end],
            definition_type=definition_type,
            definition_confidence=definition_confidence
        )
        logging.debug("Found definition-term pair %s", pair)
        pairs.append(pair)

    return pairs



def check_text_contains_acronym_for_sanity(
        acronym_text, expansion_text,
        acronym_start, acronym_end,
        expansion_start, expansion_end):
    """
    Very smooth filter
    """
    # if acronym and expansion overlaps in positions, ignore them
    if len(set(range(acronym_start, acronym_end-1)).intersection(
        range(expansion_start,expansion_end-1))) > 0:
        return False

    # if citation patterns are detected (e.g., Citation (CITATION)), ignore them
    if "citation" in acronym_text.lower():
        return False

    # check each letter in acronym appears in expansion text
    is_acronym = True
    for letter_in_acronym in acronym_text.lower():
        if letter_in_acronym not in expansion_text.lower():
            is_acronym = False

    return is_acronym


def get_abbreviation_pairs(
    text: str,
    featurized_text: Dict[Any, Any],
    nlp_model
) -> List[TermDefinitionPair]:

    pairs: List[TermDefinitionPair] = []

    doc = nlp_model(text)
    abbreviation_tokens = [str(t) for t in doc]

    # Make index from tokens to their character positions.
    abbreviation_ranges = get_token_character_ranges(text, featurized_text["tokens"])

    for abrv in doc._.abbreviations:
        # acronym (term).
        acronym_ranges = abbreviation_ranges[abrv.start:abrv.end]
        acronym_start = min([r.start for r in acronym_ranges])
        acronym_end = max([r.end for r in acronym_ranges]) + 1

        # expansion (definition).
        expansion_ranges = abbreviation_ranges[abrv._.long_form.start:abrv._.long_form.end]
        expansion_start = min([r.start for r in expansion_ranges])
        expansion_end = max([r.end for r in expansion_ranges]) + 1

        if not check_text_contains_acronym_for_sanity(
                str(abrv),
                str(abrv._.long_form),
                acronym_start, acronym_end,
                expansion_start, expansion_end):
            continue

        pair = TermDefinitionPair(
            term_start=acronym_start,
            term_end=acronym_end,
            term_text=text[acronym_start:acronym_end],
            term_type="acronym",
            term_confidence=None,
            definition_start=expansion_start,
            definition_end=expansion_end,
            definition_text=text[expansion_start:expansion_end],
            definition_type="expansion",
            definition_confidence=None
        )
        logging.debug("Found definition-term pair %s", pair)
        pairs.append(pair)

    return pairs






def search_symbol_nickname(tidx, featurized_text, range_, ranges, direction):
    # This function searches for a nickname pattern for a token, in the direction specified
    # Get all tokens to the left or right of the token that match the allowed POS tags. 
    # Return symbol and nickname indices and ranges if there are valid POS spans. Else, return None for indices and spans
    # POS Tag Expansions : https://www.ling.upenn.edu/courses/Fall_2003/ling001/penn_treebank_pos.html
    UNION_POS_LIST = ["DT", "JJ", "NN", "NNS", "NNP", "NNPS"]
    pos_idxs = []
    pos_tags = []
    pos_ranges = []
    if direction=='RIGHT':
        current_idx = tidx + 1

    elif direction=='LEFT':
        current_idx = tidx - 1


    # Exit if the current index is greater than the length of the sentence or below zero
    if current_idx >= len(featurized_text["pos"]) or current_idx<0:
        return None, None, None, None

    # Search ahead until the POS tag is not in the union set
    while featurized_text["pos"][current_idx] in UNION_POS_LIST:
        pos_idxs.append(current_idx)
        pos_ranges.append(ranges[current_idx])
        pos_tags.append(featurized_text['pos'][current_idx])
        if direction=='RIGHT':
            current_idx += 1
        elif direction=='LEFT':
            current_idx -= 1

    # ignore when the POS tag is [DT] or [IN].
    if len(pos_tags) == 1 and (pos_tags[0] == "DT"):
        return None, None, None, None

    if len(pos_idxs) > 0 :
        symbol_idx = tidx
        symbol_range = range_

        if direction=='LEFT':
            nickname_idxs = list(reversed(pos_idxs))
            nickname_ranges = [ppr for ppr in reversed(pos_ranges)]
            nickname_tags = [ppt for ppt in reversed(pos_tags)]

        elif direction=='RIGHT':
            nickname_idxs = pos_idxs
            nickname_ranges = [npr for npr in pos_ranges]
            nickname_tags = [ppt for ppt in pos_tags]

        #Skip 'DT' or 'IN' as first or last nickname tokens
        if (nickname_tags[0] == "DT"):
            nickname_ranges = nickname_ranges[1:]
            nickname_idxs = nickname_idxs[1:]
        elif (nickname_tags[-1] == "DT"):
            nickname_ranges = nickname_ranges[:-1]
            nickname_idxs = nickname_idxs[:-1]

        return symbol_idx,symbol_range,nickname_idxs, nickname_ranges
    else:
        return None, None, None, None


def get_symbol_nickname_pairs(text: str, featurized_text: Dict[Any, Any], symbol_texs : Dict[Any, Any]):
    # Check whether a symbol's definition is a nickname of the symbol or not
    # using heuristic rules below, although they are not perfect for some cases.
    #  a/DT particular/JJ transcript/NN SYMBOL/NN
    #  the/DT self-interaction/JJ term/JJ SYMBOL/NN
    #  the/DT main/JJ effect/NN of/NN feature/JJ SYMBOL/JJ

    # Union set of POS tags in nicknames. Feel free to add more if you have new patterns
    # If a new algorithm needs to be added, a separate function can be called in the iteration below. Finally, append a pair object to the 'pairs' list.
    ranges = get_token_character_ranges(text, featurized_text["tokens"])
    pairs = []
    if 'SYMBOL' in text:
        symbol_nickname_pairs = []
        for tidx, (token,pos,np,range_) in enumerate(zip(featurized_text['tokens'], featurized_text['pos'],featurized_text['np'],ranges)):
            # 1. If of the form '*th', check RIGHT of symbol
            # 2. If token is a symbol, then:
            #   a. If the symbol tex is present:
            #       i. If single length symbol, first check LEFT then RIGHT
            #       ii. If multi length symbol, check LEFT
            #   b. If symbol tex is not present, just check LEFT
            if token == 'SYMBOLth':
                symbol_idx,symbol_range,nickname_idxs, nickname_ranges = search_symbol_nickname(tidx, featurized_text, range_, ranges, 'RIGHT')
                if symbol_idx != None:
                    symbol_nickname_pairs.append((symbol_idx,symbol_range,nickname_idxs, nickname_ranges))

            elif token == 'SYMBOL':
                # Decide the order of LEFT or RIGHT
                directions = []
                if tidx > 0:
                    if tidx < len(featurized_text['pos'])-1:
                        if featurized_text['pos'][tidx + 1] in ['NN']:
                            directions = ['RIGHT','LEFT']
                        else:
                            directions = ['LEFT','RIGHT']
                    else:
                        directions = ['LEFT']
                elif tidx < len(featurized_text['pos'])-1:
                    directions = ['RIGHT']

                for direction in directions:
                    symbol_idx,symbol_range,nickname_idxs, nickname_ranges = search_symbol_nickname(tidx, featurized_text, range_, ranges, direction)
                    if symbol_idx is not None:
                        symbol_nickname_pairs.append((symbol_idx,symbol_range,nickname_idxs, nickname_ranges))
                        break

        for symbol_idx,symbol_range, nickname_idxs, nickname_ranges in symbol_nickname_pairs:
            symbol_start = symbol_range.start
            symbol_end = symbol_range.end+1
            nickname_start = min([r.start for r in nickname_ranges])
            nickname_end = max([r.end for r in nickname_ranges]) + 1

            pair = TermDefinitionPair(
                term_start=symbol_start,
                term_end=symbol_end,
                term_text=text[symbol_start:symbol_end],
                term_type="symbol",
                term_confidence=None,
                definition_start=nickname_start,
                definition_end=nickname_end,
                definition_text=text[nickname_start:nickname_end],
                definition_type="nickname",
                definition_confidence=None,
            )
            logging.debug("Found definition-term pair %s", pair)
            pairs.append(pair)

    return pairs


StringOffset = int


def get_symbol_texs(
    sentence_with_symbol_tags: str, sentence_with_formula_contents: str
) -> Optional[Dict[StringOffset, str]]:
    """
    Get a map from the character offsets of the word 'SYMBOL' in the first input string
    to the TeX for that symbol, found from the second input string.  Example:

    Input: get_symbol_texs("Add SYMBOL to SYMBOL.", "Add [[FORMULA:x]] to [[FORMULA:y]]")
    Output: { 4: "x", 14: "y" }

    Returns None if there was an error establishing a mapping, for instance if there are
    a different number of 'SYMBOL' and 'FORMULA' tags between the two versions of the sentence.
    """
    sentence_with_formula_contents = sentence_with_formula_contents.replace('\n','')
    sentence_with_symbol_tags = sentence_with_symbol_tags.replace('\n','')
    symbol_starts = [
        m.start() for m in re.finditer(r"SYMBOL", sentence_with_symbol_tags)
    ]
    symbol_texs = [
        m.group(1)
        for m in re.finditer(r"\[\[FORMULA:(.*?)\]\]", sentence_with_formula_contents)
    ]

    if len(symbol_starts) != len(symbol_texs):
        logging.warning(  # pylint: disable=logging-not-lazy
            "The two representations of a sentence %s and %s were detected as having differing "
            + "numbers of symbols. A lookup table for symbol TeX cannot be built. The TeX for "
            + "symbols in these equations may not be correct in the output.",
            sentence_with_symbol_tags,
            sentence_with_formula_contents,
        )

    return dict(zip(symbol_starts, symbol_texs))





class DetectDefinitions(
    ArxivBatchCommand[
        DetectDefinitionsTask, Union[Definiendum, Definition, TermReference]
    ]
):
    """
    Extract terms and definitions of those terms from sentences using a pre-trained definition
    extraction model. Performs the following stpes:
    1. Load cleaned sentences from the 'detected-sentences' data directory
    2. Extract features from each sentence (aka featurization)
    3. Load the pre-trained NLP model, load the features, and predict intent and term:definition
       slots. The model predicts intents and slots:
        * Intent: whether a sentence is detected as including a definition or not
        * Slot: a tag for each token indicating it is one of (TERM, DEFINITION, neither)
    4. Find all references to terms in the text
    5. Save detected terms to 'entities-terms.csv' and detected definitions to
       'entities-definitions.csv'
    """

    @staticmethod
    def get_name() -> str:
        return "detect-definitions"

    @staticmethod
    def get_description() -> str:
        return "Extract term and definition pairs from LaTeX."

    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        super(DetectDefinitions, DetectDefinitions).init_parser(parser)
        parser.add_argument(
            "--show-progress",
            action="store_true",
            help=(
                "Whether to show progress bar during definition extraction. "
                + "Interferes with log messages shown on the command line."
            ),
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=8,
            help=("Number of sentences to process at a time to detect definitions."),
        )

    def get_arxiv_ids_dirkey(self) -> str:
        return "detected-sentences"

    def load(self) -> Iterator[DetectDefinitionsTask]:
        for arxiv_id in self.arxiv_ids:

            output_dir = directories.arxiv_subdir("detected-definitions", arxiv_id)
            file_utils.clean_directory(output_dir)

            # Load cleaned sentences for definition detection.
            detected_sentences_path = os.path.join(
                directories.arxiv_subdir("embellished-sentences", arxiv_id),
                "sentences.csv",
            )
            try:
                sentences = list(
                    file_utils.load_from_csv(
                        detected_sentences_path, EmbellishedSentence
                    )
                )
            except FileNotFoundError:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "No sentences data found for arXiv paper %s. Try re-running the pipeline, "
                    + "this time enabling the processing of sentences. If that doesn't work, "
                    + "there is likely an error in detected sentences for this paper.",
                    arxiv_id,
                )
                continue

            # Read in all TeX. Once definition detection is finished, all the TeX will be searched
            # for references to the defined terms.
            tex_by_file = file_utils.read_tex(arxiv_id)

            yield DetectDefinitionsTask(arxiv_id, sentences, tex_by_file)

    def process(
        self, item: DetectDefinitionsTask
    ) -> Iterator[Union[Definiendum, Definition, TermReference]]:
        sentences_ordered = sorted(item.sentences, key=lambda s: s.start)
        num_sentences = len(sentences_ordered)
        end_position_of_last_sentence = sentences_ordered[-1].end

        if len(item.sentences) == 0:
            logging.warning(  # pylint: disable=logging-not-lazy
                "No sentences found for arXiv ID %s. Skipping detection of sentences "
                + "that contain entities.",
                item.arxiv_id,
            )
            return

        # Load the pre-trained definition detection model.
        model = DefinitionDetectionModel()

        definition_index = 0
        features = []
        sentences = []

        definiendums: Dict[TermName, List[Definiendum]] = defaultdict(list)
        definitions: Dict[DefinitionId, Definition] = {}

        with tqdm(
            total=num_sentences, disable=(not self.args.show_progress)
        ) as progress:

            for si, sentence in enumerate(sentences_ordered):
                progress.update(1)

                # Only attempt to process sentences that have been marked as likely to be proper
                # plaintext. Note that this means some sentences may be skipped that didn't pass
                # heuristics in the sentence extractor.
                if not sentence.validity_guess:
                    continue

                # Extract features from raw text.
                featurized_text = model.featurize(sentence.legacy_definition_input)
                features.append(featurized_text)
                sentences.append(sentence)


                # Process sentences in batches.
                if len(features) >= self.args.batch_size or si == num_sentences - 1:

                    # Detect terms and definitions in each sentence with a pre-trained definition
                    # extraction model, from the featurized text.
                    intents, slots, slots_conf = model.predict_batch(
                        cast(List[Dict[Any, Any]], features)
                    )
                    
                    # Package extracted terms and definitions into a representation that's
                    # easier to process.    
                    for s, sentence_features, intent, sentence_slots, sentence_slots_conf in zip(
                        sentences, features, intents, slots, slots_conf
                    ):
                        # Extract TeX for each symbol from a parallel representation of the
                        # sentence, so that the TeX for symbols can be saved.
                        # Types of [term and definition] pairs.
                        #   [nickname and definition] for symbols
                        #   [acronym and expansion] for abbreviations
                        #   [term and definition] for other types


                        symbol_texs = get_symbol_texs(
                            s.legacy_definition_input, s.with_equation_tex
                        )

                        symbol_nickname_pairs = get_symbol_nickname_pairs(
                            s.legacy_definition_input, sentence_features, symbol_texs
                        )

                        abbreviation_pairs = get_abbreviation_pairs(
                            s.legacy_definition_input, sentence_features, model.nlp
                        )

                        # Only process slots when they include both 'TERM' and 'DEFINITION'.
                        if "TERM" not in sentence_slots or "DEF" not in sentence_slots:
                            term_definition_pairs = []
                        else:
                            term_definition_pairs = get_term_definition_pairs(
                                s.legacy_definition_input,
                                sentence_features,
                                sentence_slots,
                                sentence_slots_conf
                            )

                        pairs = term_definition_pairs + symbol_nickname_pairs + abbreviation_pairs


                        for pair in pairs:
                            tex_path = s.tex_path
                            definiendum_id = (
                                f"definiendum-{tex_path}-{definition_index}"
                            )
                            definition_id = f"definition-{tex_path}-{definition_index}"
                            definiendum_text = pair.term_text
                            definiendum_type = pair.term_type
                            definition_type = pair.definition_type

                            definiendum_confidence = pair.term_confidence
                            definition_confidence = pair.definition_confidence

                            # Map definiendum and definition start and end positions back to
                            # their original positions in the TeX.
                            offsets = s.legacy_definition_input_journal.initial_offsets(
                                pair.term_start, pair.term_end
                            )
                            if offsets[0] is None or offsets[1] is None:
                                logging.warning(  # pylint: disable=logging-not-lazy
                                    "Could not find offsets of definiendum %s in original TeX "
                                    + "(from sentence %s, file %s, arXiv ID %s). Definiendum will not be saved.",
                                    pair.term_text,
                                    s.id_,
                                    s.tex_path,
                                    item.arxiv_id,
                                )
                                continue
                            definiendum_start = s.start + offsets[0]
                            definiendum_end = s.start + offsets[1]

                            offsets = s.legacy_definition_input_journal.initial_offsets(
                                pair.definition_start, pair.definition_end
                            )
                            if offsets[0] is None or offsets[1] is None:
                                logging.warning(  # pylint: disable=logging-not-lazy
                                    "Could not find offsets of definition %s in original TeX "
                                    + "(from sentence %s, file %s, arXiv ID %s). Definiendum will not be saved.",
                                    pair.definition_text,
                                    s.id_,
                                    s.tex_path,
                                    item.arxiv_id,
                                )
                                continue
                            definition_start = s.start + offsets[0]
                            definition_end = s.start + offsets[1]

                            # Extract document-level features from sentence
                            position_ratio = definiendum_start / end_posiion_of_last_sentence
                            section_name = s.section_name

                            try:
                                tex = item.tex_by_file[tex_path]
                            except KeyError:
                                logging.warning(  # pylint: disable=logging-not-lazy
                                    "Could not find TeX for %s. TeX will not be included in "
                                    + "the output data for definition '%s' for term '%s'",
                                    tex_path,
                                    pair.definition_text,
                                    definiendum_text,
                                )
                                definiendum_tex = "NOT AVAILABLE"
                                definition_tex = "NOT AVAILABLE"
                            else:
                                if (
                                    definiendum_type == "symbol"
                                    and symbol_texs is not None
                                    and pair.term_start in symbol_texs
                                ):
                                    definiendum_tex = symbol_texs[pair.term_start]
                                    definiendum_text = definiendum_tex
                                else:
                                    definiendum_tex = tex.contents[
                                        definiendum_start:definiendum_end
                                    ]
                                definition_tex = tex.contents[
                                    definition_start:definition_end
                                ]


                            # Save the definition to file.
                            definition = Definition(
                                id_=definition_id,
                                start=definition_start,
                                end=definition_end,
                                definiendum=definiendum_text,
                                type_=definition_type,
                                tex_path=tex_path,
                                tex=definition_tex,
                                text=pair.definition_text,
                                context_tex=s.context_tex,
                                sentence_id=s.id_,
                                intent=bool(intent),
                                confidence=definition_confidence,
                            )
                            definitions[definition_id] = definition
                            yield definition

                            # Don't save the definiendum to file yet. Save it in memory first, and then
                            # save it to file once it's done being processed. It will need
                            # to be associated with other definitions. Also, other references
                            # to the term will be detected before this method is over.
                            definiendum = Definiendum(
                                id_=definiendum_id,
                                text=definiendum_text,
                                type_=definiendum_type,
                                confidence=definiendum_confidence,
                                # Link the definiendum to the text that defined it.
                                definition_id=definition_id,
                                # Because a term can be defined multiple places in the paper, these
                                # three lists of definition data will be filled out once all of the
                                # definitions have been found.
                                definition_ids=[],
                                definitions=[],
                                definition_texs=[],
                                sources=[],
                                start=definiendum_start,
                                end=definiendum_end,
                                tex_path=tex_path,
                                tex=definiendum_tex,
                                context_tex=s.context_tex,
                                sentence_id=s.id_,
                                # Document-level features below.
                                position_ratio=position_ratio,
                                position_ratios=[],
                                section_name=section_name,
                                section_names=[]
                            )
                            definiendums[definiendum_text].append(definiendum)
                            definition_index += 1

                    features = []
                    sentences = []

        logging.debug(
            "Finished detecting definitions for paper %s. Now finding references to defined terms.",
            item.arxiv_id,
        )




        all_definiendums: List[Definiendum] = []
        for _, definiendum_list in definiendums.items():
            all_definiendums.extend(definiendum_list)
        term_phrases: List[TermName] = list(definiendums.keys())
        definition_ids: Dict[TermName, List[DefinitionId]] = {}
        definition_texs: Dict[TermName, List[str]] = {}
        definition_texts: Dict[TermName, List[str]] = {}
        sources: Dict[TermName, List[str]] = {}
        position_ratios: Dict[TermName, List[float]] = {}
        section_names: Dict[TermName, List[str]] = {}

        # Associate terms with all definitions that apply to them.
        for term, definiendum_list in definiendums.items():
            definition_ids[term] = [d.definition_id for d in definiendum_list]
            definition_texs[term] = [
                definitions[d.definition_id].tex for d in definiendum_list
            ]
            definition_texts[term] = [
                definitions[d.definition_id].text for d in definiendum_list
            ]
            sources[term] = ["model"] * len(definition_ids[term])
            position_ratios[term] = [d.position_ratio for d in definiendum_list]
            section_names[term] = [d.section_name for d in definiendum_list]

        # Associate each definiendum with all applicable definitions, and save them to file.
        for _, definiendum_list in definiendums.items():
            for d in definiendum_list:
                d.definition_ids.extend(definition_ids[d.text])
                d.definition_texs.extend(definition_texs[d.text])
                d.definitions.extend(definition_texts[d.text])
                d.sources.extend(sources[d.text])
                d.position_ratios.extend(position_ratios[d.text])
                d.section_names.extend(section_names[d.text])
                yield d

        # Detect all other references to the defined terms.
        term_index = 0
        sentence_entities: List[SerializableEntity] = cast(
            List[SerializableEntity], item.sentences
        )

        for tex_path, file_contents in item.tex_by_file.items():
            term_extractor = PhraseExtractor(term_phrases)
            for t in term_extractor.parse(tex_path, file_contents.contents):
                t_sentence = get_containing_entity(t, sentence_entities)

                # Don't save term references if they are already in the definiendums
                if any([overlaps(d, t) for d in all_definiendums]):
                    continue

                logging.debug(
                    "Found reference to term %s at (%d, %d) in %s for arXiv ID %s",
                    t.text,
                    t.start,
                    t.end,
                    t.tex_path,
                    item.arxiv_id,
                )
                yield TermReference(
                    id_=f"term-{t.tex_path}-{term_index}",
                    text=t.text,
                    type_=None,
                    definition_ids=definition_ids[t.text],
                    definitions=definition_texts[t.text],
                    definition_texs=definition_texs[t.text],
                    sources=sources[t.text],
                    position_ratios=position_ratios[t.text],
                    section_names=section_names[t.text],
                    start=t.start,
                    end=t.end,
                    tex_path=t.tex_path,
                    tex=t.tex,
                    context_tex=t.context_tex,
                    sentence_id=t_sentence.id_ if t_sentence is not None else None,
                )
                term_index += 1

    def save(
        self,
        item: DetectDefinitionsTask,
        result: Union[Definiendum, Definition, TermReference],
    ) -> None:

        output_dir = directories.arxiv_subdir("detected-definitions", item.arxiv_id)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        definiendums_path = os.path.join(output_dir, "entities-definiendums.csv")
        definitions_path = os.path.join(output_dir, "entities-definitions.csv")
        term_references_path = os.path.join(output_dir, "entities-term-references.csv")

        if isinstance(result, Definiendum):
            file_utils.append_to_csv(definiendums_path, result)
        elif isinstance(result, Definition):
            file_utils.append_to_csv(definitions_path, result)
        elif isinstance(result, TermReference):
            file_utils.append_to_csv(term_references_path, result)
