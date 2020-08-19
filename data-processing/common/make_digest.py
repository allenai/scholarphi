import os
from typing import Iterable, Optional

from common import directories, file_utils
from common.types import (ArxivId, EntityProcessingDigest, HueLocationInfo,
                          PaperProcessingDigest, SerializableEntity)
from scripts.pipelines import EntityPipeline


def make_paper_digest(
    pipelines: Iterable[EntityPipeline], arxiv_id: ArxivId
) -> PaperProcessingDigest:
    " Create a summary of the pipeline processing results for a paper. "

    paper_digest: PaperProcessingDigest = {}

    for pipeline in pipelines:

        # Some entity types require custom code for detecting how many entities were
        # processed. If the entity pipeline has such custom code, run the custom code instead
        # of the default code for counting how many entities were processed.
        if pipeline.make_digest is not None:
            paper_entity_digest = pipeline.make_digest(pipeline.entity_name, arxiv_id)
        else:
            paper_entity_digest = make_default_paper_digest(
                pipeline.entity_name, arxiv_id
            )

        paper_digest[pipeline.entity_name] = paper_entity_digest

    return paper_digest


def make_default_paper_digest(
    entity_name: str, arxiv_id: ArxivId
) -> EntityProcessingDigest:
    """
    The key limitation of relying on this default method of making a digest of entities that
    were processed in a paper is that this method has no way of knowing how the hues found in
    a paper are supposed to combine into meaningful entities. If you want to expose more accurate
    counts of how many entities bounding boxes were found for, you should define a custom
    'make_digest' method on your entity pipeline.
    """

    # Look in the default location for a list of extracted entities.
    detected_entities_dirkey = f"detected-{entity_name}"
    num_entities_detected = count_detected_entities(arxiv_id, detected_entities_dirkey)

    # Look in the default location for a list of hues located in the file.
    hue_locations_dirkey = f"{entity_name}-locations"
    num_hues_located = count_hues_located(arxiv_id, hue_locations_dirkey)

    return EntityProcessingDigest(
        num_extracted=num_entities_detected, num_hues_located=num_hues_located
    )


def count_detected_entities(
    arxiv_id: ArxivId,
    detected_entities_dirkey: str,
    entities_filename: str = "entities.csv",
) -> Optional[int]:

    num_entities_detected = None
    if directories.registered(detected_entities_dirkey):
        detected_entities_path = os.path.join(
            directories.arxiv_subdir(detected_entities_dirkey, arxiv_id),
            entities_filename,
        )
        if os.path.exists(detected_entities_path):
            num_entities_detected = len(
                list(
                    file_utils.load_from_csv(detected_entities_path, SerializableEntity)
                )
            )

    return num_entities_detected


def count_hues_located(
    arxiv_id: ArxivId,
    hue_locations_dirkey: str,
    hue_locations_filename: str = "entity_locations.csv",
) -> Optional[int]:

    num_hues_located = None
    if directories.registered(hue_locations_dirkey):
        hue_locations_path = os.path.join(
            directories.arxiv_subdir(hue_locations_dirkey, arxiv_id),
            hue_locations_filename,
        )
        if os.path.exists(hue_locations_path):
            num_hues_located = len(
                list(file_utils.load_from_csv(hue_locations_path, HueLocationInfo))
            )

    return num_hues_located
