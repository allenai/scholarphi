from typing import Optional, cast

from common.types import (
    BoundingBox,
    EntityInformation,
    EntityReference,
    PaperProcessingResult,
)
from common.upload_entities import upload_entities

from .types import Definition, Term


def upload_definitions(
    processing_summary: PaperProcessingResult, data_version: Optional[int]
) -> None:

    term_infos = []
    definition_infos = []

    for entity_and_location in processing_summary.localized_entities:
        boxes = [cast(BoundingBox, l) for l in entity_and_location.locations]
        entity = entity_and_location.entity

        if entity.id_.startswith("term"):
            term = cast(Term, entity)
            term_info = EntityInformation(
                id_=f"{term.tex_path}-{term.id_}",
                type_="term",
                bounding_boxes=boxes,
                data={"name": term.text},
                relationships={
                    "sentence": EntityReference(
                        type_="sentence", id_=f"{term.tex_path}-{term.sentence_id}"
                    )
                },
            )
            term_infos.append(term_info)

        if entity.id_.startswith("definition"):
            definition = cast(Definition, entity)
            definition_info = EntityInformation(
                id_=f"{definition.tex_path}-{definition.id_}",
                type_="definition",
                bounding_boxes=boxes,
                data={
                    "definiendum_name": definition.definiendum,
                    "text": definition.text,
                },
                relationships={
                    "definiendum": EntityReference(
                        type_="term", id_=f"{definition.tex_path}-{definition.term_id}"
                    ),
                    "sentence": EntityReference(
                        type_="sentence",
                        id_=f"{definition.tex_path}-{definition.sentence_id}",
                    ),
                },
            )
            definition_infos.append(definition_info)

    # Upload terms before definitions, because definitions hold references to terms that can
    # only be resolved in the upload function once the terms have been uploaded.
    upload_entities(
        processing_summary.s2_id, processing_summary.arxiv_id, term_infos, data_version,
    )
    upload_entities(
        processing_summary.s2_id,
        processing_summary.arxiv_id,
        definition_infos,
        data_version,
    )
