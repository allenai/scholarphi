from typing import Dict, List, cast

from peewee import ForeignKeyField, TextField

from common.models import (
    BoundingBox,
    Entity,
    EntityBoundingBox,
    OutputModel,
    Paper,
    output_database,
)
from common.types import HueLocationInfo, PaperProcessingResult

from .extractor import Sentence as SentenceEntity


class Sentence(OutputModel):
    paper = ForeignKeyField(Paper, on_delete="CASCADE")
    text = TextField()


SentenceId = str


def upload_sentences(processing_summary: PaperProcessingResult) -> None:

    arxiv_id = processing_summary.arxiv_id
    s2_id = processing_summary.s2_id

    # Create entry for the paper if it does not yet exist
    try:
        paper = Paper.get(Paper.s2_id == s2_id)
    except Paper.DoesNotExist:
        paper = Paper.create(s2_id=s2_id, arxiv_id=arxiv_id)

    locations_by_sentence_id: Dict[SentenceId, List[HueLocationInfo]] = {}
    sentence_models: Dict[SentenceId, Sentence] = {}

    for entity_and_location in processing_summary.localized_entities:
        sentence = cast(SentenceEntity, entity_and_location.entity)  # type: ignore
        sentence_model = Sentence(paper=paper, text=sentence.text)

        locations_by_sentence_id[sentence.id_] = entity_and_location.locations
        sentence_models[sentence.id_] = sentence_model

    with output_database.atomic():
        Sentence.bulk_create(sentence_models.values(), 100)

    entities = []
    entity_bounding_boxes = []
    bounding_boxes = []

    for sentence_id, sentence_model in sentence_models.items():

        entity = Entity(
            type="sentence", source="tex-pipeline", entity_id=sentence_model.id
        )
        entities.append(entity)

        for location in locations_by_sentence_id[sentence_id]:
            bounding_box = BoundingBox(
                page=location.page,
                left=location.left,
                top=location.top,
                width=location.width,
                height=location.height,
            )
            bounding_boxes.append(bounding_box)

            entity_bounding_box = EntityBoundingBox(
                bounding_box=bounding_box, entity=entity
            )
            entity_bounding_boxes.append(entity_bounding_box)

    with output_database.atomic():
        BoundingBox.bulk_create(bounding_boxes, 100)
    with output_database.atomic():
        Entity.bulk_create(entities, 300)
    with output_database.atomic():
        EntityBoundingBox.bulk_create(entity_bounding_boxes, 300)
