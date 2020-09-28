from typing import Any, cast

from common import directories
from common.colorize_tex import ColorizeOptions
from common.commands.base import CommandList
from common.commands.locate_entities import make_locate_entities_command
from common.make_digest import make_default_paper_digest
from common.types import (
    ArxivId,
    EntityProcessingDigest,
    SerializableEntity,
    SerializableSymbol,
    SerializableToken,
)
from entities.sentences.commands.extract_contexts import make_extract_contexts_command
from entities.sentences.types import TexWrapper
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from .colorize import adjust_color_positions
from .commands.extract_symbols import ExtractSymbols
from .commands.find_symbol_matches import FindSymbolMatches
from .commands.locate_symbols import LocateSymbols
from .commands.upload_symbols import UploadSymbols

directories.register("detected-equation-tokens")
directories.register("detected-symbols")
directories.register("symbol-matches")
directories.register("contexts-for-symbols")
directories.register("sources-with-colorized-equation-tokens")
directories.register("compiled-sources-with-colorized-equation-tokens")
directories.register("paper-images-with-colorized-equation-tokens")
directories.register("diffed-images-with-colorized-equation-tokens")
directories.register("equation-tokens-locations")
directories.register("symbol-locations")


def entity_key_for_contexts(entity: SerializableEntity) -> Any:
    """
    When constructing snippets for the contexts symbols appear in, determine whether
    two symbols should be highlighted as the 'same symbol' using their MathML.
    """
    symbol = cast(SerializableSymbol, entity)
    return symbol.mathml


commands = [
    ExtractSymbols,
    FindSymbolMatches,
    make_extract_contexts_command(
        "symbols",
        EntityType=SerializableSymbol,
        entity_key=entity_key_for_contexts,
        tex_wrapper=TexWrapper(
            before=r"\htmlClass{match-highlight}{", after="}", braces=True
        ),
    ),
    make_locate_entities_command(
        "equation-tokens",
        DetectedEntityType=SerializableToken,
        colorize_options=ColorizeOptions(
            adjust_color_positions=adjust_color_positions, braces=True
        ),
    ),
    LocateSymbols,
    UploadSymbols,
]


def make_digest(_: str, arxiv_id: ArxivId) -> EntityProcessingDigest:
    """
    Custom digest creator. Count the equation tokens, instead of the 'symbols', as we can
    use the default entity counters for the outputs of equation token commands.
    """
    return make_default_paper_digest("equation-tokens", arxiv_id)


symbols_pipeline = EntityPipeline(
    "symbols", commands, depends_on=["equations", "sentences"], make_digest=make_digest,
)
register_entity_pipeline(symbols_pipeline)
