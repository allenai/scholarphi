from common import directories
from common.commands.base import CommandList
from entities.common import create_entity_localization_command_sequence
from scripts.pipelines import EntityPipeline, register_entity_pipeline

# from .colorize import get_definition_color_positions
from .extractor import DetectedDefinitions
from .types import Definition
from .upload import upload_definitions, Definition as DefinitionModel

from ..sentences.commands.find_entity_sentences import (
    make_find_entity_sentences_command,
)
from common.commands.detect_entities import make_detect_entities_command
from common.commands.base import Command, CommandList


# Register additional directories to be used by the upload function
directories.register("definitions-model-ids")

# Register directories for output from intermediate pipeline stages.
directories.register("detected-definitions")
# directories.register(f"sources-with-colorized-{entity_name}")
# directories.register(f"compiled-sources-with-colorized-{entity_name}")
# directories.register(f"paper-with-colorized-{entity_name}-images")
# directories.register(f"diff-images-with-colorized-{entity_name}")
# directories.register(f"hue-locations-for-{entity_name}")

# commands: CommandList = [
    # make_detect_entities_command(entity_name, EntityExtractorType),
    # make_colorize_tex_command(
        # entity_name=entity_name,
        # DetectedEntityType=DetectedEntityType,
        # when=colorize_entity_when,
        # get_color_positions=get_color_positions,
    # ),
    # make_compile_tex_command(entity_name),
    # make_raster_pages_command(entity_name),
    # make_diff_images_command(entity_name),
    # make_locate_hues_command(entity_name),
# ]



# commands = [
    # DetectedDefinitions,
    # make_find_entity_sentences_command("detected-definitions"),
    # # make_find_entity_sentences_command("predicted-definitions"),
    # # make_colorize_tex_command("definitions"),
    # # make_compile_tex_command("equation-tokens"),
    # # make_raster_pages_command("equation-tokens"),
    # # make_diff_images_command("equation-tokens"),
    # # make_locate_hues_command("equation-tokens"),
    # upload_definitions  # this needs to be implemented
# ]

commands: CommandList = [
    # make_detect_entities_command(entity_name, EntityExtractorType),
    DetectedDefinitions,
    make_find_entity_sentences_command("detected-definitions"),
    # make_find_entity_sentences_command("predicted-definitions"),
    # make_colorize_tex_command("definitions"),
    # make_compile_tex_command("equation-tokens"),
    # make_raster_pages_command("equation-tokens"),
    # make_diff_images_command("equation-tokens"),
    # make_locate_hues_command("equation-tokens"),
    upload_definitions  # this needs to be implemented

]





# commands = create_entity_localization_command_sequence(
    # "definitions",
    # PredictDefinitions,
    # DetectedEntityType=Definition,
    # # get_color_positions=get_sentence_color_positions,
    # upload_func=upload_definitions,
# )

definitions_pipeline = EntityPipeline(
    "definitions",
    commands,
    depends_on=["sentences"],
    database_models=[DefinitionModel]
)
register_entity_pipeline(definitions_pipeline)

