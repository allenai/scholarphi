from typing import Dict, List

from common.commands.base import Command, CommandList
from common.commands.compile_tex import CompileNormalizedTexSources, CompileTexSources
from common.commands.fetch_arxiv_sources import FetchArxivSources
from common.commands.fetch_s2_data import FetchS2Metadata
from common.commands.normalize_tex import NormalizeTexSources
from common.commands.raster_pages import RasterPages
from common.commands.unpack_sources import UnpackSources


from common.commands.fetch_arxiv_pdf import FetchArxivPdf

# Force the importing of modules for entity processing. This forces a call from each of the entity
# modules to register pipelines for processing each entity. If these aren't imported,
# 'entity_pipelines' will be empty and all of the commands for processing entities will be missing.
# The order that these packages are imported will determine the indexes assigned to the output
# data directories. Earlier imports will have lower indexes for the data directories.
from entities import citations  # pylint: disable=unused-import
from entities import definitions  # pylint: disable=unused-import
from entities import equations  # pylint: disable=unused-import
from entities import glossary_terms  # pylint: disable=unused-import
from entities import sentences  # pylint: disable=unused-import
from entities import symbols  # pylint: disable=unused-import
from entities import sentences_pdf   # pylint: disable=unused-import

from scripts.pipelines import EntityPipeline, entity_pipelines

# Commands for fetching arXiv sources and preparing for entity processing.
TEX_PREPARATION_COMMANDS: CommandList = [
    FetchArxivSources,
    FetchS2Metadata,
    UnpackSources,
    CompileTexSources,
    NormalizeTexSources,
    CompileNormalizedTexSources,
    RasterPages,
]


# Commands for processing entities.
ENTITY_COMMANDS: CommandList = []


# Order commands for processing entities based on dependencies between entities. For example,
# equations will need to be processed before symbols.
pipelines_ordered: List[EntityPipeline] = []
entity_names_added: List[str] = []

# Fixpoint algorithm to order entity pipelines.
# Repeatedly Loop over the set of entity pipelines. Add a pipeline only when all its
# dependencies (from 'depends_on' and 'optional_depends_on') have already been added.
while True:
    for pipeline in entity_pipelines:
        already_added = pipeline in pipelines_ordered
        deps_added = all([e in entity_names_added for e in pipeline.depends_on])
        optional_deps_added = all(
            [e in entity_names_added for e in pipeline.optional_depends_on]
        )
        predecessors_added = deps_added and optional_deps_added
        if not already_added and predecessors_added:
            pipelines_ordered.append(pipeline)
            entity_names_added.append(pipeline.entity_name)
    if len(pipelines_ordered) == len(entity_pipelines):
        break

for pipeline in pipelines_ordered:
    ENTITY_COMMANDS.extend(pipeline.commands)


commands_by_entity: Dict[str, CommandList] = {}
" Map from each entity type to the commands that need to run for to process that entity. "

# Fixpoint algorithm to determine which commands are needed to process each type of entity.
# For each entity type, loop over the list of pipelines until a list has been developed of all
# pipelines that depend on this entity type being processed. Do not consider the
# dependencies listed in 'optional_depends_on', as these are optional, and only used to make
# sure that commands are run in the right order.
for pipeline in entity_pipelines:
    required_by = set([pipeline.entity_name])
    while True:
        required_by_snapshot = set(required_by)
        for other in entity_pipelines:
            if any(r in other.depends_on for r in required_by):
                required_by.add(other.entity_name)
        if required_by == required_by_snapshot:
            break

    for entity_name in required_by:
        for c in pipeline.commands:
            if entity_name not in commands_by_entity:
                commands_by_entity[entity_name] = []
            if c not in commands_by_entity[entity_name]:
                commands_by_entity[entity_name].append(c)


def run_command(cmd: Command) -> None:  # type: ignore
    for item in cmd.load():
        for result in cmd.process(item):
            cmd.save(item, result)
