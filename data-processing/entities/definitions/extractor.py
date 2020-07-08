import logging
import os.path
from dataclasses import dataclass
from typing import Iterator, List, Tuple, DefaultDict, Dict, Any
from collections import defaultdict

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId, RelativePath, SerializableEntity
from entities.sentences.types import Sentence

from .types import Definition
from .nlp_tools import DefinitionModel


@dataclass(frozen=True)
class FindSentencesTask:
    arxiv_id: ArxivId
    sentences: List[Sentence]
    # tex_path: RelativePath


@dataclass(frozen=True)
class DefinitionSentencePair:
    id_: int
    start: int
    end: int
    tex_path: str
    sentence_index: str
    sentence_text: str

    # whether to include a definition or not
    intent: bool

    # term related attributes
    term_index: int
    term_start: int
    term_end: int
    term_text: str
    # term_confidence: float
    term_type: str

    # definition related attributes
    definition_index: int
    definition_start: int
    definition_end: int
    definition_text: str
    # definition_confidence: float
    definition_type: str


# keep this for future
# @dataclass(frozen=True)
# class TokenId:
# tex_path: str
# equation_index: int
#     token_index: int


def create_index_list(text: str, tokens: List[str]) -> List[Tuple[int, int]]:
    indexes = []
    current_position = 0
    for token in tokens:
        start_index = text[current_position:].index(token)
        # assert text[current_position+start_index:current_position+start_index+len(token)] != token:
        indexes.append(
            (
                current_position + start_index,
                current_position + start_index + len(token) - 1,
            )
        )
        current_position += len(token)
    return indexes


def process_term_definition_slot(
    text: str,
    featurized_text: Dict[Any,Any],
    slot_preds: List[str],
    verbose: bool = False,
) -> List[Dict[Any,Any]]:
    # make index function to original text for each token of featurized text
    indexes = create_index_list(text, featurized_text["tokens"])

    # extract multiple terms or definitions
    terms, definitions = [], []
    term, definition = [], []
    for index, (slot, token, index_pair) in enumerate(
        zip(slot_preds, featurized_text["tokens"], indexes)
    ):
        if slot == "TERM":
            term.append((index_pair, token))
        if slot == "DEF":
            definition.append((index_pair, token))
        if slot == "O":
            if len(term) > 0:
                terms.append(term)
            if len(definition) > 0:
                definitions.append(definition)
            term, definition = [], []

    # currently, match pairs of term and definitions sequentially
    # TODO need a better way of mapping multi-term/definitions pairs
    # TODO add confidence scores for term/definition predictions
    # TODO add type classifier for term/definition
    num_pair = min(len(terms), len(definitions))
    slot_dict_list = []
    for td_pair in range(num_pair):
        if verbose:
            print(featurized_text["tokens"])
            print(text)
            print(slot_preds)
            print("{} out of {}".format(td_pair, num_pair))

        term_list = [t[1] for t in terms[td_pair]]
        term_index_list = [t[0] for t in terms[td_pair]]
        definition_list = [t[1] for t in definitions[td_pair]]
        definition_index_list = [t[0] for t in definitions[td_pair]]

        slot_dict = {}
        slot_dict["term_start"] = min([idx[0] for idx in term_index_list])
        slot_dict["term_end"] = max([idx[1] for idx in term_index_list])
        slot_dict["term_text"] = text[
            slot_dict["term_start"] : slot_dict["term_end"] + 1
        ]
        slot_dict["term_type"] = None
        # slot_dict['term_confidence'] = None
        slot_dict["definition_start"] = min([idx[0] for idx in definition_index_list])
        slot_dict["definition_end"] = max([idx[1] for idx in definition_index_list])
        slot_dict["definition_text"] = text[
            slot_dict["definition_start"] : slot_dict["definition_end"] + 1
        ]
        slot_dict["definition_type"] = None
        # slot_dict['definition_confidence'] = None

        slot_dict_list.append(slot_dict)

        if verbose:
            print(text[slot_dict["term_start"] : slot_dict["term_end"] + 1])
            print(text[slot_dict["definition_start"] : slot_dict["definition_end"] + 1])
            for k, v in slot_dict.items():
                print("\t{}\t{}".format(k, v))

    return slot_dict_list


