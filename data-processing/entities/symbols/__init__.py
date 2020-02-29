from common.commands.compile_tex import make_compile_tex_command
from common.commands.diff_images import make_diff_images_command
from common.commands.locate_hues import make_locate_hues_command
from common.commands.raster_pages import make_raster_pages_command

from .commands.colorize_equation_tokens import ColorizeEquationTokens
from .commands.extract_symbols import ExtractSymbols
from .commands.find_symbol_matches import FindSymbolMatches
from .commands.locate_symbols import LocateSymbols
from .commands.upload_symbols import UploadSymbols

commands = [
    ExtractSymbols,
    FindSymbolMatches,
    ColorizeEquationTokens,
    make_compile_tex_command("equation-tokens", "symbols"),
    make_raster_pages_command("equation-tokens", "symbols"),
    make_diff_images_command("equation-tokens", "symbols"),
    make_locate_hues_command("equation-tokens", "symbols"),
    LocateSymbols,
    UploadSymbols,
]
