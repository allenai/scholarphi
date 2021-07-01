from typing import Optional, cast

from common.types import BoundingBox, EntityUploadInfo, PaperProcessingResult
from common.upload_entities import save_to_file_or_upload_entities

from entities.sentences.types import Sentence as SentenceEntity


def upload_sentences(
    processing_summary: PaperProcessingResult, data_version: Optional[int], output_dir: Optional[str]
) -> None:

    entity_infos = []
    for entity_summary in processing_summary.entities:
        sentence = cast(SentenceEntity, entity_summary.entity)
        boxes = [cast(BoundingBox, l) for l in entity_summary.locations]

        entity_info = EntityUploadInfo(
            id_=f"{sentence.tex_path}-{sentence.id_}",
            type_="sentence",
            bounding_boxes=boxes,
            data={
                "text": sentence.text,
                "tex": sentence.tex,
                "tex_start": sentence.start,
                "tex_end": sentence.end,
            },
        )
        entity_infos.append(entity_info)

    save_to_file_or_upload_entities(
        entity_infos=entity_infos,
        s2_id=processing_summary.s2_id,
        arxiv_id=processing_summary.arxiv_id,
        data_version=data_version,
        output_dir=output_dir,
        filename="sentences_pdf.jsonl"
   )
