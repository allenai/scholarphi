import os
from dataclasses import dataclass
from typing import Dict, List, cast

from peewee import DoesNotExist, ForeignKeyField, TextField

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

from .types import Term as TermEntity


class Term(OutputModel):
    paper = ForeignKeyField(Paper, on_delete="CASCADE")
    name = TextField()
    definition = TextField()


@dataclass(frozen=True)
class TermKey:
    tex_path: str
    entity_id: str


@dataclass(frozen=True)
class TermIdAndModelId(TermKey):
    " Link between a term in the pipeline's output and its ID in the database. "
    model_id: str


def upload_terms(processing_summary: PaperProcessingResult) -> None:
    arxiv_id = processing_summary.arxiv_id
    s2_id = processing_summary.s2_id

    # Create entry for the paper if it does not yet exist
    try:
        paper = Paper.get(Paper.s2_id == s2_id)
    except DoesNotExist:
        paper = Paper.create(s2_id=s2_id, arxiv_id=arxiv_id)

    locations_by_term_id: Dict[TermKey, List[HueLocationInfo]] = {}
    terms: Dict[TermKey, TermEntity] = {}
    term_models: Dict[TermKey, Term] = {}

    for entity_and_location in processing_summary.localized_entities:
        term = cast(TermEntity, entity_and_location.entity)
        term_model = Term(paper=paper, name=term.name, definition=term.definition)

        term_key = TermKey(term.tex_path, term.id_)
        locations_by_term_id[term_key] = entity_and_location.locations
        term_models[term_key] = term_model
        terms[term_key] = term

    with output_database.atomic():
        Term.bulk_create(term_models.values(), 100)

    model_ids_dir = directories.arxiv_subdir("terms-model-ids", arxiv_id)
    if os.path.exists(model_ids_dir):
        file_utils.clean_directory(model_ids_dir)
    else:
        os.makedirs(model_ids_dir)
    output_ids_path = os.path.join(model_ids_dir, "model_ids.csv")
    for id_, term_entity in terms.items():
        file_utils.append_to_csv(
            output_ids_path,
            TermIdAndModelId(
                tex_path=term_entity.tex_path,
                entity_id=term_entity.id_,
                model_id=term_models[id_].id,
            ),
        )

    entities = []
    entity_bounding_boxes = []
    bounding_boxes = []

    for term_id, term_model in term_models.items():

        entity = Entity.create(
            type="term", source="tex-pipeline", entity_id=term_model.id
        )
        entities.append(entity)

        for location in locations_by_term_id[term_id]:
            bounding_box = BoundingBox.create(
                page=location.page,
                left=location.left,
                top=location.top,
                width=location.width,
                height=location.height,
            )
            bounding_boxes.append(bounding_box)

            entity_bounding_boxes.append(
                EntityBoundingBox(bounding_box=bounding_box, entity=entity)
            )

    with output_database.atomic():
        BoundingBox.bulk_create(bounding_boxes, 100)
    with output_database.atomic():
        Entity.bulk_create(entities, 300)
    with output_database.atomic():
        EntityBoundingBox.bulk_create(entity_bounding_boxes, 300)
