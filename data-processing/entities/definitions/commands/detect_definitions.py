import logging
import os.path
import re
from argparse import ArgumentParser
from collections import defaultdict
from dataclasses import dataclass
from typing import Any, Dict, Iterator, List, NamedTuple, Optional, Union, cast

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.parse_tex import PhraseExtractor, overlaps
from common.types import ArxivId, CharacterRange, FileContents
from tqdm import tqdm
from typing_extensions import Literal

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
    term_confidence: Optional[float]
    definition_start: int
    definition_end: int
    definition_text: str
    definition_type: str
    definition_confidence: Optional[float]


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
        current_position += len(token) + start_index
    return ranges


StringOffset = int


def get_symbol_texs(
    sentence_with_symbol_tags: str, sentence_with_formula_contents: str
) -> Optional[Dict[StringOffset, str]]:
    """
    Get a map from the character offsets of the word 'SYMBOL' in the first input string
    to the TeX for that symbol, found from the second input string.  Example:

    Input: get_symbol_texs("Add SYMBOL to SYMBOL.", "Add (((FORMULA:x))) to (((FORMULA:y)))")
    Output: { 4: "x", 14: "y" }

    Returns None if there was an error establishing a mapping, for instance if there are
    a different number of 'SYMBOL' tags between the two versions of the sentence.
    """
    symbol_starts = [
        match.start() for match in re.finditer(r"SYMBOL", sentence_with_symbol_tags)
    ]
    symbol_texs = [
        match.group(1)
        for match in re.finditer(
            # The extra '[)]*]' before the ending triple-parentheses ensures that
            # closing parentheses that were part of the original equation (e.g., for
            # a symbol like 'f(x)') are included in the symbol, rather than being read as part
            # of the triple-parens formula delimiter.
            r"\(\(\(FORMULA:(.*?[)]*)\)\)\)",
            sentence_with_formula_contents,
        )
    ]

    if len(symbol_starts) != len(symbol_texs):
        logging.warning(  # pylint: disable=logging-not-lazy
            "The two representations of a sentence %s and %s were detected as having differing "
            + "numbers of symbols. A lookup table for symbol TeX cannot be built. The TeX for "
            + "symbols in these equations may not be correct in the output.",
            sentence_with_symbol_tags,
            sentence_with_formula_contents,
        )
        return None

    return dict(zip(symbol_starts, symbol_texs))


def consolidate_keyword_definitions(
    text: str,
    tokens: List[str],
    slot_predictions: List[str],
    slot_prediction_confidences: List[float],
    prediction_type : str
) -> List[TermDefinitionPair]:

    # Make index from tokens to their character positions.
    ranges = get_token_character_ranges(text, tokens)

    # Extract ranges for all terms and definitions.
    terms: List[List[CharacterRange]] = []
    definitions: List[List[CharacterRange]] = []
    term_confidence_list: List[float] = []
    definition_confidence_list: List[float] = []
    term_ranges, definition_ranges = [], []
    term_confidences, definition_confidences = [], []

    for (slot_label, slot_confidence, range_) in zip(
        slot_predictions, slot_prediction_confidences, ranges
    ):
        if slot_label == 'TERM':
            term_ranges.append(range_)
            term_confidences.append(slot_confidence)
        if slot_label == 'DEF':
            definition_ranges.append(range_)
            definition_confidences.append(slot_confidence)
        if slot_label == 'O':
            if len(term_ranges) > 0:
                terms.append(term_ranges)
                term_confidence_list.append(
                    sum(term_confidences) / len(term_confidences)
                )
            if len(definition_ranges) > 0:
                definitions.append(definition_ranges)
                definition_confidence_list.append(
                    sum(definition_confidences) / len(definition_confidences)
                )
            term_ranges, definition_ranges = [], []
        
    if len(term_ranges) > 0:
        terms.append(term_ranges)
        term_confidence_list.append(
            sum(term_confidences) / len(term_confidences)
        )
    if len(definition_ranges) > 0:
        definitions.append(definition_ranges)
        definition_confidence_list.append(
            sum(definition_confidences) / len(definition_confidences)
        )
    term_ranges, definition_ranges = [], []

    # Match pairs of term and definitions sequentially ( O T O O D then (T, D)). This
    # does not handle multi-term / definitions pairs.
    num_term_definition_pairs = min(len(terms), len(definitions))
    pairs: List[TermDefinitionPair] = []
    for pair_index in range(num_term_definition_pairs):
        logging.debug(
            "Found slot predictions for tokens: (tokens: %s), (slots: %s)",
            tokens,
            slot_predictions,
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

        term_start = min([term_range.start for term_range in term_rangelist])
        term_end = max([term_range.end for term_range in term_rangelist]) + 1
        definition_start = min(
            [definition_range.start for definition_range in definition_rangelist]
        )
        definition_end = (
            max([definition_range.end for definition_range in definition_rangelist]) + 1
        )

        all_definition_types = {
        'W00' : ['term','definition'],
        'AI2020' : ['abbreviation','expansion'],
        'DocDef2' : ['symbol','nickname']
        }

        term_type = all_definition_types[prediction_type][0]
        definition_type = all_definition_types[prediction_type][1]

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
            definition_confidence=definition_confidence,
        )
        logging.debug("Found definition-term pair %s", pair)
        pairs.append(pair)

    return pairs


