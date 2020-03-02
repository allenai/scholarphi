from common import directories
from common.commands.base import CommandList
from common.commands.compile_tex import make_compile_tex_command
from common.commands.diff_images import make_diff_images_command
from common.commands.locate_hues import make_locate_hues_command
from common.commands.raster_pages import make_raster_pages_command
from scripts.pipelines import EntityPipeline, register_entity_pipeline

from ..sentences.commands.find_entity_sentences import (
    make_find_entity_sentences_command,
)
from .commands.colorize_equation_tokens import ColorizeEquationTokens
from .commands.extract_symbols import ExtractSymbols
from .commands.find_symbol_matches import FindSymbolMatches
from .commands.locate_symbols import LocateSymbols
from .commands.upload_symbols import UploadSymbols

directories.register("detected-symbols")
directories.register("symbol-matches")
directories.register("sentences-for-symbols")
directories.register("sources-with-colorized-equation-tokens")
directories.register("compiled-sources-with-colorized-equation-tokens")
directories.register("paper-with-colorized-equation-tokens-images")
directories.register("diff-images-with-colorized-equation-tokens")
directories.register("hue-locations-for-equation-tokens")
directories.register("symbol-locations")


commands = [
    ExtractSymbols,
    FindSymbolMatches,
    make_find_entity_sentences_command("symbols"),
    ColorizeEquationTokens,
    make_compile_tex_command("equation-tokens"),
    make_raster_pages_command("equation-tokens"),
    make_diff_images_command("equation-tokens"),
    make_locate_hues_command("equation-tokens"),
    LocateSymbols,
    UploadSymbols,
]

symbols_pipeline = EntityPipeline(
    "symbols", commands, depends_on=["equations"], optional_depends_on=["sentences"]
)
register_entity_pipeline(symbols_pipeline)
