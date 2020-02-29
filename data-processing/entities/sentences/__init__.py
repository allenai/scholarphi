from typing import cast

from common.commands.base import CommandList
from common.commands.utils import create_entity_localization_command_sequence
from common.parse_tex import EquationExtractor
from common.types import CharacterRange, Equation, SerializableEntity
from entities.common import EntityPipeline

from .extractor import SentenceExtractor

commands = create_entity_localization_command_sequence("sentences", SentenceExtractor)

sentences_pipeline = EntityPipeline("sentences", commands)
