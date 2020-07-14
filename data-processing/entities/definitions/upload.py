import os
from dataclasses import dataclass
from typing import Dict, List, cast, Optional

from peewee import ForeignKeyField, TextField

from common.types import BoundingBox, EntityInformation, PaperProcessingResult
from common.upload_entities import upload_entities

from .types import Definition as DefinitionEntity



def upload_definitions(
    processing_summary: PaperProcessingResult, data_version: Optional[int]
) -> None:

    entity_infos = []

    for entity_and_location in processing_summary.localized_entities:
        definition = cast(DefinitionEntity, entity_and_location.entity)
        boxes = [cast(BoundingBox, l) for l in entity_and_location.locations]

        entity_info = EntityInformation(
            id_=f"{definition.tex_path}-{definition.id_}",
            type_="termdefinition",
            bounding_boxes=boxes,
            data={
                "name": definition.term_text,
                "definition": definition.definition_text,
                # "definitions": definition.definitions,
                # "sources": term.sources,
                # "val": definition.val,
            },
        )
        entity_infos.append(entity_info)

    upload_entities(
        processing_summary.s2_id,
        processing_summary.arxiv_id,
        entity_infos,
        data_version,
    )



