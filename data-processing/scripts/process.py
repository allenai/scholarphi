import argparse
import logging
from typing import List

from scripts.annotate_pdfs import (
    AnnotatePdfsWithCitationBoxes,
    AnnotatePdfsWithEquationBoxes,
    AnnotatePdfsWithEquationTokenBoxes,
)
from scripts.annotate_symbols import AnnotateTexWithSymbolMarkers
from scripts.colorize_citations import ColorizeCitations
from scripts.colorize_equation_tokens import ColorizeEquationTokens
from scripts.colorize_equations import ColorizeEquations
from scripts.command import Command
from scripts.compile_tex import (
    CompileTexSources,
    CompileTexSourcesWithColorizedCitations,
    CompileTexSourcesWithColorizedEquations,
    CompileTexSourcesWithColorizedEquationTokens,
)
from scripts.compute_iou import ComputeIou
from scripts.debug_colorize_tex import (
    DebugColorizeEquations,
    DebugColorizeEquationTokens,
)
from scripts.diff_images import (
    DiffImagesWithColorizedCitations,
    DiffImagesWithColorizedEquations,
    DiffImagesWithColorizedEquationTokens,
)
from scripts.extract_bibitems import ExtractBibitems
from scripts.extract_equations import ExtractEquations
from scripts.extract_symbols import ExtractSymbols
from scripts.fetch_arxiv_sources import FetchArxivSources
from scripts.fetch_new_arxiv_ids import FetchNewArxivIds
from scripts.fetch_s2_data import FetchS2Metadata
from scripts.find_symbol_matches import FindSymbolMatches
from scripts.locate_citations import LocateCitations
from scripts.locate_hues import (
    LocateCitationHues,
    LocateEquationHues,
    LocateEquationTokenHues,
)
from scripts.locate_symbols import LocateSymbols
from scripts.raster_pages import (
    RasterPages,
    RasterPagesWithColorizedCitations,
    RasterPagesWithColorizedEquations,
    RasterPagesWithColorizedEquationTokens,
)
from scripts.resolve_bibitems import ResolveBibitems
from scripts.store_pipeline_log import StorePipelineLog
from scripts.store_results import StoreResults
from scripts.unpack_sources import UnpackSources
from scripts.upload_citations import UploadCitations
from scripts.upload_symbols import UploadSymbols

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
    ExtractBibitems,
    ResolveBibitems,
    ColorizeCitations,
    ColorizeEquations,
    ExtractEquations,
    ExtractSymbols,
    FindSymbolMatches,
    ColorizeEquationTokens,
    CompileTexSources,
    CompileTexSourcesWithColorizedCitations,
    CompileTexSourcesWithColorizedEquations,
    CompileTexSourcesWithColorizedEquationTokens,
    RasterPages,
    RasterPagesWithColorizedCitations,
    RasterPagesWithColorizedEquations,
    RasterPagesWithColorizedEquationTokens,
    DiffImagesWithColorizedCitations,
    DiffImagesWithColorizedEquations,
    DiffImagesWithColorizedEquationTokens,
    LocateCitationHues,
    LocateCitations,
    LocateEquationHues,
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
    DebugColorizeEquations,
    DebugColorizeEquationTokens,
    AnnotatePdfsWithCitationBoxes,
    AnnotatePdfsWithEquationBoxes,
    AnnotatePdfsWithEquationTokenBoxes,
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