def check_text_contains_abbreviation_for_sanity(
    abbreviation_text: str,
    expansion_text: str,
    abbreviation_start: int,
    abbreviation_end: int,
    expansion_start: int,
    expansion_end: int,
) -> bool:
    """
    Very smooth filter:
    Outputs from our current abbreviation detector include lots of noise
        e.g., "alpha x (Ref )" or any phrases with parenthesis
    This function filters out the noise using simple heuristics.
    """
    # If abbreviation and expansion overlaps in positions, ignore them.
    if (
        len(
            set(range(abbreviation_start, abbreviation_end - 1)).intersection(
                range(expansion_start, expansion_end - 1)
            )
        )
        > 0
    ):
        return False

    # If citation patterns are detected (e.g., Citation (CITATION)), ignore them.
    if "citation" in abbreviation_text.lower():
        return False

    # Check each letter in abbreviation appears in expansion text.
    is_abbreviation = True
    for letter_in_abbreviation in abbreviation_text.lower():
        if letter_in_abbreviation not in expansion_text.lower():
            is_abbreviation = False

    return is_abbreviation


def get_abbreviations(
    text: str, tokens: List[str], nlp_model: Any
) -> List[TermDefinitionPair]:

    pairs: List[TermDefinitionPair] = []

    doc = nlp_model(text)

    # Make index from tokens to their character positions.
    token_ranges = get_token_character_ranges(text, tokens)

    for abbreviation in doc._.abbreviations:
        # Abbreviation (term).
        abbreviation_ranges = token_ranges[abbreviation.start : abbreviation.end]
        abbreviation_start = min([r.start for r in abbreviation_ranges])
        abbreviation_end = max([r.end for r in abbreviation_ranges]) + 1

        # Expansion (definition).
        expansion_ranges = token_ranges[
            abbreviation._.long_form.start : abbreviation._.long_form.end
        ]
        expansion_start = min(
            [expansion_range.start for expansion_range in expansion_ranges]
        )
        expansion_end = (
            max([expansion_range.end for expansion_range in expansion_ranges]) + 1
        )

        if not check_text_contains_abbreviation_for_sanity(
            str(abbreviation),
            str(abbreviation._.long_form),
            abbreviation_start,
            abbreviation_end,
            expansion_start,
            expansion_end,
        ):
            continue

        pair = TermDefinitionPair(
            term_start=abbreviation_start,
            term_end=abbreviation_end,
            term_text=text[abbreviation_start:abbreviation_end],
            term_type="abbreviation",
            term_confidence=None,
            definition_start=expansion_start,
            definition_end=expansion_end,
            definition_text=text[expansion_start:expansion_end],
            definition_type="expansion",
            definition_confidence=None,
        )
        logging.debug("Found abbreviation-expansion pair %s", pair)
        pairs.append(pair)

    return pairs


