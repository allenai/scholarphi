import logging
import os.path
from abc import abstractmethod
from typing import Iterator, Optional, Type

from common import directories, file_utils
from common.commands.database import DatabaseUploadCommand
from common.types import (EntityAndLocation, EntityUploadCallable,
                          HueLocationInfo, PaperProcessingResult,
                          SerializableEntity)


class UploadEntitiesCommand(DatabaseUploadCommand[PaperProcessingResult, None]):
    @abstractmethod
    def get_detected_entities_dirkey(self) -> str:
        """
        Key for the data directory containing a list of detected entities.
        """

    @abstractmethod
    def get_hue_locations_dirkey(self) -> str:
        """
        Key for the data directory containing hue locations for entities.
        """

    @staticmethod
    def get_detected_entity_type() -> Type[SerializableEntity]:
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

            # Load in all extracted entities.
            entities_path = os.path.join(
                directories.arxiv_subdir(self.get_detected_entities_dirkey(), arxiv_id),
                "entities.csv",
            )
            entities = list(
                file_utils.load_from_csv(entities_path, self.get_detected_entity_type())
            )

            # Load in locations of all detected hues.
            hue_locations_path = os.path.join(
                directories.arxiv_subdir(self.get_hue_locations_dirkey(), arxiv_id),
                "hue_locations.csv",
            )
            hue_location_infos = list(
                file_utils.load_from_csv(hue_locations_path, HueLocationInfo)
            )

            # Group each entity with its location. Pass the entity information, and the detected
            # locations for the entity, to the upload function.
            localized_enitites = []
            for entity in entities:
                matching_locations = []
                for h in hue_location_infos:
                    if h.entity_id == entity.id_ and h.tex_path == entity.tex_path:
                        matching_locations.append(h)

                localized_enitites.append(EntityAndLocation(entity, matching_locations))

            yield PaperProcessingResult(
                arxiv_id=arxiv_id, s2_id=s2_id, localized_entities=localized_enitites,
            )

    def process(self, _: PaperProcessingResult) -> Iterator[None]:
        yield None


def make_upload_entities_command(
    entity_name: str,
    upload_func: EntityUploadCallable,
    DetectedEntityType: Optional[Type[SerializableEntity]] = None,
) -> Type[UploadEntitiesCommand]:
    """
    'upload_func' takes an entire batch of all entities processed for a paper at once. The designer
    of the 'upload_func' is encouraged to optimize uploads to the database by batching uploads.
    """

    class C(UploadEntitiesCommand):
        @staticmethod
        def get_name() -> str:
            return f"upload-{entity_name}"

        @staticmethod
        def get_description() -> str:
            return f"Upload {entity_name} and their locations to the database."

        def get_arxiv_ids_dirkey(self) -> str:
            return self.get_hue_locations_dirkey()

        @staticmethod
        def get_detected_entity_type() -> Type[SerializableEntity]:
            if DetectedEntityType is None:
                return super(C, C).get_detected_entity_type()
            return DetectedEntityType

        def get_detected_entities_dirkey(self) -> str:
            return f"detected-{entity_name}"

        def get_hue_locations_dirkey(self) -> str:
            return f"hue-locations-for-{entity_name}"

        def save(self, item: PaperProcessingResult, _: None) -> None:
            upload_func(item)

    return C
