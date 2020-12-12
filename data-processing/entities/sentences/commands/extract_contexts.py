import glob
import logging
import os.path
from abc import abstractmethod
from collections import defaultdict
from dataclasses import dataclass
from typing import Any, Callable, Dict, Iterator, List, Optional, Type

from common import directories, file_utils
from common.colorize_tex import wrap_span
from common.commands.base import ArxivBatchCommand
from common.parse_tex import overlaps
from common.types import ArxivId, RelativePath, SerializableEntity

from ..types import Context, Sentence, TexWrapper


@dataclass(frozen=True)
class Task:
    arxiv_id: ArxivId
    tex_path: RelativePath
    entities: List[SerializableEntity]
    sentences: List[Sentence]


SentenceId = str
EntityKey = Any


class ExtractContextsCommand(ArxivBatchCommand[Task, Context]):
    """
    Extract contexts in which entities appear in the paper. This command is meant to be
    used as a part of the pipelines for collecting descriptive data for other entities.
    """

    @abstractmethod
    def get_entity_name(self) -> str:
        " Get the key for the type of entity for which contexts will be extracted. "

    @abstractmethod
    def get_wrapper(
        self, entity: SerializableEntity
    ) -> Optional[TexWrapper]:  # pylint: disable=unused-argument
        """
        Override this method to insert custom TeX before and after each appearance of the entity in
        the TeX, i.e., to add custom styling around the entity where it appears in the TeX.
        """

    def get_key(self, entity: SerializableEntity) -> Any:
        """
        Get key that can be used to compare entities for semantic equality. Used when composing
        text snippets to determine whether two entities refer to the same thing. For example,
        a key for symbols might be the symbol's MathML, so that other symbols with the same
        MathML also get highlighted in the snippet. Override this to use a custom key.
        """
        return entity.tex

    def load(self) -> Iterator[Task]:

        for arxiv_id in self.arxiv_ids:

            output_dir = directories.arxiv_subdir(
                f"contexts-for-{self.get_entity_name()}", arxiv_id
            )
            file_utils.clean_directory(output_dir)

            # Load entities from file.
            # Load in all extracted entities. See note in 'colorize_tex.py' for why entities
            # might be saved in multiple files. If they are, for this upload function to work,
            # each of the entities need to have a unique pair of 'ID' and 'tex_path'.
            entities_dir = directories.arxiv_subdir(
                f"detected-{self.get_entity_name()}", arxiv_id
            )
            entities: List[SerializableEntity] = []
            for entities_path in glob.glob(os.path.join(entities_dir, "entities*.csv")):
                entities.extend(
                    file_utils.load_from_csv(entities_path, SerializableEntity)
                )

            # Load sentences from file.
            sentences_path = os.path.join(
                directories.arxiv_subdir("detected-sentences", arxiv_id), "entities.csv"
            )
            try:
                sentences = list(file_utils.load_from_csv(sentences_path, Sentence))
            except FileNotFoundError:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "No sentences data found for arXiv paper %s. Try re-running the pipeline, "
                    + "this time enabling the processing of sentences. If that doesn't work, "
                    + "there was likely an error in detecting sentences for this paper.",
                    arxiv_id,
                )
                continue

            tex_paths = {e.tex_path for e in entities}
            for tex_path in tex_paths:
                entities_for_file = [e for e in entities if e.tex_path == tex_path]
                sentences_for_file = [s for s in sentences if s.tex_path == tex_path]
                yield Task(arxiv_id, tex_path, entities_for_file, sentences_for_file)

    def process(self, item: Task) -> Iterator[Context]:
        sentences_ordered = iter(sorted(item.sentences, key=lambda s: s.start))
        sentences_by_id = {s.id_: s for s in item.sentences}
        entities_ordered = iter(sorted(item.entities, key=lambda e: e.start))

        # Entities, grouped by similarity and sentence.
        sentence_entities: Dict[
            SentenceId, Dict[EntityKey, List[SerializableEntity]]
        ] = {}

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
        sentence_entities[sentence.id_] = defaultdict(list)
        entity = next(entities_ordered)
        while True:
            try:
                if entity.start < sentence.start:
                    logging.warning(  # pylint: disable=logging-not-lazy
                        "Could not find sentence for entity from character %d to %d for arXiv "
                        + "paper %s.",
                        entity.start,
                        entity.end,
                        item.arxiv_id,
                    )
                    entity = next(entities_ordered)
                elif entity.start >= sentence.start and entity.end <= sentence.end:
                    sentence_entities[sentence.id_][self.get_key(entity)].append(entity)
                    entity = next(entities_ordered)
                else:
                    sentence = next(sentences_ordered)
                    sentence_entities[sentence.id_] = defaultdict(list)
            except StopIteration:
                break

        for sentence_id in sentence_entities:
            sentence = sentences_by_id[sentence_id]
            for entity_key in sentence_entities[sentence_id]:
                entities = sentence_entities[sentence_id][entity_key]

                # Assemble a snippet for this sentence with entity appearances highlighted.
                # Wrap all repeat appearances of the same entity in a tag that can be used
                # by the KaTeX browser-based LaTeX renderer to style the matches.
                snippet = sentence.tex
                wrapped_entities: List[SerializableEntity] = []
                for entity in sorted(entities, key=lambda e: e.start, reverse=True):
                    start_in_snippet = entity.start - sentence.start
                    end_in_snippet = entity.end - sentence.start
                    tex_wrapper = self.get_wrapper(entity)
                    if tex_wrapper is not None and not any(
                        [overlaps(entity, e) for e in wrapped_entities]
                    ):
                        snippet = wrap_span(
                            snippet,
                            start_in_snippet,
                            end_in_snippet,
                            before=tex_wrapper.before,
                            after=tex_wrapper.after,
                            braces=tex_wrapper.braces,
                        )
                        wrapped_entities.append(entity)

                for entity in entities:
                    neighbor_ids = [e.id_ for e in entities if e != entity]
                    yield Context(
                        tex_path=entity.tex_path,
                        entity_id=entity.id_,
                        sentence_id=sentence_id,
                        snippet=snippet,
                        neighbor_entity_ids=neighbor_ids,
                    )

    def save(self, item: Task, result: Context) -> None:
        output_dir = directories.arxiv_subdir(
            f"contexts-for-{self.get_entity_name()}", item.arxiv_id
        )
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        contexts_path = os.path.join(output_dir, "contexts.csv")
        file_utils.append_to_csv(contexts_path, result)


EntityKeyFunc = Callable[[SerializableEntity], Any]


def make_extract_contexts_command(
    entity_name: str,
    entity_key: Optional[EntityKeyFunc] = None,
    tex_wrapper: Optional[TexWrapper] = TexWrapper(before="**", after="**"),
) -> Type[ExtractContextsCommand]:
    class C(ExtractContextsCommand):
        @staticmethod
        def get_name() -> str:
            return f"extract-contexts-for-{entity_name}"

        def get_entity_name(self) -> str:
            return entity_name

        def get_key(self, entity: SerializableEntity) -> Any:
            if entity_key is None:
                return super(C, C).get_key(self, entity)
            return entity_key(entity)

        def get_wrapper(self, entity: SerializableEntity) -> Optional[TexWrapper]:
            return tex_wrapper

        @staticmethod
        def get_description() -> str:
            return f"Extract contexts for each appearance of {entity_name}."

        def get_arxiv_ids_dirkey(self) -> str:
            return f"detected-{entity_name}"

    return C