class DetectDefinitions(ArxivBatchCommand[DetectDefinitionsTask, DefinitionSentencePair]):
    """
    Extract definition sentences from Sentence using the pre-trained definition extraction model.
    Takes as input the sentences
    Basic steps:
        - load cleaned sentences from detected-sentences
        - extract features from each sentence (aka featurization)
        - load the pre-trained nlp model, load the faetures, and predict term:definition tokens
        - store detected term:definition pairs in TermDefinition.csv
    Alternative logics for saving:
        - (1) (*current version) TermDefinition.csv
            Range for Term/Definition
        - (2) Term.csv, Term_entities.csv, Definition.csv
            Each term: in multiple places in multiple defniitions
            Terms.csv - listing of term id and term plaintext
            Term_entities.csv - ID of term, chac position,
            Definitions.csv - start/end position, Term ID.
        - (3) Term_entities.csv, Def_entities.csv
            Term_entities.csv -  ID, multiple rows for the same word ID
            Def_entities.csv -  ID for Term,
    """

    @staticmethod
    def get_name() -> str:
        return "detect-definitions"

    @staticmethod
    def get_description() -> str:
        return "Predict term and definition pairs from extracted sentences"

    def get_arxiv_ids_dirkey(self) -> str:
        return "detected-sentences"

    def load(self) -> Iterator[FindSentencesTask]:
        for arxiv_id in self.arxiv_ids:

            output_dir = directories.arxiv_subdir("detected-definitions", arxiv_id)
            file_utils.clean_directory(output_dir)

            detected_sentences_path = os.path.join(
                directories.arxiv_subdir("detected-sentences", arxiv_id),
                "entities.csv",
            )

            # from pdb import set_trace; set_trace()
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

            yield FindSentencesTask(arxiv_id, sentences)

    def process(
        self, item: FindSentencesTask, verbose: bool = False
    ) -> Iterator[DefinitionSentencePair]:
        sentences_ordered = iter(sorted(item.sentences, key=lambda s: s.start))

        if len(item.sentences) == 0:
            logging.warning(  # pylint: disable=logging-not-lazy
                "No sentences found for arXiv ID %s. Skipping detection of sentences "
                + "that contain entities.",
                # item.tex_path,
                item.arxiv_id,
            )
            return

        # load pre-trained DefinitoinModel
        nlp_model = DefinitionModel()

        term_index_count, definition_index_count = 0, 0
        for sid, sentence in enumerate(sentences_ordered):

            if not sentence.is_sentence:
                continue

            # extract nlp features from raw text
            featurized_text = nlp_model.featurize(sentence.text)

            # predict terms and definitions from the featurized text
            intent_pred, slot_preds = nlp_model.predict_one(featurized_text)

            if verbose:
                print(sentence.text)
                for k, v in featurized_text.items():
                    print(k, v)
                print(intent_pred)
                print(slot_preds)
                print()

            # TODO add batch processing for speed-up
            intent_pred_first = intent_pred[0]
            slot_preds_first = slot_preds[0]

            # intent prediction whether the sentence includes a definition or not
            intent = True if intent_pred_first == 1 else False

            # we only care when predicted slots include both 'TERM' and 'DEFINITION', otherwise ignore
            if "TERM" not in slot_preds_first and "DEF" not in slot_preds_first:
                continue

            slot_dict_list = process_term_definition_slot(
                sentence.text, featurized_text, slot_preds_first, verbose=False
            )

            for slot_dict in slot_dict_list:
                yield DefinitionSentencePair(
                    id_=sid,
                    start=sentence.start,
                    end=sentence.end,
                    tex_path=sentence.tex_path,
                    sentence_index=sentence.id_,
                    sentence_text=sentence.text,
                    intent=intent,
                    term_index=term_index_count,
                    term_start=slot_dict.get("term_start", None),
                    term_end=slot_dict.get("term_end", None),
                    term_text=slot_dict.get("term_text", None),
                    term_type=slot_dict.get("term_type", None),
                    definition_index=definition_index_count,
                    definition_start=slot_dict.get("definition_start", None),
                    definition_end=slot_dict.get("definition_end", None),
                    definition_text=slot_dict.get("definition_text", None),
                    definition_type=slot_dict.get("definition_type", None),
                )

            term_index_count += 1
            definition_index_count += 1

    def save(self, item: FindSentencesTask, result: DefinitionSentencePair) -> None:
        output_dir = directories.arxiv_subdir("detected-definitions", item.arxiv_id)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        entity_sentences_path = os.path.join(output_dir, "TermsDefinitions.csv",)

        file_utils.append_to_csv(
            entity_sentences_path,
            DefinitionSentencePair(
                result.id_,
                result.start,
                result.end,
                result.tex_path,
                result.sentence_index,
                result.sentence_text,
                result.intent,
                result.term_index,
                result.term_start,
                result.term_end,
                result.term_text,
                result.term_type,
                result.definition_index,
                result.definition_start,
                result.definition_end,
                result.definition_text,
                result.definition_type,
            ),
        )
