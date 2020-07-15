import logging
import os.path
from dataclasses import dataclass
from typing import Iterator, List, Tuple, DefaultDict, Dict, Any
from collections import defaultdict

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId, RelativePath, SerializableEntity
from entities.sentences.types import Sentence

from tqdm import tqdm

from .types import Definition
from .nlp_tools import DefinitionModel


@dataclass(frozen=True)
class DetectDefinitionsTask:
    arxiv_id: ArxivId
    sentences: List[Sentence]
    # tex_path: RelativePath


@dataclass(frozen=True)
class TermDefinitionSentencePair:
    id_: int
    start: int
    end: int
    tex_path: str
    tex: str
    context_tex: str
    sentence_index: str
    text: str

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


@dataclass(frozen=True)
class TermSentencePair:
    id_: int
    start: int
    end: int
    tex_path: str
    tex: str
    context_tex: str
    sentence_index: str
    text: str

    # whether to include a definition or not
    intent: bool
    # term related attributes
    term_index: int
    term_start: int
    term_end: int
    term_text: str
    # term_confidence: float
    term_type: str


@dataclass(frozen=True)
class DefinitionSentencePair:
    id_: int
    start: int
    end: int
    tex_path: str
    tex: str
    context_tex: str
    sentence_index: str
    text: str

    # whether to include a definition or not
    intent: bool
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

#TODO separate csv files for terms and definitions
#TODO aggregation over terms/definitions (e.g., coreference links)

#TODO update docker file for dependencies
#TODO add model location in README.md and config.ini



def find_start_end_indexes_for_tokens_in_text(text: str, tokens: List[str]) -> List[Tuple[int, int]]:
    """
        Extract start and end charcter positions for each token in featurized tokens
    """
    indexes = []
    current_position = 0
    for token in tokens:
        start_index = text[current_position:].index(token)
        indexes.append(
            (
                current_position + start_index,
                current_position + start_index + len(token) - 1,
            )
        )
        current_position += len(token)
    return indexes


def mapping_slots_with_text(
    text: str,
    featurized_text: Dict[Any,Any],
    slot_preds: List[str],
    verbose: bool = False,
) -> List[Dict[Any,Any]]:
    # make index function to original text for each token of featurized text
    indexes = find_start_end_indexes_for_tokens_in_text(text, featurized_text["tokens"])

    # extract multiple terms or definitions
    terms, definitions = [], []
    term, definition = [], []
    for index, (slot, token, start_end_index_pair) in enumerate(
        zip(slot_preds, featurized_text["tokens"], indexes)
    ):
        if slot == "TERM":
            term.append(start_end_index_pair)
        if slot == "DEF":
            definition.append(start_end_index_pair)
        if slot == "O":
            if len(term) > 0:
                terms.append(term)
            if len(definition) > 0:
                definitions.append(definition)
            term, definition = [], []

    # Currently, match pairs of term and definitions sequentially ( O T O O D then (T, D))
    # TODO need to handle multi-term/definitions pairs
    # TODO add confidence scores for term/definition predictions
    # TODO add type classifier for term/definition
    num_term_definition_pair = min(len(terms), len(definitions))
    slot_dict_list = []
    for td_pair in range(num_term_definition_pair):
        if verbose:
            logging.info(featurized_text["tokens"])
            logging.info(text)
            logging.info(slot_preds)
            logging.info("{} out of {}".format(td_pair, num_term_definition_pair))

        term_index_list = [t for t in terms[td_pair]]
        definition_index_list = [t for t in definitions[td_pair]]

        # TermDefinition case
        slot_dict = {}
        slot_dict["term_start"] = min([idx[0] for idx in term_index_list])
        slot_dict["term_end"] = max([idx[1] for idx in term_index_list]) + 1
        slot_dict["term_text"] = text[
            slot_dict["term_start"] : slot_dict["term_end"]  ]
        slot_dict["term_type"] = None
        # slot_dict['term_confidence'] = 0.0

        slot_dict["definition_start"] = min([idx[0] for idx in definition_index_list])
        slot_dict["definition_end"] = max([idx[1] for idx in definition_index_list]) + 1
        slot_dict["definition_text"] = text[
            slot_dict["definition_start"] : slot_dict["definition_end"]  ]
        slot_dict["definition_type"] = None
        # slot_dict['definition_confidence'] = 0.0

        slot_dict_list.append(slot_dict)

        # # Term and Definition case
        # term_dict = {}
        # term_dict["term_start"] = min([idx[0] for idx in term_index_list])
        # slot_dict["term_end"] = max([idx[1] for idx in term_index_list])
        # slot_dict["term_text"] = text[
            # slot_dict["term_start"] : slot_dict["term_end"] + 1 ]
        # slot_dict["term_type"] = None
        # slot_dict['term_confidence'] = 0.0


        #TODO save term_dict and definition_dict  separately in term_dict_list definition_dict_list
        #TODO how to store their mappings?

        if verbose:
            logging.info(text[slot_dict["term_start"] : slot_dict["term_end"] + 1])
            logging.info(text[slot_dict["definition_start"] : slot_dict["definition_end"] + 1])
            for k, v in slot_dict.items():
                logging.info("\t{}\t{}".format(k, v))

    return slot_dict_list


