import argparse
import logging
from typing import Dict, List

from common.commands.base import Command, CommandList
from common.commands.compile_tex import CompileTexSources
from common.commands.compute_iou import ComputeIou
from common.commands.fetch_arxiv_sources import FetchArxivSources
from common.commands.fetch_new_arxiv_ids import FetchNewArxivIds
from common.commands.fetch_s2_data import FetchS2Metadata
from common.commands.raster_pages import RasterPages
from common.commands.store_pipeline_log import StorePipelineLog
from common.commands.store_results import StoreResults
from common.commands.unpack_sources import UnpackSources

# Force the importing of modules for entity processing. This forces a call from each of the entity
# modules to register pipelines for processing each entity. If these aren't imported,
# 'entity_pipelines' will be empty and all of the commands for processing entities will be missing.
from entities import citations  # pylint: disable=unused-import
from entities import equations  # pylint: disable=unused-import
from entities import sentences  # pylint: disable=unused-import
from entities import symbols  # pylint: disable=unused-import
from scripts.pipelines import EntityPipeline, entity_pipelines

PAPER_DISCOVERY_COMMANDS: CommandList = [FetchNewArxivIds]
" Commands for discovering which arXiv papers to process. "


TEX_PREPARATION_COMMANDS: CommandList = [
    FetchArxivSources,
    FetchS2Metadata,
    UnpackSources,
    CompileTexSources,
    RasterPages,
]
" Commands for fetching arXiv sources and preparing for entity processing. "


ENTITY_COMMANDS: CommandList = []
" Commands for processing entities. "


# Order commands for processing entities based on dependencies between entities. For example,
# equations will need to be processed before symbols.
pipelines_ordered: List[EntityPipeline] = []
entity_names_added: List[str] = []

# Fixpoint algorithm to order dependencies.
# Loop over the set of entity pipelines. Add a pipeline only when all its dependencies have
# already been added. In later loops, pipelines are added that depend on other entities having been
# added. Stop when all pipelines have been added.
while True:
    for pipeline in entity_pipelines:
        already_added = pipeline in pipelines_ordered
        dependencies_added = all([e in entity_names_added for e in pipeline.depends_on])
        if not already_added and dependencies_added:
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
# pipelines that depend on this entity type being processed.
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


STORE_RESULTS_COMMANDS: CommandList = [
    StoreResults,
    # Store pipeline logs after results, so that we can include the result storage in the pipeline logs.
    StorePipelineLog,
]

EVALUATION_COMMANDS: CommandList = [
    ComputeIou,
]

ALL_COMMANDS = (
    PAPER_DISCOVERY_COMMANDS
    + TEX_PREPARATION_COMMANDS
    + ENTITY_COMMANDS
    + STORE_RESULTS_COMMANDS
    + EVALUATION_COMMANDS
)


def run_command(cmd: Command) -> None:  # type: ignore
    for item in cmd.load():
        for result in cmd.process(item):
            cmd.save(item, result)


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Process arXiv papers.")
    parser.add_argument("-v", help="print debugging information", action="store_true")
    subparsers = parser.add_subparsers(help="data processing commands")

    for CommandClass in ALL_COMMANDS:
        command_parser = subparsers.add_parser(
            CommandClass.get_name(), help=CommandClass.get_description()
        )
        command_parser.set_defaults(command_class=CommandClass)
        CommandClass.init_parser(command_parser)

    args = parser.parse_args()
    if not hasattr(args, "command_class"):
        parser.print_help()
        raise SystemExit

    if args.v:
        logging.basicConfig(level=logging.DEBUG)

    CommandClass = args.command_class
    command = CommandClass(args)
    run_command(command)
