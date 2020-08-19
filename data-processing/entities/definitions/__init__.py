from common import directories
from common.commands.base import Command, CommandList
from common.commands.detect_entities import make_detect_entities_command
from common.commands.locate_entities import make_locate_entities_command
from common.commands.upload_entities import make_upload_entities_command
from entities.common import create_entity_localization_command_sequence
from scripts.pipelines import EntityPipeline, register_entity_pipeline

# from .colorize import get_definition_color_positions
from .commands.detect_definitions import DetectDefinitions
from .commands.embellish_sentences import EmbellishSentences
from .types import Definiendum, Definition, TermReference
from .upload import upload_definitions

# Register directories for output from intermediate pipeline stages.
directories.register("embellished-sentences")
directories.register("detected-definitions")
directories.register("sources-with-colorized-definitions")
directories.register("compiled-sources-with-colorized-definitions")
directories.register("paper-images-with-colorized-definitions")
directories.register("diffed-images-with-colorized-definitions")
directories.register("definitions-locations")


upload_command = make_upload_entities_command(
    "definitions",
    upload_definitions,
    DetectedEntityType={
        "entities-definiendums.csv": Definiendum,
        "entities-definitions.csv": Definition,
        "entities-term-references.csv": TermReference,
    },
)


commands: CommandList = [
    EmbellishSentences,
    DetectDefinitions,
    make_locate_entities_command("definitions"),
    upload_command,
]


definitions_pipeline = EntityPipeline(
    "definitions", commands, depends_on=["symbols", "sentences"],
)
register_entity_pipeline(definitions_pipeline)
