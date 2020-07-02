import logging
import os.path
from abc import abstractmethod
from dataclasses import dataclass
from typing import Iterator, List, Type
import pysbd

from common import directories, file_utils
from common.parse_tex import DEFAULT_CONTEXT_SIZE, EntityExtractor, PlaintextExtractor
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId #, SymbolWithId
from common.types import ArxivId, RelativePath, SerializableEntity
from entities.sentences.types import Sentence
from .types import Definition
from .nlp_tools import DefinitionModel

@dataclass(frozen=True)
class FindSentencesTask:
    arxiv_id: ArxivId
    # tex_path: RelativePath
    sentences: List[Sentence]


@dataclass(frozen=True)
class DefinitionSentencePair:
    id_: int
    start: int
    end: int
    tex_path: str
    sentence_index: int
    sentence_text: str

    intent: bool

    term_index: int
    term_start: int
    term_end: int
    term_text: str
    # term_confidence: float
    term_type: str

    definition_index: int
    definition_start: int
    definition_end: int
    definition_text: str
    # definition_confidence: float
    definition_type: str


# @dataclass(frozen=True)
# class TokenId:
    # tex_path: str
    # equation_index: int
#     token_index: int





# term_start, term_end, term_text, term_type = \
def process_term_slot(text, featurized_text, slot_preds):
    print(featurized_text['tokens'])
    print(text)
    print(slot_preds)
    from pdb import set_trace; set_trace()

    # make mapping function between raw text and featurized text


    for index, (slot, token) in enumerate(zip(slot_preds, featurized_text['tokens'])):
        if slot == 'TERM':


    return 0, 0, "", ""

def process_definition_slot(text, featurized_text, slot_preds):
    return 0, 0, "", ""


class DetectedDefinitions(ArxivBatchCommand[FindSentencesTask, DefinitionSentencePair]):
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

    def load(self) -> Iterator[Definition]:
        for arxiv_id in self.arxiv_ids:

            output_dir = directories.arxiv_subdir("detected-definitions", arxiv_id)
            file_utils.clean_directory(output_dir)

            detected_sentences_path = os.path.join(
                directories.arxiv_subdir("detected-sentences", arxiv_id),
                "entities.csv",
            )

            try:
                sentences = list(file_utils.load_from_csv(detected_sentences_path, Sentence))
            except FileNotFoundError:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "No sentences data found for arXiv paper %s. Try re-running the pipeline, "
                    + "this time enabling the processing of sentences. If that doesn't work, "
                    + "there is likely an error in detected sentences for this paper.",
                    arxiv_id,
                )
                continue

            yield FindSentencesTask(
                arxiv_id, sentences
            )



    def process(self, item: FindSentencesTask) -> Iterator[DefinitionSentencePair]:
        sentences_ordered = iter(sorted(item.sentences, key=lambda s: s.start))

        if len(item.sentences) == 0:
            logging.warning(  # pylint: disable=logging-not-lazy
                "No sentences found for arXiv ID %s. Skipping detection of sentences "
                + "that contain entities.",
                #item.tex_path,
                item.arxiv_id,
            )
            return

        # load pre-trained DefinitoinModel
        nlp_model = DefinitionModel()

        verbose = False
        term_index_count, definition_index_count = 0, 0
        for sid, sentence in enumerate(sentences_ordered):
            # TODO FIXME fake heuristic to capture sentence-like lines. This should be removed once PR #120 is merged to master
            if len(sentence.text) < 60:
                continue

            # extract nlp features from raw text
            featurized_text = nlp_model.featurize(sentence.text)
            # predict terms and definitions from the featurized text
            intent_pred, slot_preds = nlp_model.predict_one(featurized_text)

            # TODO delete these lines
            if verbose:
                print(sentence.text)
                for k,v in featurized_text.items():
                    print(k,v)
                print(intent_pred)
                print(slot_preds)
                print()

            # TODO add batch processing for speed-up
            intent_pred = intent_pred[0]
            slot_preds = slot_preds[0]

            # intent prediction whether the sentence includes a definition or not
            intent = True if intent_pred==1 else False

            # we only care when predicted slots include both 'TERM' and 'DEFINITION', otherwise ignore
            if 'TERM' not in slot_preds and 'DEF' not in slot_preds:
                continue

            #TODO support multiple term/definition pairs, currently only support for single cases
            term_start, term_end, term_text, term_type = \
                process_term_slot(sentence.text, featurized_text, slot_preds)
            definition_start, definition_end, definition_text, definition_type = \
                process_definition_slot(sentence.text, featurized_text, slot_preds)

            # #TODO add confidence scores for term/definition predictions
            # term_confidence, definition_confidence = 0.0, 0.0

            yield DefinitionSentencePair(
                id_=sid,
                term_index=term_index_count,
                term_start=term_start,
                term_end=term_end,
                term_text=term_text,
                term_type=term_type,
                definition_index=definition_index_count,
                definition_start=definition_start,
                definition_end=definition_end,
                definition_type=definition_type,

                start=sentence.start,
                end=sentence.end,
                tex_path=sentence.tex_path,
                sentence_index=sentence.id_,
                sentence_text=sentence.text
            )

            term_index_count += 1
            definition_index_count += 1




    def save(self, item: FindSentencesTask, result: DefinitionSentencePair) -> None:
        output_dir = directories.arxiv_subdir(
            'detected-definitions', item.arxiv_id
        )
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        entity_sentences_path = os.path.join(output_dir, "TermsDefinitions.csv",)

        # from pdb import set_trace; set_trace()
        file_utils.append_to_csv(
            entity_sentences_path,
            DefinitionSentencePair(
                result.id_,
                result.start,
                result.end,
                result.tex_path,
                result.sentence_index,
                result.sentence_text
            ),
        )


