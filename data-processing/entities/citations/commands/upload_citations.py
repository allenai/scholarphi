import ast
import dataclasses
import json
import logging
import os.path
from typing import Dict, Iterator, List, cast

from common import directories, file_utils
from common.commands.database import DatabaseUploadCommand
from common.types import (
    BoundingBox,
    CitationData,
    EntityUploadInfo,
    SerializableReference,
)
from common.upload_entities import upload_entities

from ..types import BibitemMatch
from ..utils import load_located_citations

CitationKey = str
LocationIndex = int
S2Id = str


class UploadCitations(DatabaseUploadCommand[CitationData, None]):
    @staticmethod
    def get_name() -> str:
        return "upload-citations"

    @staticmethod
    def get_description() -> str:
        return "Upload citation information to the database."

    def get_arxiv_ids_dirkey(self) -> str:
        return "citations-locations"

    def load(self) -> Iterator[CitationData]:
        for arxiv_id in self.arxiv_ids:

            # Load citation locations
            citation_locations = load_located_citations(arxiv_id)
            if citation_locations is None:
                continue

            # Load metadata for bibitems
            key_s2_ids: Dict[CitationKey, S2Id] = {}
            key_resolutions_path = os.path.join(
                directories.arxiv_subdir("bibitem-resolutions", arxiv_id),
                "resolutions.csv",
            )
            if not os.path.exists(key_resolutions_path):
                logging.warning(
                    "Could not find citation resolutions for %s. Skipping", arxiv_id
                )
                continue
            for resolution in file_utils.load_from_csv(
                key_resolutions_path, BibitemMatch
            ):
                if resolution.key is not None:
                    key_s2_ids[resolution.key] = resolution.s2_id

            s2_id_path = os.path.join(
                directories.arxiv_subdir("s2-metadata", arxiv_id), "s2_id"
            )
            if not os.path.exists(s2_id_path):
                logging.warning("Could not find S2 ID file for %s. Skipping", arxiv_id)
                continue
            with open(s2_id_path) as s2_id_file:
                s2_id = s2_id_file.read()

            s2_data: Dict[S2Id, SerializableReference] = {}
            s2_metadata_path = os.path.join(
                directories.arxiv_subdir("s2-metadata", arxiv_id), "references.csv"
            )
            if not os.path.exists(s2_metadata_path):
                logging.warning(
                    "Could not find S2 metadata file for citations for %s. Skipping",
                    arxiv_id,
                )
                continue
            for metadata in file_utils.load_from_csv(
                s2_metadata_path, SerializableReference
            ):
                # Convert authors field to comma-delimited list of authors
                author_string = ",".join(
                    [a["name"] for a in ast.literal_eval(metadata.authors)]
                )
                metadata = dataclasses.replace(metadata, authors=author_string)
                s2_data[metadata.s2_id] = metadata

            yield CitationData(
                arxiv_id, s2_id, citation_locations, key_s2_ids, s2_data,
            )

    def process(self, _: CitationData) -> Iterator[None]:
        yield None

    def save(self, item: CitationData, _: None) -> None:
        citation_locations = item.citation_locations
        key_s2_ids = item.key_s2_ids

        entity_infos = []

        citation_index = 0
        for citation_key, locations in citation_locations.items():

            if citation_key not in key_s2_ids:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "Not uploading bounding box information for citation with key "
                    + "%s because it was not resolved to a paper S2 ID.",
                    citation_key,
                )
                continue

            for cluster_index, location_set in locations.items():
                boxes = cast(List[BoundingBox], list(location_set))
                entity_info = EntityUploadInfo(
                    id_=f"{citation_key}-{cluster_index}",
                    type_="citation",
                    bounding_boxes=boxes,
                    data={"key": citation_key, "paper_id": key_s2_ids[citation_key]},
                )
                entity_infos.append(entity_info)
                citation_index += 1

        # TODO: make sure every database upload command has this
        if self.args.output_dir is None:
            upload_entities(item.s2_id, item.arxiv_id, entity_infos, self.args.data_version)
        else:
            output_file_name = os.path.join(self.args.output_dir, "citations.jsonl")
            self.write_to_file(entity_infos=entity_infos, output_file_name=output_file_name)

    def write_to_file(self, entity_infos: List[EntityUploadInfo], output_file_name: str) -> None:
        format_version = "v0"

        logging.info(
            "About to write %d entity infos to %s (version: %s).",
            len(entity_infos),
            output_file_name,
            format_version
        )
        to_write = {
            "version": format_version,
            "data": [dataclasses.asdict(entity_info) for entity_info in entity_infos]
        }
        if os.path.exists(output_file_name):
            # TODO: maybe throw an error instead?
            logging.warning("File %s already exists. Not overwriting. Entity infos will not be written.", output_file_name)
        else:
            with open(output_file_name, 'w') as output_file:
                json.dump(to_write, output_file)
