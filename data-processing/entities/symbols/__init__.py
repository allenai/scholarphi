from common import directories
from common.colorize_tex import ColorizeOptions
from common.commands.base import CommandList
from common.commands.locate_entities import make_locate_entities_command
from common.make_digest import make_default_paper_digest
from common.types import ArxivId, EntityProcessingDigest, SerializableToken
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from entities.sentences.commands.find_entity_sentences import (
    make_find_entity_sentences_command,
)

from .colorize import adjust_color_positions
from .commands.extract_symbols import ExtractSymbols
from .commands.find_symbol_matches import FindSymbolMatches
from .commands.find_symbol_sentences import FindSymbolSentences
from .commands.locate_symbols import LocateSymbols
from .commands.upload_symbols import UploadSymbols


directories.register("detected-equation-tokens")
directories.register("symbol-matches")
directories.register("sentences-for-equation-tokens")
directories.register("sentences-for-symbols")
directories.register("sources-with-colorized-equation-tokens")
directories.register("compiled-sources-with-colorized-equation-tokens")
directories.register("paper-images-with-colorized-equation-tokens")
directories.register("diffed-images-with-colorized-equation-tokens")
directories.register("equation-tokens-locations")
directories.register("symbol-locations")


commands = [
    ExtractSymbols,
    FindSymbolMatches,
    make_find_entity_sentences_command("equation-tokens"),
    FindSymbolSentences,
    make_locate_entities_command(
        "equation-tokens",
        DetectedEntityType=SerializableToken,
        colorize_options=ColorizeOptions(adjust_color_positions=adjust_color_positions),
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
