from common import directories
from common.commands.base import CommandList
from entities.common import create_entity_localization_command_sequence
from scripts.pipelines import EntityPipeline, register_entity_pipeline

# from .colorize import get_definition_color_positions
from .extractor import DetectDefinitions
from .types import Definition
from .upload import upload_definitions

from ..sentences.commands.find_entity_sentences import (
    make_find_entity_sentences_command,
)
from common.commands.detect_entities import make_detect_entities_command
from common.commands.base import Command, CommandList
from common.commands.upload_entities import make_upload_entities_command


# Register directories for output from intermediate pipeline stages.
#directories.register("sentences-for-definitions")
directories.register("detected-definitions")
commands: CommandList = [
    DetectDefinitions,
]
# make_find_entity_sentences_command("definitions"),
upload_command = make_upload_entities_command(
    "definitions", upload_definitions, DetectedEntityType=Definition
)
commands.append(upload_command)

# commands = create_entity_localization_command_sequence(
        # "definitions",
        # DetectDefinitions,
        # DetectedEntityType=Definition,
        # #get_color_positions=get_term_color_positions,
        # upload_func=upload_definitions,
# )




definitions_pipeline = EntityPipeline("definitions", commands)
register_entity_pipeline(definitions_pipeline)



