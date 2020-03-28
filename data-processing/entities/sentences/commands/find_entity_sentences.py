import logging
import os.path
from abc import abstractmethod
from dataclasses import dataclass
from typing import Iterator, List, Type

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId, RelativePath, SerializableEntity

from ..types import Sentence


@dataclass(frozen=True)
class FindSentencesTask:
    arxiv_id: ArxivId
    tex_path: RelativePath
    entities: List[SerializableEntity]
    sentences: List[Sentence]


@dataclass(frozen=True)
class EntitySentencePair:
    entity: SerializableEntity
    sentence: Sentence


@dataclass(frozen=True)
class EntitySentencePairIds:
    tex_path: str
    entity_id: str
    sentence_id: str


class FindEntitySentencesCommand(
    ArxivBatchCommand[FindSentencesTask, EntitySentencePair]
):
    """
    This command is not used as part of the setence pipeline. Instead, it's an abstract command to be
    used in other entity pipelines to find out which sentences an extracted entity appears within,
    if other pipelines need such information. If detected entities can fit in multiple sentences
    (i.e. if by some unexpected circumstance there are multiple overlapping sentences), this
    command only matches the entity to the first containing sentence.
    """

    @abstractmethod
    def get_detected_entities_dirkey(self) -> str:
        """
        Key for the data directory containing entities for which sentences should be found.
        """

    @abstractmethod
    def get_output_base_dirkey(self) -> str:
        """
        Key for the data directory in which to output entity-sentence pairs.
        """

    def load(self) -> Iterator[FindSentencesTask]:

        for arxiv_id in self.arxiv_ids:

            output_dir = directories.arxiv_subdir(
                self.get_output_base_dirkey(), arxiv_id
            )
            file_utils.clean_directory(output_dir)

            entities_path = os.path.join(
                directories.arxiv_subdir(self.get_detected_entities_dirkey(), arxiv_id),
                "entities.csv",
            )
            entities = list(file_utils.load_from_csv(entities_path, SerializableEntity))

            sentences_path = os.path.join(
                directories.arxiv_subdir("detected-sentences", arxiv_id), "entities.csv"
            )
            try:
                sentences = list(file_utils.load_from_csv(sentences_path, Sentence))
            except FileNotFoundError:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "No sentences data found for arXiv paper %s. Try re-running the pipeline, "
                    + "this time enabling the processing of sentences. If that doesn't work, "
                    + "there is likely an error in detected sentences for this paper.",
                    arxiv_id,
                )
                continue

            tex_paths = {e.tex_path for e in entities}
            for tex_path in tex_paths:
                entities_for_file = [e for e in entities if e.tex_path == tex_path]
                sentences_for_file = [s for s in sentences if s.tex_path == tex_path]
                yield FindSentencesTask(
                    arxiv_id, tex_path, entities_for_file, sentences_for_file
                )

    def process(self, item: FindSentencesTask) -> Iterator[EntitySentencePair]:
        sentences_ordered = iter(sorted(item.sentences, key=lambda s: s.start))
        entities_ordered = iter(sorted(item.entities, key=lambda e: e.start))

        if len(item.sentences) == 0:
            logging.warning(  # pylint: disable=logging-not-lazy
                "No sentences found for file %s for arXiv ID %s. Skipping detection of sentences "
                + "that contain entities.",
                item.tex_path,
                item.arxiv_id,
            )
            return
        if len(item.entities) == 0:
            logging.warning(  # pylint: disable=logging-not-lazy
                "No entities found for file %s for arXiv ID %s for sentence detection task."
                + "Skipping detection of sentences for this entity for this paper.",
                item.tex_path,
                item.arxiv_id,
            )
            return

        sentence = next(sentences_ordered)
        entity = next(entities_ordered)
        while True:
            try:
                if entity.start >= sentence.start and entity.end <= sentence.end:
                    yield EntitySentencePair(entity, sentence)
                    entity = next(entities_ordered)
                else:
                    sentence = next(sentences_ordered)
            except StopIteration:
                break

    def save(self, item: FindSentencesTask, result: EntitySentencePair) -> None:
        output_dir = directories.arxiv_subdir(
            self.get_output_base_dirkey(), item.arxiv_id
        )
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        entity_sentences_path = os.path.join(output_dir, "entity_sentences.csv",)
        file_utils.append_to_csv(
            entity_sentences_path,
            EntitySentencePairIds(
                item.tex_path, result.entity.id_, result.sentence.id_
            ),
        )


def make_find_entity_sentences_command(
    entity_name: str,
) -> Type[FindEntitySentencesCommand]:
    class C(FindEntitySentencesCommand):
        @staticmethod
        def get_name() -> str:
            return f"find-sentences-for-{entity_name}"

        @staticmethod
        def get_description() -> str:
            return f"Detect which sentences each of the {entity_name} appear within."

        def get_arxiv_ids_dirkey(self) -> str:
            return self.get_detected_entities_dirkey()

        def get_detected_entities_dirkey(self) -> str:
            return f"detected-{entity_name}"

        def get_output_base_dirkey(self) -> str:
            return f"sentences-for-{entity_name}"

    return C
