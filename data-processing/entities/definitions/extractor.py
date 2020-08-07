import logging
import os.path
from argparse import ArgumentParser
from dataclasses import dataclass
from typing import Any, Dict, Iterator, List, Optional, Union, cast

from tqdm import tqdm

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId, CharacterRange, SerializableEntity
from entities.sentences.types import Sentence

from .nlp_tools import DefinitionDetectionModel


"""
Deployment TODOs:
* TODO(dykang): add dependencies to Dockerfile
* TODO(dykang): document model download instructions in README
* TODO(dykang): make model location configurable in config.ini

Detection improvement TODOs:
* TODO(dykang): aggregation over terms / definitions (e.g., coreference links)
* TODO(dykang): add confidence scores
* TODO(dykang): classify definitions and terms into types
"""


@dataclass(frozen=True)
class DetectDefinitionsTask:
    arxiv_id: ArxivId
    sentences: List[Sentence]


@dataclass(frozen=True)
class Term(SerializableEntity):
    text: str
    sentence_id: str

    type_: Optional[str]
    " Type of term (e.g., symbol, protologism, abbreviation). "

    confidence: Optional[float]


@dataclass(frozen=True)
class Definition(SerializableEntity):
    text: str
    sentence_id: str

    term_id: str
    " ID of the term this definition explains. "

    type_: Optional[str]
    " Type of definition (e.g., nickname, expansion, definition). "

    intent: bool
    " Whether this definition is high enough quality to extract. "

    confidence: Optional[float]


@dataclass(frozen=True)
class TermDefinitionPair:
    term_start: int
    term_end: int
    term_text: str
    definition_start: int
    definition_end: int
    definition_text: str


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
        current_position += len(token)
    return ranges


def get_term_definition_pairs(
    text: str, featurized_text: Dict[Any, Any], slot_preds: List[str],
) -> List[TermDefinitionPair]:

    # Make index from tokens to their character positions.
    ranges = get_token_character_ranges(text, featurized_text["tokens"])

    # Extract ranges for all terms and definitions.
    terms: List[List[CharacterRange]] = []
    definitions: List[List[CharacterRange]] = []
    term_ranges, definition_ranges = [], []

    for (slot_label, r) in zip(slot_preds, ranges):
        if slot_label == "TERM":
            term_ranges.append(r)
        if slot_label == "DEF":
            definition_ranges.append(r)
        if slot_label == "O":
            if len(term_ranges) > 0:
                terms.append(term_ranges)
            if len(definition_ranges) > 0:
                definitions.append(definition_ranges)
            term_ranges, definition_ranges = [], []

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

        term_range_list = terms[pair_index]
        definition_range_list = definitions[pair_index]

        term_start = min([r.start for r in term_range_list])
        term_end = max([r.end for r in term_range_list]) + 1
        definition_start = min([r.start for r in definition_range_list])
        definition_end = max([r.end for r in definition_range_list]) + 1

        pair = TermDefinitionPair(
            term_start=term_start,
            term_end=term_end,
            term_text=text[term_start:term_end],
            definition_start=definition_start,
            definition_end=definition_end,
            definition_text=text[definition_start:definition_end],
        )
        logging.debug("Found definition-term pair %s", pair)
        pairs.append(pair)

    return pairs


