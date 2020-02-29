import logging
import os.path
from abc import abstractmethod
from typing import Iterator, Type

from command.command import DatabaseUploadCommand
from common import directories, file_utils
from common.types import (
    ColorizationRecord,
    EntityInfo,
    EntityUploadCallable,
    HueLocationInfo,
    PaperProcessingSummary,
)


class UploadEntitiesCommand(DatabaseUploadCommand[PaperProcessingSummary, None]):
    @abstractmethod
    def get_colorized_sources_dirkey(self) -> str:
        """
        Key for the data directory containing colorized sources.
        """

    @abstractmethod
    def get_hue_locations_dirkey(self) -> str:
        """
        Key for the data directory containing hue locations for entities.
        """

    def load(self) -> Iterator[PaperProcessingSummary]:
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

            # Load the source colorization records
            entity_hues_path = os.path.join(
                directories.arxiv_subdir(self.get_colorized_sources_dirkey(), arxiv_id),
                "entity_hues.csv",
            )
            colorization_records = list(
                file_utils.load_from_csv(entity_hues_path, ColorizationRecord)
            )

            # Load the entity locations
            hue_locations_path = os.path.join(
                directories.arxiv_subdir(self.get_hue_locations_dirkey(), arxiv_id),
                "hue_locations.csv",
            )
            hue_location_infos = list(
                file_utils.load_from_csv(hue_locations_path, HueLocationInfo)
            )

            # Group each colorization record with boxes found for that colorization cycle.
            entity_infos = []
            for colorization_record in colorization_records:
                matching_hue_location_infos = []
                for hue_location_info in hue_location_infos:
                    if (
                        colorization_record.hue == hue_location_info.hue
                        and colorization_record.iteration == hue_location_info.iteration
                    ):
                        matching_hue_location_infos.append(hue_location_info)
                entity_infos.append(
                    EntityInfo(colorization_record, matching_hue_location_infos)
                )

            yield PaperProcessingSummary(
                arxiv_id=arxiv_id, s2_id=s2_id, entity_infos=entity_infos,
            )

    def process(self, _: PaperProcessingSummary) -> Iterator[None]:
        yield None


def make_upload_entities_command(
    entity_name: str, entity_type: str, upload_func: EntityUploadCallable,
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
            return f"Upload {entity_name} and their locationsto the database."

        @staticmethod
        def get_entity_type() -> str:
            return entity_type

        def get_arxiv_ids_dirkey(self) -> str:
            return self.get_hue_locations_dirkey()

        @abstractmethod
        def get_colorized_sources_dirkey(self) -> str:
            return f"sources-with-colorized-{entity_name}"

        @abstractmethod
        def get_hue_locations_dirkey(self) -> str:
            return f"hue-locations-for-{entity_name}"

        def save(self, item: PaperProcessingSummary, _: None) -> None:
            upload_func(item)

    return C
