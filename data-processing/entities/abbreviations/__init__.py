from common import directories
from common.commands.base import CommandList
from entities.common import create_entity_localization_command_sequence
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from .extractor import AbbreviationExtractor
from .types import Abbreviation


commands = create_entity_localization_command_sequence(
    "abbreviations",
    AbbreviationExtractor,
    DetectedEntityType=Abbreviation
)

abbreviations_pipeline = EntityPipeline(
    "abbreviations", commands
)
register_entity_pipeline(abbreviations_pipeline)
