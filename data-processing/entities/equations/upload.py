from typing import Optional, cast

from common.types import BoundingBox, EntityInformation, PaperProcessingResult
from common.types import Equation
from common.upload_entities import upload_entities


def upload_equations(
    processing_summary: PaperProcessingResult, data_version: Optional[int]
) -> None:

    entity_infos = []
    for entity_and_location in processing_summary.localized_entities:
        equation = cast(Equation, entity_and_location.entity)
        boxes = [cast(BoundingBox, l) for l in entity_and_location.locations]

        entity_info = EntityInformation(
            id_=f"{equation.tex_path}-{equation.id_}",
            type_="equation",
            bounding_boxes=boxes,
            data={"tex": equation.tex},
        )
        entity_infos.append(entity_info)

    upload_entities(
        processing_summary.s2_id,
        processing_summary.arxiv_id,
        entity_infos,
        data_version,
    )
