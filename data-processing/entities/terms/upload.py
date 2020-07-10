from typing import Optional, cast

from common.types import BoundingBox, EntityInformation, PaperProcessingResult
from common.upload_entities import upload_entities

from .types import Term as TermEntity


def upload_terms(
    processing_summary: PaperProcessingResult, data_version: Optional[int]
) -> None:

    entity_infos = []
    for entity_and_location in processing_summary.localized_entities:
        term = cast(TermEntity, entity_and_location.entity)
        boxes = [cast(BoundingBox, l) for l in entity_and_location.locations]

        entity_info = EntityInformation(
            id_=f"{term.tex_path}-{term.id_}",
            type_="sentence",
            bounding_boxes=boxes,
            data={
                "name": term.name,
                "definitions": term.definitions,
                "sources": term.sources,
                "val": term.val,
            },
        )
        entity_infos.append(entity_info)

    upload_entities(
        processing_summary.s2_id,
        processing_summary.arxiv_id,
        entity_infos,
        data_version,
    )