class Nickname(NamedTuple):
    token_indexes: List[int]
    token_ranges: List[CharacterRange]


Direction = Literal["LEFT", "RIGHT"]


def search_symbol_nickname(
    token_index: int,
    pos: List[str],
    ranges: List[CharacterRange],
    direction: Direction,
) -> Optional[Nickname]:
    """
    This function searches for a nickname pattern for a token, in the direction specified.
    Get all tokens to the left or right of the token that match the allowed POS tags.
    Return symbol and nickname indices and ranges if there are valid POS spans. Else, return None for indices and spans.
    """

    # Union set of POS tags in nicknames. Feel free to add more if you have new patterns.
    # POS Tag Expansions : https://www.ling.upenn.edu/courses/Fall_2003/ling001/penn_treebank_pos.html.
    UNION_POS_LIST = ["DT", "JJ", "NN", "NNS", "NNP", "NNPS", ":", "-LRB-"]
    pos_indexes = []
    pos_tags = []
    pos_ranges = []
    if direction == "RIGHT":
        current_index = token_index + 1
    else:
        current_index = token_index - 1

    # Exit if the current index is greater than the length of the sentence or below zero.
    if current_index >= len(pos) or current_index < 0:
        return None

    # Search ahead until the POS tag is not in the union set.
    while pos[current_index] in UNION_POS_LIST:
        pos_indexes.append(current_index)
        pos_ranges.append(ranges[current_index])
        pos_tags.append(pos[current_index])
        if direction == "RIGHT":
            current_index += 1
            if current_index >= len(pos):
                break
        else:
            current_index -= 1
            if current_index < 0:
                break

    # Ignore when the POS tag is among ["DT", ":", "-LRB-"].
    if len(pos_tags) == 1 and (pos_tags[0] in ["DT", ":", "-LRB-"]):
        return None

    if len(pos_indexes) > 0:
        if direction == "LEFT":
            nickname_indexes = list(reversed(pos_indexes))
            nickname_ranges = list(reversed(pos_ranges))
            nickname_tags = list(reversed(pos_tags))
        else:
            nickname_indexes = pos_indexes
            nickname_ranges = list(pos_ranges)
            nickname_tags = list(pos_tags)

        # Skip ["DT", ":", "-LRB-"] as first or last nickname tokens.
        if nickname_tags[0] in ["DT", ":", "-LRB-"]:
            nickname_ranges = nickname_ranges[1:]
            nickname_indexes = nickname_indexes[1:]
        elif nickname_tags[-1] in ["DT", ":", "-LRB-"]:
            nickname_ranges = nickname_ranges[:-1]
            nickname_indexes = nickname_indexes[:-1]

        return Nickname(nickname_indexes, nickname_ranges)
    else:
        return None


class SymbolNickname(NamedTuple):
    symbol: str
    symbol_index: int
    symbol_range: CharacterRange
    nickname_indexes: List[int]
    nickname_ranges: List[CharacterRange]


