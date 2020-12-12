import glob
import logging
import os.path
from abc import abstractmethod
from typing import Dict, Iterator, List, Optional, Type, Union

from common import directories, file_utils
from common.commands.database import DatabaseUploadCommand
from common.types import (
    Context,
    EntityExtractionResult,
    EntityLocationInfo,
    EntityUploadCallable,
    PaperProcessingResult,
    SerializableEntity,
)


class UploadEntitiesCommand(DatabaseUploadCommand[PaperProcessingResult, None]):
    @staticmethod
    @abstractmethod
    def get_entity_name() -> str:
        """
        Get the name of the type of entity that will be processed in this command. This name will
        be used to determine the names of input directories to read, and output directories to
        write to.
        """

    @staticmethod
    def get_detected_entity_type(
        entity_filename: Optional[str] = None,  # pylint: disable=unused-argument
    ) -> Type[SerializableEntity]:
        """
        Override this method if you need access to entity data that are present on a subclass of
        'SerializableEntity'. For example, if you need to access the text for an extracted text when
        you're uploading that sentence, this function should return the 'Sentence' type.
        """
        return SerializableEntity

    def load(self) -> Iterator[PaperProcessingResult]:
        for arxiv_id in self.arxiv_ids:

            # Load the S2 ID for this paper
            s2_id_path = os.path.join(
                directories.arxiv_subdir("s2-metadata", arxiv_id), "s2_id"
            )
            if not os.path.exists(s2_id_path):
                logging.warning("Could not find S2 ID file for %s. Skipping", arxiv_id)
                continue
            with open(s2_id_path) as s2_id_file:
                s2_id = s2_id_file.read()

            # Load in all extracted entities. See note in 'colorize_tex.py' for why entities
            # might be saved in multiple files. If they are, for this upload function to work,
            # each of the entities need to have a unique pair of 'ID' and 'tex_path'.
            entities_dir = directories.arxiv_subdir(
                f"detected-{self.get_entity_name()}", arxiv_id
            )
            entities: List[SerializableEntity] = []
            for entities_path in glob.glob(os.path.join(entities_dir, "entities*.csv")):
                entities.extend(
                    file_utils.load_from_csv(
                        entities_path,
                        self.get_detected_entity_type(os.path.basename(entities_path)),
                    )
                )

            # Load locations for entities.
            locations_path = os.path.join(
                directories.arxiv_subdir(
                    f"{self.get_entity_name()}-locations", arxiv_id
                ),
                "entity_locations.csv",
            )
            if not os.path.exists(locations_path):
                logging.warning(  # pylint: disable=logging-not-lazy
                    "No locations have been saved for entities in command '%s' for paper %s. No entities "
                    + "will be uploaded for this paper.",
                    str(self.get_name()),
                    arxiv_id,
                )
                continue
            entity_location_infos = list(
                file_utils.load_from_csv(locations_path, EntityLocationInfo)
            )

            # Load in contexts for all entities.
            contexts_loaded = False
            contexts_by_entity = {}
            if directories.registered(f"contexts-for-{self.get_entity_name()}"):
                contexts_path = os.path.join(
                    directories.arxiv_subdir(
                        f"contexts-for-{self.get_entity_name()}", arxiv_id
                    ),
                    "contexts.csv",
                )
                if os.path.exists(contexts_path):
                    contexts = file_utils.load_from_csv(contexts_path, Context)
                    contexts_by_entity = {c.entity_id: c for c in contexts}
                    contexts_loaded = True

            if not contexts_loaded:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "No contexts have been saved for entities in command '%s' for paper %s. No "
                    + "contexts will be saved for any of these entities.",
                    str(self.get_name()),
                    arxiv_id,
                )

            # Group each entity with its location and context. Then pass all entity information to
            # the upload function.
            entity_summaries = []
            for entity in entities:
                matching_locations = []
                for h in entity_location_infos:
                    if h.entity_id == entity.id_ and h.tex_path == entity.tex_path:
                        matching_locations.append(h)

                entity_summaries.append(
                    EntityExtractionResult(
                        entity, matching_locations, contexts_by_entity.get(entity.id_)
                    )
                )

            yield PaperProcessingResult(
                arxiv_id=arxiv_id, s2_id=s2_id, entities=entity_summaries,
            )

    def process(self, _: PaperProcessingResult) -> Iterator[None]:
        yield None


DetectedEntityTypeArg = Union[
    Dict[str, Type[SerializableEntity]], Optional[Type[SerializableEntity]]
]


def make_upload_entities_command(
    entity_name: str,
    upload_func: EntityUploadCallable,
    DetectedEntityType: DetectedEntityTypeArg = None,
) -> Type[UploadEntitiesCommand]:
    """
    'upload_func' takes an entire batch of all entities processed for a paper at once. The designer
    of the 'upload_func' is encouraged to either use the 'upload_entities' convenience function
    to optimize uploads, as that function batches uploads of database rows.

    The upload command needs to know what type of entities it is loading from file if you plan to
    upload data specific to a type of entity (i.e., the name of a term, instead of just its
    bounding boxes and TeX character positions). Specify the type of the entity that should be loaded
    using 'DetectedEntityType'. This can either be a single type or, if the detector produced
    multiple types of entities, a dictionary mapping file names to entity types
    (for example: {'entities-terms.csv': Term}).
    """

    class C(UploadEntitiesCommand):
        @staticmethod
        def get_name() -> str:
            return f"upload-{entity_name}"

        @staticmethod
        def get_description() -> str:
            return f"Upload {entity_name} and their locations to the database."

        def get_arxiv_ids_dirkey(self) -> str:
            return f"{entity_name}-locations"

        @staticmethod
        def get_detected_entity_type(
            entity_filename: Optional[str] = None,
        ) -> Type[SerializableEntity]:
            if entity_filename is None or DetectedEntityType is None:
                return super(C, C).get_detected_entity_type(entity_filename)
            if isinstance(DetectedEntityType, dict):
                try:
                    return DetectedEntityType[entity_filename]
                except KeyError:
                    logging.warning(  # pylint: disable=logging-not-lazy
                        "No entity type specified for file %s. Only generic entity properties "
                        + "will be loaded for entities from file %s.",
                        entity_filename,
                        entity_filename,
                    )
                    return super(C, C).get_detected_entity_type(entity_filename)
            return DetectedEntityType

        @staticmethod
        def get_entity_name() -> str:
            return entity_name

        def save(self, item: PaperProcessingResult, _: None) -> None:
            upload_func(item, self.args.data_version)

    return C