class DetectDefinitions(ArxivBatchCommand[DetectDefinitionsTask, TermDefinitionSentencePair]):
    """
    Extract definition sentences from Sentence using the pre-trained definition extraction model.
    Basic steps:
        - load cleaned sentences from detected-sentences
        - extract features from each sentence (aka featurization)
        - load the pre-trained nlp model, load the faetures, and predict intent and term:definition slots
            - intent: whether a sentence includes a definition or not
            - slots: tag for each token (TERM, DEFINITION, neither)
        - save detected terms in terms.csv and detected definitions definitions.csv
    """

    @staticmethod
    def get_name() -> str:
        return "detect-definitions"

    @staticmethod
    def get_description() -> str:
        return "Predict term and definition pairs from extracted sentences"

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

            yield DetectDefinitionsTask(arxiv_id, sentences)

    def process(
        self, item: DetectDefinitionsTask, verbose: bool = False
    ) -> Iterator[TermDefinitionSentencePair]:
        sentences_ordered = sorted(item.sentences, key=lambda s: s.start)
        num_sentences = len(sentences_ordered)
        sentences_ordered_iterator = iter(sentences_ordered)

        if len(item.sentences) == 0:
            logging.warning(  # pylint: disable=logging-not-lazy
                "No sentences found for arXiv ID %s. Skipping detection of sentences "
                + "that contain entities.",
                # item.tex_path,
                item.arxiv_id,
            )
            return


        # load pre-trained definition extraction model
        nlp_model = DefinitionModel()

        # infer terms and definitions for each sentence using the pre-trained definition extraction model
        definitions = []
        termdefinition_index_count = 0
        term_index_count = 0
        definition_index_count = 0
        batch_size = 8 #TODO make this as an argument
        features = []
        sentences = []
        with tqdm(total=num_sentences) as sentence_iter:
            for sid, sentence_obj in enumerate(sentences_ordered_iterator):
                sentence_iter.update(1)

                if not sentence_obj.is_sentence or sentence_obj.text == "":
                    continue

                # extract nlp features from raw text
                featurized_text = nlp_model.featurize(sentence_obj.text)

                features.append(featurized_text)
                sentences.append(sentence_obj)

                if len(features) >= batch_size or sid == num_sentences-1:
                    # predict terms and definitions from the featurized text
                    intent_pred_list, slot_preds_list = nlp_model.predict_batch(features)

                    for sentence, feature, intent_pred, slot_preds in zip(sentences, features, intent_pred_list, slot_preds_list):
                        # intent prediction whether the sentence includes a definition or not
                        intent = True if intent_pred == 1 else False

                        # we only care when predicted slots include both 'TERM' and 'DEFINITION', otherwise ignore
                        if "TERM" not in slot_preds and "DEF" not in slot_preds:
                            continue

                        slot_dict_list = mapping_slots_with_text(
                            sentence.text, feature, slot_preds, verbose=False
                        )

                        if verbose:
                            logging.info('is_sentence={}, text={}'.format(sentence.is_sentence, sentence.text))
                            for k, v in feature.items():
                                logging.info('{}\t{}'.format(k,v))
                            logging.info(intent_pred)
                            logging.info(slot_preds)


                        for slot_dict in slot_dict_list:
                            definitions.append( TermDefinitionSentencePair(
                                id_=termdefinition_index_count,
                                start=sentence.start,
                                end=sentence.end,
                                tex_path=sentence.tex_path,
                                sentence_index=sentence.id_,
                                text=sentence.text,
                                tex=sentence.tex,
                                context_tex=sentence.context_tex,
                                #TODO logging conflict issue
                                #TODO plus start_end for {term,definition}_{start,end}
                                #TODO use gpu/cpu

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
                            ))

                            termdefinition_index_count += 1
                            term_index_count += 1
                            definition_index_count += 1

                    features = []
                    sentences = []

        logging.info('Total number of definitions {} out of {} sentences'.format(
            len(definitions), num_sentences))


        # aggregate similar terms and assign group IDs for semanticaly similar terms


        # yielding the output definition
        for definition in definitions:
            yield definition


    def save(self, item: DetectDefinitionsTask, result: TermDefinitionSentencePair) -> None:
        output_dir = directories.arxiv_subdir("detected-definitions", item.arxiv_id)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        entity_sentences_path = os.path.join(output_dir, "entities.csv",)

        file_utils.append_to_csv(
            entity_sentences_path,
            TermDefinitionSentencePair(
                result.id_,
                result.start,
                result.end,
                result.tex_path,
                result.tex,
                result.context_tex,
                result.sentence_index,
                result.text,
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
