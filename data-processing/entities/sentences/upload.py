import os
from dataclasses import dataclass
from typing import Dict, List, cast

from peewee import ForeignKeyField, TextField

from common import directories, file_utils
from common.models import (
    BoundingBox,
    Entity,
    EntityBoundingBox,
    OutputModel,
    Paper,
    output_database,
)
from common.types import HueLocationInfo, PaperProcessingResult

from .types import Sentence as SentenceEntity


class Sentence(OutputModel):
    paper = ForeignKeyField(Paper, on_delete="CASCADE")
    text = TextField()


SentenceId = str


@dataclass(frozen=True)
class SentenceIdAndModelId:
    " Link between a sentence in the pipeline's output and its ID in the database. "
    tex_path: str
    entity_id: str
    model_id: str


def upload_sentences(processing_summary: PaperProcessingResult) -> None:

    arxiv_id = processing_summary.arxiv_id
    s2_id = processing_summary.s2_id

    # Create entry for the paper if it does not yet exist
    try:
        paper = Paper.get(Paper.s2_id == s2_id)
    except Paper.DoesNotExist:
        paper = Paper.create(s2_id=s2_id, arxiv_id=arxiv_id)

    locations_by_sentence_id: Dict[SentenceId, List[HueLocationInfo]] = {}
    sentences: Dict[SentenceId, SentenceEntity] = {}
    sentence_models: Dict[SentenceId, Sentence] = {}

    for entity_and_location in processing_summary.localized_entities:
        sentence = cast(SentenceEntity, entity_and_location.entity)
        sentence_model = Sentence(paper=paper, text=sentence.text)

        locations_by_sentence_id[sentence.id_] = entity_and_location.locations
        sentence_models[sentence.id_] = sentence_model
        sentences[sentence.id_] = sentence

    with output_database.atomic():
        Sentence.bulk_create(sentence_models.values(), 100)

    # Save the IDs for the sentence models so that they can be used in downstream tasks,
    # like uploading which sentences symbols belong to.
    model_ids_dir = directories.arxiv_subdir("sentences-model-ids", arxiv_id)
    if os.path.exists(model_ids_dir):
        file_utils.clean_directory(model_ids_dir)
    else:
        os.makedirs(model_ids_dir)
    output_ids_path = os.path.join(model_ids_dir, "model_ids.csv")
    for id_, sentence_entity in sentences.items():
        file_utils.append_to_csv(
            output_ids_path,
            SentenceIdAndModelId(
                tex_path=sentence_entity.tex_path,
                entity_id=sentence_entity.id_,
                model_id=sentence_models[id_].id,
            ),
        )

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
