from common import directories
from common.colorize_tex import ColorizeOptions
from common.commands.upload_entities import UploadEntitiesCommand
from common.types import SerializableEntity, Term
from entities.common import create_entity_localization_command_sequence
from entities.sentences.commands.extract_contexts import make_extract_contexts_command
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from .colorize import adjust_color_positions
from .extractor import GlossaryTermExtractor
from .upload import upload_terms

commands = create_entity_localization_command_sequence(
    "glossary-terms",
    GlossaryTermExtractor,
    DetectedEntityType=Term,
    colorize_options=ColorizeOptions(adjust_color_positions=adjust_color_positions),
    upload_func=upload_terms,
)

# Before uploading entities, extract contexts that each term appeared in.
upload_command_index = len(commands)
for i, command in enumerate(commands):
    if command.get_name() == "upload-glossary-terms":
        upload_command_index = i

directories.register("contexts-for-glossary-terms")
commands.insert(
    upload_command_index,
    make_extract_contexts_command("glossary-terms", EntityType=Term),
)

terms_pipeline = EntityPipeline("glossary-terms", commands)
register_entity_pipeline(terms_pipeline)
