import logging
import os.path
from abc import abstractmethod
from dataclasses import dataclass
from typing import Iterator, List, Type

import pysbd

from common.parse_tex import DEFAULT_CONTEXT_SIZE, EntityExtractor, PlaintextExtractor

from .types import Definition

# from ..sentences.types import Sentence


from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId #, SymbolWithId
from common.types import ArxivId, RelativePath, SerializableEntity

# from entities.sentences.commands.find_entity_sentences import EntitySentencePairIds

from entities.sentences.types import Sentence

@dataclass(frozen=True)
class FindSentencesTask:
    arxiv_id: ArxivId
    # tex_path: RelativePath
    sentences: List[Sentence]


@dataclass(frozen=True)
class DefinitionSentencePair:
    # tex_path: str
    # sentence_index: int
    # definition_index: int
    # sentence_id: str
    sentence: Sentence


# @dataclass(frozen=True)
# class TokenId:
    # tex_path: str
    # equation_index: int
#     token_index: int



class DetectedDefinitions(ArxivBatchCommand[FindSentencesTask, DefinitionSentencePair]):
    """
    Extract definition sentences from Sentence using the pre-trained definition extraction model.


    Takes as input the sentences
    Logic for this
        Tokenize the sentences
        Featurize the sentences
        Get predictions from the pre-trained model
    For each one, yields two types of entities
        Fields for Definition/Term class
            {start,end}_{term,definition}
            confidence_{term,definition{
            sentence_id
            etc
        Definition [might be of multiple types: appositions, explanations, formulae, ...]
            Saved with the original TeX positions of the tokens
            Start
        End
            Term
            Saved with the original TeX positions of the tokens
    Comments:

        TermDefinition.csv Range for Term/Definition
        Term.csv, Definition.csv
            Each term: in multiple places
                        in multiple defniitions
        Terms.csv - listing of term id and term plaintext
        Term_entities.csv - ID of term, chac position,
        Definitions.csv - start/end position, Term ID.

        Term_entities.csv -  ID, multiple rows for the same word ID
        Def_entities.csv -  ID for Term,


    """


    @staticmethod
    def get_name() -> str:
        return "detected-definitions"

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
                "No sentences found for file %s for arXiv ID %s. Skipping detection of sentences "
                + "that contain entities.",
                item.tex_path,
                item.arxiv_id,
            )
            return


        sentence = next(sentences_ordered)

        from pdb import set_trace; set_trace()
        while True:
            try:
                # if entity.start >= sentence.start and entity.end <= sentence.end:
                yield DefniitionSentencePair(sentence)
            except StopIteration:
                break


    def save(self, item: FindSentencesTask, result: DefinitionSentencePair) -> None:
        output_dir = directories.arxiv_subdir(
            'detected-definitions', item.arxiv_id
        )
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        entity_sentences_path = os.path.join(output_dir, "entities.csv",)
        file_utils.append_to_csv(
            entity_sentences_path,
            DefinitionSentencePairIds(
                # item.tex_path, result.entity.id_, result.sentence.id_
                result.sentence
            ),
        )





#     def parse(self) -> Iterator[Definition]:
        # for i, sentence in enumerate(segmenter.segment(plaintext)):
            # # The pysbd module has several open bugs and issues which are addressed below.
            # # As of 3/23/20 we know the module will fail in the following ways:
            # # 1. pysbd will not break up the sentence when it starts with a punctuation mark or space.
            # #    ex: ". hello. world. hi."
            # #    sol: check for sentences being longer than 1000 characters.
            # # 2. pysbd indexes are sometimes incorrectly set
            # #    ex: "hello. world. 1) item one. 2) item two. 3) item three" or "hello!!! world."
            # #    sol: set indexes manually using string search + sentence length
            # # 3. pysbd uses reserved characters for splitting sentences
            # #    ex: see PYSBD_RESERVED_CHARACTERS list.
            # #    sol: throw a warning if the sentence contains any of these characters.
            # if len(sentence) > 1000:
                # logging.warning(
                    # "Exceptionally long sentence (length %d), this might indicate the sentence extractor failed to properly split text into sentences.",
                    # len(sentence),
                # )

            # plaintext_start = plaintext.find(sentence, length_so_far_in_plain_text)
            # plaintext_end = plaintext_start + len(sentence)
            # if (
                # plaintext_start not in plaintext_to_tex_offset_map
                # or plaintext_end not in plaintext_to_tex_offset_map
            # ):
                # logging.warning(
                    # "A sentence boundary was incorrect for sentence %s. This is probably an issue with pysbd. Skipping sentence in extractor.",
                    # sentence,
                # )
                # continue
            # if plaintext_start - 500 > length_so_far_in_plain_text:
                # logging.warning(
                    # "Sentence boundary start for sentence %s was %d characters ahead of the previous sentence, this might indicate the sentence extractor failed to properly split text.",
                    # sentence,
                    # plaintext_start - length_so_far_in_plain_text,
                # )

            # start = plaintext_to_tex_offset_map[plaintext_start]
            # end = plaintext_to_tex_offset_map[plaintext_end]
            # length_so_far_in_plain_text = plaintext_end
            # tex_sub = tex[start:end]
            # context_tex = tex[start - DEFAULT_CONTEXT_SIZE : end + DEFAULT_CONTEXT_SIZE]
            # yield Sentence(
                # text=sentence,
                # # start=start,
                # # end=end,
                # id_=str(i),
                # tex_path=tex_path,
                # tex=tex_sub,
                # context_tex=context_tex,
            # )
