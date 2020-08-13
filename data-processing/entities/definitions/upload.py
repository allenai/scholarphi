from typing import Optional, cast

from common.types import (
    BoundingBox,
    EntityInformation,
    EntityReference,
    PaperProcessingResult,
)
from common.upload_entities import upload_entities

from .types import Definition, TermReference


def upload_definitions(
    processing_summary: PaperProcessingResult, data_version: Optional[int]
) -> None:

    term_infos = []
    definition_infos = []
    for entity_and_location in processing_summary.localized_entities:
        boxes = [cast(BoundingBox, l) for l in entity_and_location.locations]
        entity = entity_and_location.entity

        if entity.id_.startswith("definition"):
            definition = cast(Definition, entity)
            definition_info = EntityInformation(
                id_=definition.id_,
                type_="definition",
                bounding_boxes=boxes,
                data={
                    "definiendum": definition.definiendum,
                    "definition": definition.text,
                    "tex": definition.tex,
                },
                relationships={
                    "sentence": EntityReference(
                        type_="sentence",
                        id_=f"{definition.tex_path}-{definition.sentence_id}"
                        if definition.sentence_id is not None
                        else None,
                    ),
                },
            )
            definition_infos.append(definition_info)

        if entity.id_.startswith("definiendum") or entity.id_.startswith(
            "term-reference"
        ):
            term = cast(TermReference, entity)
            term_info = EntityInformation(
                id_=term.id_,
                type_="term",
                bounding_boxes=boxes,
                data={
                    "name": term.text,
                    "definitions": term.definitions,
                    "definition_texs": term.definition_texs,
                    "sources": term.sources,
                    "term_type": term.type_ or "unknown"
                },
                relationships={
                    "sentence": EntityReference(
                        type_="sentence",
                        id_=f"{term.tex_path}-{term.sentence_id}"
                        if term.sentence_id is not None
                        else None,
                    ),
                    "definitions": [
                        EntityReference(type_="definition", id_=d)
                        for d in term.definition_ids
                    ],
                },
            )
            term_infos.append(term_info)

    # Upload definitions before terms, because terms hold references to definitions that can
    # only be resolved once the definitions have been uploaded.
    upload_entities(
        processing_summary.s2_id,
        processing_summary.arxiv_id,
        definition_infos,
        data_version,
    )
    upload_entities(
        processing_summary.s2_id, processing_summary.arxiv_id, term_infos, data_version,
    )
