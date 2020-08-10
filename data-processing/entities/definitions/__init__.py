from common import directories
from common.commands.base import Command, CommandList
from common.commands.colorize_tex import make_colorize_tex_command
from common.commands.compile_tex import make_compile_tex_command
from common.commands.detect_entities import make_detect_entities_command
from common.commands.diff_images import make_diff_images_command
from common.commands.locate_hues import make_locate_hues_command
from common.commands.raster_pages import make_raster_pages_command
from common.commands.upload_entities import make_upload_entities_command
from entities.common import create_entity_localization_command_sequence
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from ..sentences.commands.find_entity_sentences import (
    make_find_entity_sentences_command,
)

# from .colorize import get_definition_color_positions
from .extractor import DetectDefinitions
from .types import Definiendum, Definition, TermReference
from .upload import upload_definitions

# Register directories for output from intermediate pipeline stages.
directories.register("detected-definitions")
directories.register("sources-with-colorized-definitions")
directories.register("compiled-sources-with-colorized-definitions")
directories.register("paper-with-colorized-definitions-images")
directories.register("diff-images-with-colorized-definitions")
directories.register("hue-locations-for-definitions")


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
    DetectDefinitions,
    make_colorize_tex_command("definitions"),
    make_compile_tex_command("definitions"),
    make_raster_pages_command("definitions"),
    make_diff_images_command("definitions"),
    make_locate_hues_command("definitions"),
    upload_command,
]


definitions_pipeline = EntityPipeline(
    "definitions", commands, optional_depends_on=["sentences"],
)
register_entity_pipeline(definitions_pipeline)
