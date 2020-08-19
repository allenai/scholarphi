from common import directories
from common.colorize_tex import ColorizeOptions
from common.types import SerializableEntity, Term
from entities.common import create_entity_localization_command_sequence
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

terms_pipeline = EntityPipeline("glossary-terms", commands)
register_entity_pipeline(terms_pipeline)
