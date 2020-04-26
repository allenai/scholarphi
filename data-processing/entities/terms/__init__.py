from typing import cast

from common import directories
from common.commands.base import CommandList
from common.parse_tex import EquationExtractor
from common.types import CharacterRange, Equation, SerializableEntity
from entities.common import create_entity_localization_command_sequence
from scripts.pipelines import EntityPipeline, register_entity_pipeline
from .extractor import Term, TermExtractor

commands = create_entity_localization_command_sequence(
    "terms",
    TermExtractor
)

terms_pipeline = EntityPipeline(
    "terms", commands
)
register_entity_pipeline(terms_pipeline)

