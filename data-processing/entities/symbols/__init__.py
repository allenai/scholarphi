from common import directories
from common.commands.base import CommandList
from common.commands.compile_tex import make_compile_tex_command
from common.commands.diff_images import make_diff_images_command
from common.commands.locate_hues import make_locate_hues_command
from common.commands.raster_pages import make_raster_pages_command
from entities.common import EntityPipeline

from .commands.colorize_equation_tokens import ColorizeEquationTokens
from .commands.extract_symbols import ExtractSymbols
from .commands.find_symbol_matches import FindSymbolMatches
from .commands.locate_symbols import LocateSymbols
from .commands.upload_symbols import UploadSymbols

directories.register("symbols")
directories.register("symbol-matches")
directories.register("sources-with-colorized-equation-tokens")
directories.register("compiled-sources-with-colorized-equation-tokens")
directories.register("paper-with-colorized-equation-tokens-images")
directories.register("diff-images-with-colorized-equation-tokens")
directories.register("hue-locations-for-equation-tokens")
directories.register("symbol-locations")


commands = [
    ExtractSymbols,
    FindSymbolMatches,
    ColorizeEquationTokens,
    make_compile_tex_command("equation-tokens"),
    make_raster_pages_command("equation-tokens"),
    make_diff_images_command("equation-tokens"),
    make_locate_hues_command("equation-tokens"),
    LocateSymbols,
    UploadSymbols,
]

symbols_pipeline = EntityPipeline("symbols", commands, depends_on=["equations"])
