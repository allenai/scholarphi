import dataclasses
from dataclasses import dataclass
from typing import Any, Callable, List, Optional, Type

from common.commands.base import CommandList
from common.types import ArxivId, EntityProcessingDigest

EntityName = str


@dataclass(frozen=True)
class EntityPipeline:
    " A sequence of commands to be run by the pipeline to find a type of entity. "

    entity_name: str
    " Name of the entity that this sequence of commands will process. "

    commands: CommandList
    " Sequence of commands to run to process this type of entity. "

    depends_on: List[str] = dataclasses.field(default_factory=list)
    " List of other entity pipelines this must be processed before this one. "

    optional_depends_on: List[str] = dataclasses.field(default_factory=list)
    """
    List of other entity pipelines that, if processed, should be processed before this one,
    but which are not required by this pipeline. An example is the sentences pipeline,
    which can (but doesn't need to) be used by the symbols pipeline.
    """

    database_models: List[Type[Any]] = dataclasses.field(default_factory=list)
    """
    List of database models that have been defined uniquely for the output from this entity
    pipeline. Make sure to include the models here so that the tables for those models are created
    automatically created before the upload commands are run.

    While the type here is listed as 'Any' to avoid a circular import from importing
    the database models file here, all entries in 'database_models' should be 'OutputModel's.
    """

    make_digest: Optional[
        Callable[[EntityName, ArxivId], EntityProcessingDigest]
    ] = None
    """
    Create a summary of how many entities were processed for a paper by inspecting the outputs of
    the pipeline. Called when the pipeline attempts to create a user-readable summary of the
    pipeline's output. If not defined, a default method is called which searches for entities in
    the locations defined by the helper function 'create_entity_localization_command_sequence'.
    """


entity_pipelines: List[EntityPipeline] = []
"""
List of pipelines for processing entities. Any file in the 'scripts' directory is welcome to read
this variable, but should only change it by calling the helper methods in this module.
"""


def register_entity_pipeline(pipeline: EntityPipeline) -> None:
    """
    Register a processing pipeline for an entity. One registered, the main processing pipeline will
    know to include the commands for that entity, and the database helper scripts will know to create
    tables for the entity. Any scripts in this project will be able to see the properties of the
    registered entity processing pipeline.
    """
    entity_pipelines.append(pipeline)
