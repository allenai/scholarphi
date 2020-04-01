# This is omitting imports
from typing import cast

from common import directories
from common.commands.base import CommandList
from common.parse_tex import EquationExtractor
from common.types import CharacterRange, Equation, SerializableEntity
from entities.common import create_entity_localization_command_sequence
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from .extractor import Sentence, SentenceExtractor
from .upload import Sentence as SentenceModel
from .upload import upload_sentences

commands = create_entity_localization_command_sequence(
    "terms",
    TermExtractor
    # Don't need these two arguments
    # DetectedEntityType=Sentence,
    # upload_func=upload_sentences,
)

# Don't need this
# Register additional directories to be used by the upload function
# directories.register("sentences-model-ids")

terms_pipeline = EntityPipeline(
    "terms", commands
    # We'll get to database uploads later; you don't need this for now
    # , database_models=[SentenceModel]
)
register_entity_pipeline(terms_pipeline)

