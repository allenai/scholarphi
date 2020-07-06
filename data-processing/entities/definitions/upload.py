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

from .types import Definition as DefinitionEntity


class Definition(OutputModel):
    paper = ForeignKeyField(Paper, on_delete="CASCADE")
    text = TextField()


@dataclass(frozen=True)
class DefinitionKey:
    tex_path: str
    entity_id: str


@dataclass(frozen=True)
class DefinitionIdAndModelId(DefinitionKey):
    " Link between a definition in the pipeline's output and its ID in the database. "
    model_id: str


def upload_definitions(processing_summary: PaperProcessingResult) -> None:

    arxiv_id = processing_summary.arxiv_id
    s2_id = processing_summary.s2_id

    # Create entry for the paper if it does not yet exist
    try:
        paper = Paper.get(Paper.s2_id == s2_id)
    except Paper.DoesNotExist:
        paper = Paper.create(s2_id=s2_id, arxiv_id=arxiv_id)

    # TODO this needs to be implemented