def get_symbol_nickname_pairs(
    text: str, tokens: List[str], pos: List[str], symbol_texs: Dict[StringOffset, str]
) -> List[TermDefinitionPair]:
    # Check whether a symbol's definition is a nickname of the symbol or not
    # using heuristic rules below, although they are not perfect for some cases.
    # a/DT particular/JJ transcript/NN SYMBOL/NN.
    # the/DT self-interaction/JJ term/JJ SYMBOL/NN.
    # the/DT main/JJ effect/NN of/NN feature/JJ SYMBOL/JJ.

    # If a new algorithm needs to be added, a separate function can be called in the iteration below. Finally, append a pair object to the 'pairs' list.
    ranges = get_token_character_ranges(text, tokens)
    pairs = []
    if "SYMBOL" in text:

        symbol_nickname_pairs: List[SymbolNickname] = []
        symbol_index = 0

        for token_index, (token, range_) in enumerate(zip(tokens, ranges)):

            # 1. If of the form '*th', check RIGHT of symbol.
            # 2. If token is a symbol, then:
            #   a. If the symbol tex is present:
            #       i. If single length symbol, first check LEFT then RIGHT.
            #       ii. If multi length symbol, check LEFT.
            #   b. If symbol tex is not present, just check LEFT.
            if token == "SYMBOLth":
                nickname = search_symbol_nickname(token_index, pos, ranges, "RIGHT")
                if nickname is not None and range_.start in symbol_texs:
                    symbol_nickname_pairs.append(
                        SymbolNickname(
                            symbol_texs[range_.start],
                            token_index,
                            range_,
                            nickname.token_indexes,
                            nickname.token_ranges,
                        )
                    )

            elif token == "SYMBOL":
                # Decide the order of LEFT or RIGHT.
                directions: List[Direction] = []
                if token_index > 0:
                    if token_index < len(pos) - 1:
                        # Search RIGHT first if the immediate next token is among ["NN", ":"].
                        if pos[token_index + 1] in ["NN", ":"]:
                            directions = ["RIGHT", "LEFT"]
                        else:
                            directions = ["LEFT", "RIGHT"]
                    else:
                        directions = ["LEFT"]
                elif token_index < len(pos) - 1:
                    directions = ["RIGHT"]

                for direction in directions:
                    nickname = search_symbol_nickname(
                        token_index, pos, ranges, direction
                    )
                    if nickname is not None and range_.start in symbol_texs:
                        symbol_nickname_pairs.append(
                            SymbolNickname(
                                symbol_texs[range_.start],
                                token_index,
                                range_,
                                nickname.token_indexes,
                                nickname.token_ranges,
                            )
                        )
                        break

            if "SYMBOL" in token:
                symbol_index += 1

        for sn in symbol_nickname_pairs:
            symbol_start = sn.symbol_range.start
            symbol_end = sn.symbol_range.end + 1
            nickname_start = min(
                [nickname_range.start for nickname_range in sn.nickname_ranges]
            )
            nickname_end = (
                max([nickname_range.end for nickname_range in sn.nickname_ranges]) + 1
            )
            nickname_text = text[nickname_start:nickname_end]
            # Reject a nickname if the nickname text is "SYMBOL".
            if nickname_text == "SYMBOL":
                continue
            
            pair = TermDefinitionPair(
                term_start=symbol_start,
                term_end=symbol_end,
                term_text=sn.symbol,
                term_type="symbol",
                term_confidence=None,
                definition_start=nickname_start,
                definition_end=nickname_end,
                definition_text=nickname_text,
                definition_type="nickname",
                definition_confidence=None,
            )
            logging.debug("Found symbol-nickname pair %s", pair)
            pairs.append(pair)

    return pairs


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
                directories.arxiv_subdir("sentence-tokens", arxiv_id),
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
        prediction_types =  ['AI2020', 'DocDef2', 'W00']
        model = DefinitionDetectionModel(prediction_types)

        definition_index = 0
        features = []
        sentences: List[EmbellishedSentence] = []

        definiendums: Dict[TermName, List[Definiendum]] = defaultdict(list)
        term_phrases: List[str] = []
        abbreviations: List[str] = []
        symbol_nicks: List[str] = []
        definitions: Dict[DefinitionId, Definition] = {}

        with tqdm(
            total=num_sentences, disable=(not self.args.show_progress)
        ) as progress:

            for sentence_index, sentence in enumerate(sentences_ordered):
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
                if (
                    len(features) >= self.args.batch_size
                    or sentence_index == num_sentences - 1
                ):

                    # Detect terms and definitions in each sentence with a pre-trained definition
                    # extraction model, from the featurized text.
                        
                    termdef_intents, termdef_slots, termdef_slots_confidence = model.predict_batch(
                        cast(List[Dict[Any, Any]], features), 'W00'
                    )
                    abbrexp_intents, abbrexp_slots, abbrexp_slots_confidence = model.predict_batch(
                        cast(List[Dict[Any, Any]], features), 'AI2020'
                    )
                    symnick_intents, symnick_slots, symnick_slots_confidence = model.predict_batch(
                        cast(List[Dict[Any, Any]], features), 'DocDef2'
                    )
                    
                    # Package extracted terms and definitions into a representation that's
                    # easier to process.
                    for (
                        s,
                        sentence_features,
                        termdef_intent,
                        termdef_sentence_slots,
                        termdef_sentence_slots_confidence,
                        abbrexp_intent,
                        abbrexp_sentence_slots,
                        abbrexp_sentence_slots_confidence,
                        symnick_intent,
                        symnick_sentence_slots,
                        symnick_sentence_slots_confidence,
                    ) in zip(sentences, features, 
                            termdef_intents['W00'], termdef_slots['W00'], termdef_slots_confidence['W00'],
                            abbrexp_intents['AI2020'], abbrexp_slots['AI2020'], abbrexp_slots_confidence['AI2020'], 
                            symnick_intents['DocDef2'], symnick_slots['DocDef2'], symnick_slots_confidence['DocDef2']):
                        # Extract TeX for each symbol from a parallel representation of the
                        # sentence, so that the TeX for symbols can be saved.
                        # Types of [term and definition] pairs.
                        #   [nickname and definition] for symbols.
                        #   [abbreviation and expansion] for abbreviations.
                        #   [term and definition] for other types.

                        symbol_texs = get_symbol_texs(
                            s.legacy_definition_input, s.with_formulas_marked
                        )
                        #--- This is V2 code for getting symbol_nickname_pairs and abbreviation_pairs---
                        # if symbol_texs is None:
                        #     symbol_nickname_pairs = []
                        # else:
                        #     symbol_nickname_pairs = get_symbol_nickname_pairs(
                        #         s.legacy_definition_input,
                        #         sentence_features["tokens"],
                        #         sentence_features["pos"],
                        #         symbol_texs,
                        #     )

                        # abbreviation_pairs = get_abbreviations(
                        #     s.legacy_definition_input,
                        #     sentence_features["tokens"],
                        #     model.nlp,
                        # )
                        #--- end ---

                        # Only process slots when they include both 'TERM' and 'DEFINITION'.
                        if "TERM" not in termdef_sentence_slots or "DEF" not in termdef_sentence_slots:
                            term_definition_pairs = []
                        else:
                            term_definition_pairs = consolidate_keyword_definitions(
                                s.legacy_definition_input,
                                sentence_features["tokens"],
                                termdef_sentence_slots,
                                termdef_sentence_slots_confidence,
                                "W00"
                            )

                        if "TERM" not in abbrexp_sentence_slots or "DEF" not in abbrexp_sentence_slots:
                            abbreviation_expansion_pairs = []
                        else:
                            abbreviation_expansion_pairs = consolidate_keyword_definitions(
                                s.legacy_definition_input,
                                sentence_features["tokens"],
                                abbrexp_sentence_slots,
                                abbrexp_sentence_slots_confidence,
                                "AI2020"
                            )
                        
                        if "TERM" not in symnick_sentence_slots or "DEF" not in symnick_sentence_slots:
                            symbol_nickname_pairs = []
                        else:
                            symbol_nickname_pairs = consolidate_keyword_definitions(
                                s.legacy_definition_input,
                                sentence_features["tokens"],
                                symnick_sentence_slots,
                                symnick_sentence_slots_confidence,
                                "DocDef2"
                            )

                        pairs = (
                            term_definition_pairs
                            + symbol_nickname_pairs
                            + abbreviation_expansion_pairs
                        )
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

                            # Extract document-level features from sentence.
                            position_ratio = (
                                definiendum_start / end_position_of_last_sentence
                            )
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
                                context_tex=sentence.context_tex,
                                sentence_id=sentence.id_,
                                intent=True,
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
                                context_tex=sentence.context_tex,
                                sentence_id=sentence.id_,
                                # Document-level features below.
                                position_ratio=position_ratio,
                                position_ratios=[],
                                section_name=section_name,
                                section_names=[],
                            )
                            definiendums[definiendum_text].append(definiendum)
                            if definiendum.type_ == "term":
                                term_phrases.append(definiendum.text)
                            if definiendum.type_ == "abbreviation":
                                abbreviations.append(definiendum.text)
                            if definiendum.type_ == "symbol":
                                symbol_nicks.append(definiendum.text)

                            definition_index += 1

                    features = []
                    sentences = []

        logging.debug(f"Finished detecting definitions for paper {item.arxiv_id}. Now finding references to defined terms.")

        all_definiendums: List[Definiendum] = []
        for _, definiendum_list in definiendums.items():
            all_definiendums.extend(definiendum_list)

        definition_ids: Dict[TermName, List[DefinitionId]] = {}
        definition_texs: Dict[TermName, List[str]] = {}
        definition_texts: Dict[TermName, List[str]] = {}
        sources: Dict[TermName, List[str]] = {}
        position_ratios: Dict[TermName, List[float]] = {}
        section_names: Dict[TermName, List[str]] = {}

        # Associate terms with all definitions that apply to them.
        for term, definiendum_list in definiendums.items():
            definition_ids[term] = [
                definiendum.definition_id for definiendum in definiendum_list
            ]
            definition_texs[term] = [
                definitions[definiendum.definition_id].tex
                for definiendum in definiendum_list
            ]
            definition_texts[term] = [
                definitions[definiendum.definition_id].text
                for definiendum in definiendum_list
            ]
            sources[term] = ["model"] * len(definition_ids[term])
            position_ratios[term] = [
                definiendum.position_ratio for definiendum in definiendum_list
            ]
            section_names[term] = [
                definiendum.section_name
                for definiendum in definiendum_list
                if definiendum.section_name is not None
            ]

        # Associate each definiendum with all applicable definitions, and save them to file.
        for _, definiendum_list in definiendums.items():
            for definiendum in definiendum_list:
                definiendum.definition_ids.extend(definition_ids[definiendum.text])
                definiendum.definition_texs.extend(definition_texs[definiendum.text])
                definiendum.definitions.extend(definition_texts[definiendum.text])
                definiendum.sources.extend(sources[definiendum.text])
                definiendum.position_ratios.extend(position_ratios[definiendum.text])
                definiendum.section_names.extend(section_names[definiendum.text])
                yield definiendum

        # Detect all other references to the defined terms. Detect references to textual
        # terms, abbreviations, and symbols.
        term_index = 0

        for tex_path, file_contents in item.tex_by_file.items():
            term_extractor = PhraseExtractor(term_phrases + abbreviations + symbol_nicks)
            for t in term_extractor.parse(tex_path, file_contents.contents):

                # Don't save term references if they are already in the definiendums.
                if any([overlaps(definiendum, t) for definiendum in all_definiendums]):
                    continue

                logging.debug(
                    "Found reference to term %s at (%d, %d) in %s for arXiv ID %s",
                    t.text,
                    t.start,
                    t.end,
                    t.tex_path,
                    item.arxiv_id,
                )
                type_ = (
                    "abbreviation"
                    if t.text in abbreviations
                    else "term"
                    if t.text in term_phrases
                    else "symbol"
                    if t.text in symbol_nicks
                    else "unknown"
                )
                yield TermReference(
                    id_=f"term-{t.tex_path}-{term_index}",
                    text=t.text,
                    type_=type_,
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
