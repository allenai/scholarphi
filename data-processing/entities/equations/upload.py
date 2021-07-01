from typing import Optional, cast

from common.types import BoundingBox, EntityUploadInfo, Equation, PaperProcessingResult
from common.upload_entities import save_to_file_or_upload_entities


def upload_equations(
    processing_summary: PaperProcessingResult, data_version: Optional[int], output_dir: Optional[str]
) -> None:

    entity_infos = []
    for entity_summary in processing_summary.entities:
        equation = cast(Equation, entity_summary.entity)
        boxes = [cast(BoundingBox, l) for l in entity_summary.locations]

        entity_info = EntityUploadInfo(
            id_=f"{equation.tex_path}-{equation.id_}",
            type_="equation",
            bounding_boxes=boxes,
            data={"tex": equation.tex},
        )
        entity_infos.append(entity_info)

    save_to_file_or_upload_entities(
        entity_infos=entity_infos,
        s2_id=processing_summary.s2_id,
        arxiv_id=processing_summary.arxiv_id,
        data_version=data_version,
        output_dir=output_dir,
        filename="equations.jsonl"
    )
