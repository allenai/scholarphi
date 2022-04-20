import ast
import dataclasses
import logging
import os.path
from typing import Dict, Iterator, List, Optional, cast

from common import directories, file_utils
from common.commands.database import DatabaseUploadCommand
from common.types import (
    ArxivId,
    BoundingBox,
    CitationData,
    EntityData,
    EntityUploadInfo,
    SerializableReference,
)
from common.upload_entities import save_entities

from ..types import Bibitem, BibitemMatch
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

    def _get_bibitem_texts_from_bibitems(
        self,
        arxiv_id: ArxivId,
        bibitems: List[Bibitem]
    ) -> Dict[str, str]:
        def acceptable_str(maybe_str: Optional[str]) -> bool:
            # Not perfect but should weed some stuff out.
            return maybe_str is not None and maybe_str.strip() != ""

        bibitem_texts: Dict[str, str] = {}
        for bibitem in bibitems:
            maybe_bibitem_id = bibitem.id_
            maybe_bibitem_text = bibitem.text
            if acceptable_str(maybe_bibitem_id) and acceptable_str(maybe_bibitem_text):
                if maybe_bibitem_id in bibitem_texts:
                    curr_text = bibitem_texts[maybe_bibitem_id]
                    if curr_text != maybe_bibitem_text:
                        logging.warning(  # pylint: disable=logging-not-lazy
                            "About to overwrite the text for bibitem with "
                            + "key %s in paper %s. Old text: %s, New text: %s.",
                            maybe_bibitem_id,
                            arxiv_id,
                            curr_text,
                            maybe_bibitem_text,
                        )
                bibitem_texts[maybe_bibitem_id] = maybe_bibitem_text
            else:
                logging.warning(
                    "Missing bibitem id (%s) or text (%s) for a bibitem in paper %s.",
                    maybe_bibitem_id,
                    maybe_bibitem_text,
                    arxiv_id,
                )
        return bibitem_texts

    def load(self) -> Iterator[CitationData]:
        for arxiv_id in self.arxiv_ids:

            # Map bibitem keys to the raw text
            bibitems_dir = directories.arxiv_subdir("detected-citations", arxiv_id)
            bibitems_path = os.path.join(bibitems_dir, "entities.csv")
            if not os.path.exists(bibitems_path):
                logging.warning(
                    "Could not find bibitems at %s for paper %s. Skipping",
                    bibitems_path,
                    arxiv_id,
                )
                continue
            bibitems = list(file_utils.load_from_csv(bibitems_path, Bibitem))
            bibitem_texts: Dict[str, str] = self._get_bibitem_texts_from_bibitems(
                arxiv_id,
                bibitems,
            )

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
                arxiv_id, s2_id, citation_locations, key_s2_ids, s2_data, bibitem_texts
            )

    def process(self, _: CitationData) -> Iterator[None]:
        yield None

    def save(self, item: CitationData, _: None) -> None:
        citation_locations = item.citation_locations
        key_s2_ids = item.key_s2_ids
        bibitem_texts = item.bibitem_texts

        # for mypy
        assert bibitem_texts is not None

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

            data: EntityData = {
                "key": citation_key,
                "paper_id": key_s2_ids[citation_key],
            }

            if citation_key in bibitem_texts:
                data["bibitem_text"] = bibitem_texts[citation_key]
            else:
                logging.warning(
                    "Missing bibitem text for bibitem with key %s for paper %s",
                    citation_key,
                    item.arxiv_id,
                )

            for cluster_index, location_set in locations.items():
                boxes = cast(List[BoundingBox], list(location_set))
                entity_info = EntityUploadInfo(
                    id_=f"{citation_key}-{cluster_index}",
                    type_="citation",
                    bounding_boxes=boxes,
                    data=data,
                )
                entity_infos.append(entity_info)
                citation_index += 1

        save_entities(
            s2_id=item.s2_id,
            arxiv_id=item.arxiv_id,
            entity_infos=entity_infos,
            data_version=self.args.data_version,
            output_details=self.output_details,
            filename="citations.json",
        )

    def can_write_to_file(self) -> bool:
        return True
