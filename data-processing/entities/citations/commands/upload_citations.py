import ast
import dataclasses
import logging
import os.path
from typing import Dict, Iterator, List, Optional, Set, cast

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

    def _acceptable_str(self, maybe_str: Optional[str]) -> bool:
        """
        Note: I haven't actually seen any cases where this has returned False
        in the testing I've done. I'm mostly going off the signature of the
        method that extracts keys (returns an Optional[str]), and the fact
        that an empty string for either the bib item key or text probably
        wouldn't do much for us down the line.
        """
        return maybe_str is not None and maybe_str.strip() != ""

    def _get_bibitem_keys_from_bibitems(self, arxiv_id: ArxivId, bibitems: List[Bibitem]) -> Set[str]:
        list_version = [item.id_ for item in bibitems if self._acceptable_str(item.id_)]
        if len(list_version) < len(bibitems):
            logging.warning("Some bibitems have empty keys for paper %s.", arxiv_id)
        set_version = set(list_version)
        if len(set_version) < len(list_version):
            logging.warning("Some bibitems have the same key for paper %s.", arxiv_id)
        return set_version

    def _get_bibitem_texts_from_bibitems(
        self,
        arxiv_id: ArxivId,
        bibitems: List[Bibitem]
    ) -> Dict[str, str]:

        # We want to construct a map from bib item key to the text associated with the
        # corresponding bib entry.
        bibitem_texts: Dict[str, str] = {}
        for bibitem in bibitems:
            maybe_bibitem_id = bibitem.id_
            maybe_bibitem_text = bibitem.text

            if self._acceptable_str(maybe_bibitem_id) and self._acceptable_str(maybe_bibitem_text):
                # only include an entry in the map if both the key and text are defined
                # and not empty strings

                if maybe_bibitem_id in bibitem_texts:
                    # Occasionally, it seems as though we might have two bib items with
                    # the same key. At the moment, I'm not sure why this happens, and
                    # I don't have a programmatic way of figuring out which text is
                    # the 'right' one when the corresponding bib entry texts are different.
                    # So when we have the same key but different texts, we just use the
                    # last one we see, but log a warning.

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

    def _entity_data_from_text_and_matches(
        self,
        arxiv_id: ArxivId,
        bibitem_texts: Dict[str, str],
        key_s2_ids: Dict[str, S2Id],
        s2_data: Dict[S2Id, SerializableReference],
        bibitem_key: str,
    ) -> EntityData:
        entity_data: EntityData = {
            "key": bibitem_key,
        }

        def log_missing(missing: str):
            logging.warning(f"Missing {missing} for bibitem with key {bibitem_key} for paper {arxiv_id}")

        if bibitem_key in bibitem_texts:
            entity_data["bibitem_text"] = bibitem_texts[bibitem_key]
        else:
            log_missing("bibitem text")

        if bibitem_key in key_s2_ids:
            reference_s2_id = key_s2_ids[bibitem_key]
            entity_data["paper_id"] = reference_s2_id
            if reference_s2_id in s2_data:
                entity_data["corpus_id"] = s2_data[reference_s2_id].corpus_id
            else:
                log_missing("S2 match corpus ID")
        else:
            log_missing("S2 match paper ID/SHA")

        return entity_data

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
            bibitem_keys: Set[str] = self._get_bibitem_keys_from_bibitems(arxiv_id, bibitems)
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
                arxiv_id, s2_id, citation_locations, key_s2_ids, s2_data, bibitem_texts, bibitem_keys
            )

    def process(self, _: CitationData) -> Iterator[None]:
        yield None

    def save(self, item: CitationData, _: None) -> None:
        citation_locations = item.citation_locations
        key_s2_ids = item.key_s2_ids
        s2_data = item.s2_data
        bibitem_texts = item.bibitem_texts
        bibitem_keys = item.bibitem_keys

        # for mypy
        assert bibitem_texts is not None
        assert bibitem_keys is not None

        entity_infos = []

        # mentions - all mentions have at least one bounding box
        for citation_key, locations in citation_locations.items():

            entity_data = self._entity_data_from_text_and_matches(
                arxiv_id=item.arxiv_id,
                bibitem_texts=bibitem_texts,
                key_s2_ids=key_s2_ids,
                s2_data=s2_data,
                bibitem_key=citation_key,
            )

            for cluster_index, location_set in locations.items():
                boxes = cast(List[BoundingBox], list(location_set))
                entity_info = EntityUploadInfo(
                    id_=f"{citation_key}-{cluster_index}",
                    type_="citation",
                    bounding_boxes=boxes,
                    data=entity_data,
                )
                entity_infos.append(entity_info)

        # what downstream systems call 'entities' - no bounding boxes
        # this is a little more specific than what scholarphi calls an
        # entity
        for bibitem_key in bibitem_keys:
            entity_data = self._entity_data_from_text_and_matches(
                arxiv_id=item.arxiv_id,
                bibitem_texts=bibitem_texts,
                key_s2_ids=key_s2_ids,
                s2_data=s2_data,
                bibitem_key=bibitem_key,
            )
            entity_info = EntityUploadInfo(
                id_=bibitem_key,
                type_="citation",
                bounding_boxes=[],
                data=entity_data,
            )
            entity_infos.append(entity_info)

        save_entities(
            s2_id=item.s2_id,
            arxiv_id=item.arxiv_id,
            entity_infos=entity_infos,
            data_version=self.args.data_version,
            output_details=self.output_details,
            filename="citations.json",
            do_not_save_boundingboxless_to_db=True,
        )

    def can_write_to_file(self) -> bool:
        return True
