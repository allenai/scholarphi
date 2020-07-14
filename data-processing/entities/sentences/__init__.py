from common import directories
from common.commands.base import CommandList
from entities.common import create_entity_localization_command_sequence
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from .colorize import get_sentence_color_positions
from .extractor import SentenceExtractor
from .types import Sentence
from .upload import upload_sentences

commands = create_entity_localization_command_sequence(
    "sentences",
    SentenceExtractor,
    DetectedEntityType=Sentence,
    get_color_positions=get_sentence_color_positions,
    upload_func=upload_sentences,
)

sentences_pipeline = EntityPipeline("sentences", commands)
register_entity_pipeline(sentences_pipeline)
