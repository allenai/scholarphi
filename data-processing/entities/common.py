import dataclasses
from dataclasses import dataclass
from typing import List

from common.commands.base import CommandList


@dataclass(frozen=True)
class EntityPipeline:
    """
    A sequence of commands to be run by the pipeline to find a type of entity.
    """

    entity_name: str
    " Name of the entity that this sequence of commands will process. "

    commands: CommandList
    " Sequence of commands to run to process this type of entity. "

    depends_on: List[str] = dataclasses.field(default_factory=list)
    " List of other entity pipelines this must be processed before this one. "
