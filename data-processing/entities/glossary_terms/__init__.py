from common import directories
from common.types import SerializableEntity, Term
from entities.common import create_entity_localization_command_sequence
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from .colorize import get_term_color_positions
from .extractor import GlossaryTermExtractor
from .upload import upload_terms

commands = create_entity_localization_command_sequence(
    "glossary-terms",
    GlossaryTermExtractor,
    DetectedEntityType=Term,
    get_color_positions=get_term_color_positions,
    upload_func=upload_terms,
)

terms_pipeline = EntityPipeline("glossary-terms", commands)
register_entity_pipeline(terms_pipeline)
