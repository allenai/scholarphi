import argparse
import logging
from typing import List

from common.commands.annotate_symbols import AnnotateTexWithSymbolMarkers
from common.commands.base import Command
from common.commands.colorize_equation_tokens import ColorizeEquationTokens
from common.commands.compile_tex import (
    CompileTexSources,
    CompileTexSourcesWithColorizedEquationTokens,
)
from common.commands.compute_iou import ComputeIou
from common.commands.debug_colorize_tex import DebugColorizeEquationTokens
from common.commands.diff_images import DiffImagesWithColorizedEquationTokens
from common.commands.extract_symbols import ExtractSymbols
from common.commands.fetch_arxiv_sources import FetchArxivSources
from common.commands.fetch_new_arxiv_ids import FetchNewArxivIds
from common.commands.fetch_s2_data import FetchS2Metadata
from common.commands.find_symbol_matches import FindSymbolMatches
from common.commands.locate_hues import LocateEquationTokenHues
from common.commands.locate_symbols import LocateSymbols
from common.commands.raster_pages import (
    RasterPages,
    RasterPagesWithColorizedEquationTokens,
)
from common.commands.store_pipeline_log import StorePipelineLog
from common.commands.store_results import StoreResults
from common.commands.unpack_sources import UnpackSources
from common.commands.upload_symbols import UploadSymbols
from entities.citations import commands as citation_commands
from entities.equations import commands as equation_commands

PREPARATION_COMMANDS: List = [  # type: ignore
    FetchNewArxivIds,
]

"""
All of the main pipeline commands are batch commands that can be run on a set of arXiv IDs. The
sequence here is the recommended sequence of running the commands if you are batch processing all
entities in a set of papers.
"""
MAIN_PIPELINE_COMMANDS: List = [  # type: ignore
    FetchArxivSources,
    FetchS2Metadata,
    UnpackSources,
    CompileTexSources,
    RasterPages,
] + citation_commands + equation_commands + [
    # Symbols
    ExtractSymbols,
    FindSymbolMatches,
    ColorizeEquationTokens,
    CompileTexSourcesWithColorizedEquationTokens,
    RasterPagesWithColorizedEquationTokens,
    DiffImagesWithColorizedEquationTokens,
    LocateEquationTokenHues,
    LocateSymbols,
]

STORE_RESULTS_COMMANDS: List = [  # type: ignore
    StoreResults,
    # Store pipeline logs after results, so that we can include the result storage in the pipeline logs.
    StorePipelineLog,
]

DATABASE_UPLOAD_COMMANDS: List = [  # type: ignore
    UploadSymbols,
]

EVALUATION_COMMANDS: List = [  # type: ignore
    DebugColorizeEquationTokens,
    AnnotateTexWithSymbolMarkers,
    ComputeIou,
]

ALL_COMMANDS = (
    PREPARATION_COMMANDS
    + MAIN_PIPELINE_COMMANDS
    + STORE_RESULTS_COMMANDS
    + DATABASE_UPLOAD_COMMANDS
    + EVALUATION_COMMANDS
)


def run_command(cmd: Command) -> None:  # type: ignore
    for item in cmd.load():
        for result in cmd.process(item):
            cmd.save(item, result)


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Process arXiv papers.")
    parser.add_argument("-v", help="print debugging information", action="store_true")
    subparsers = parser.add_subparsers(help="data processing commands")

    for CommandClass in ALL_COMMANDS:
        command_parser = subparsers.add_parser(
            CommandClass.get_name(), help=CommandClass.get_description()
        )
        command_parser.set_defaults(command_class=CommandClass)
        CommandClass.init_parser(command_parser)

    args = parser.parse_args()
    if not hasattr(args, "command_class"):
        parser.print_help()
        raise SystemExit

    if args.v:
        logging.basicConfig(level=logging.DEBUG)

    CommandClass = args.command_class
    command = CommandClass(args)
    run_command(command)
