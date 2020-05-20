from common import directories
from common.types import SerializableEntity
from entities.common import create_entity_localization_command_sequence
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from .colorize import get_term_color_positions
from .extractor import TermExtractor
from .types import Term
from .upload import Term as TermModel
from .upload import upload_terms

commands = create_entity_localization_command_sequence(
    "terms",
    TermExtractor,
    DetectedEntityType=Term,
    get_color_positions=get_term_color_positions,
    upload_func=upload_terms,
)

directories.register("terms-model-ids")
terms_pipeline = EntityPipeline("terms", commands, database_models=[TermModel])
register_entity_pipeline(terms_pipeline)
