from typing import cast

from common.commands.base import CommandList
from common.parse_tex import EquationExtractor
from common.types import CharacterRange, Equation, SerializableEntity
from entities.common import create_entity_localization_command_sequence
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from .extractor import Sentence, SentenceExtractor
from .upload import Sentence as SentenceModel
from .upload import upload_sentences

commands = create_entity_localization_command_sequence(
    "sentences",
    SentenceExtractor,
    DetectedEntityType=Sentence,
    upload_func=upload_sentences,
)

sentences_pipeline = EntityPipeline(
    "sentences", commands, database_models=[SentenceModel]
)
register_entity_pipeline(sentences_pipeline)
