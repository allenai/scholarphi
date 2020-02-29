import argparse
import logging
from typing import List

from command.annotate_symbols import AnnotateTexWithSymbolMarkers
from command.colorize_citations import ColorizeCitations
from command.colorize_equation_tokens import ColorizeEquationTokens
from command.command import Command
from command.compile_tex import (
    CompileTexSources,
    CompileTexSourcesWithColorizedCitations,
    CompileTexSourcesWithColorizedEquationTokens,
)
from command.compute_iou import ComputeIou
from command.debug_colorize_tex import DebugColorizeEquationTokens
from command.diff_images import (
    DiffImagesWithColorizedCitations,
    DiffImagesWithColorizedEquationTokens,
)
from command.extract_bibitems import ExtractBibitems
from command.extract_symbols import ExtractSymbols
from command.fetch_arxiv_sources import FetchArxivSources
from command.fetch_new_arxiv_ids import FetchNewArxivIds
from command.fetch_s2_data import FetchS2Metadata
from command.find_symbol_matches import FindSymbolMatches
from command.locate_citations import LocateCitations
from command.locate_hues import LocateCitationHues, LocateEquationTokenHues
from command.locate_symbols import LocateSymbols
from command.raster_pages import (
    RasterPages,
    RasterPagesWithColorizedCitations,
    RasterPagesWithColorizedEquationTokens,
)
from command.resolve_bibitems import ResolveBibitems
from command.store_pipeline_log import StorePipelineLog
from command.store_results import StoreResults
from command.unpack_sources import UnpackSources
from command.upload_citations import UploadCitations
from command.upload_symbols import UploadSymbols
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
    ExtractBibitems,
    ResolveBibitems,
    # Citations
    ColorizeCitations,
    CompileTexSourcesWithColorizedCitations,
    RasterPagesWithColorizedCitations,
    DiffImagesWithColorizedCitations,
    LocateCitationHues,
    LocateCitations,
] + equation_commands + [
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
    UploadCitations,
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