class DetectDefinitions(
    ArxivBatchCommand[DetectDefinitionsTask, Union[Term, Definition]]
):
    """
    Extract definitions from sentences using a pre-trained definition extraction model.
    It performs the following stpes:
    1. Load cleaned sentences from the 'detected-sentences' data directory
    2. Extract features from each sentence (aka featurization)
    3. Load the pre-trained NLP model, load the features, and predict intent and term:definition
       slots. More specifically:
        * Intent: whether a sentence is detected as including a definition or not
        * Slot: a tag for each token indicating it is one of (TERM, DEFINITION, neither)
    4. Save detected terms in terms.csv and detected definitions definitions.csv
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

            detected_sentences_path = os.path.join(
                directories.arxiv_subdir("detected-sentences", arxiv_id),
                "entities.csv",
            )

            try:
                sentences = list(
                    file_utils.load_from_csv(detected_sentences_path, Sentence)
                )
            except FileNotFoundError:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "No sentences data found for arXiv paper %s. Try re-running the pipeline, "
                    + "this time enabling the processing of sentences. If that doesn't work, "
                    + "there is likely an error in detected sentences for this paper.",
                    arxiv_id,
                )
                continue

            yield DetectDefinitionsTask(arxiv_id, sentences)

    def process(self, item: DetectDefinitionsTask) -> Iterator[Union[Term, Definition]]:
        sentences_ordered = sorted(item.sentences, key=lambda s: s.start)
        num_sentences = len(sentences_ordered)

        if len(item.sentences) == 0:
            logging.warning(  # pylint: disable=logging-not-lazy
                "No sentences found for arXiv ID %s. Skipping detection of sentences "
                + "that contain entities.",
                item.arxiv_id,
            )
            return

        # Load the pre-trained definition detection model.
        model = DefinitionDetectionModel()

        term_index = 0
        features = []
        sentences = []

        with tqdm(
            total=num_sentences, disable=(not self.args.show_progress)
        ) as progress:

            for si, sentence in enumerate(sentences_ordered):
                progress.update(1)

                # Skip sentences that contain junk.
                if not sentence.is_sentence or sentence.text == "":
                    continue

                # Extract features from raw text.
                featurized_text = model.featurize(sentence.cleaned_text)
                features.append(featurized_text)
                sentences.append(sentence)

                # Process sentences in batches.
                if len(features) >= self.args.batch_size or si == num_sentences - 1:

                    # Detect terms and definitions in each sentence with a pre-trained definition
                    # extraction model, from the featurized text.
                    intents, slots = model.predict_batch(
                        cast(List[Dict[Any, Any]], features)
                    )

                    for s, sentence_features, intent, sentence_slots in zip(
                        sentences, features, intents, slots
                    ):
                        # Only process slots when they includ both 'TERM' and 'DEFINITION'.
                        if "TERM" not in sentence_slots or "DEF" not in sentence_slots:
                            continue

                        pairs = get_term_definition_pairs(
                            s.cleaned_text, sentence_features, sentence_slots
                        )
                        for pair in pairs:
                            term_id = f"term-{term_index}"
                            definition_id = f"definition-{term_index}"
                            yield Term(
                                id_=term_id,
                                start=s.start + pair.term_start,
                                end=s.start + pair.term_end,
                                text=pair.term_text,
                                type_=None,
                                confidence=None,
                                tex_path=s.tex_path,
                                tex="NOT AVAILABLE",
                                context_tex=s.context_tex,
                                sentence_id=s.id_,
                            )
                            yield Definition(
                                id_=definition_id,
                                start=s.start + pair.definition_start,
                                end=s.start + pair.definition_end,
                                term_id=term_id,
                                type_=None,
                                tex_path=s.tex_path,
                                tex="NOT AVAILABLE",
                                text=pair.definition_text,
                                context_tex=s.context_tex,
                                sentence_id=s.id_,
                                intent=bool(intent),
                                confidence=None,
                            )
                            term_index += 1

                    features = []
                    sentences = []

    def save(
        self, item: DetectDefinitionsTask, result: Union[Term, Definition]
    ) -> None:

        output_dir = directories.arxiv_subdir("detected-definitions", item.arxiv_id)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        terms_path = os.path.join(output_dir, "entities-terms.csv")
        definitions_path = os.path.join(output_dir, "entities-definitions.csv")

        if isinstance(result, Term):
            file_utils.append_to_csv(terms_path, result)
        elif isinstance(result, Definition):
            file_utils.append_to_csv(definitions_path, result)
