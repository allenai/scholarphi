import csv
import json
import logging
import os.path
import subprocess
from argparse import ArgumentParser
from typing import Iterator, List, NamedTuple, Optional

from command.command import ArxivBatchCommand
from common import directories
from common.file_utils import clean_directory
from common.parse_equation import KATEX_ERROR_COLOR, get_characters, get_symbols
from common.types import ArxivId, Character, Symbol


class SymbolData(NamedTuple):
    success: bool
    i: int
    path: str
    equation: str
    characters: Optional[List[Character]]
    symbols: Optional[List[Symbol]]
    errorMessage: str


class ExtractSymbols(ArxivBatchCommand[ArxivId, SymbolData]):
    @staticmethod
    def get_name() -> str:
        return "extract-symbols"

    @staticmethod
    def get_description() -> str:
        return (
            "Extract symbols and the character tokens within them from TeX equations."
        )

    @staticmethod
    def get_entity_type() -> str:
        return "symbols"

    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        super(ExtractSymbols, ExtractSymbols).init_parser(parser)
        parser.add_argument(
            "--katex-throw-on-error",
            action="store_true",
            help=(
                "Whether KaTeX should throw an error when it fails to parse and equation."
                + " Use this flag if you're trying to diagnose sources of KaTeX parse errors."
                + " Otherwise, omit this so that a partial, perhaps slightly inaccurate parse "
                + " is run even if errors are found in equations."
            ),
        )
        parser.add_argument(
            "--katex-error-color",
            type=str,
            help=(
                "Hex code that KaTeX should use when creating nodes for parts of equations that"
                + " failed to parse. It only makes sense to set this if '--katex-throw-on-error'"
                + " is not set."
            ),
            default=KATEX_ERROR_COLOR,
        )

    def get_arxiv_ids_dirkey(self) -> str:
        return "equations"

    def load(self) -> Iterator[ArxivId]:
        for arxiv_id in self.arxiv_ids:
            clean_directory(directories.arxiv_subdir("symbols", arxiv_id))
            yield arxiv_id

    def process(self, item: ArxivId) -> Iterator[SymbolData]:
        equations_abs_path = os.path.abspath(
            os.path.join(directories.arxiv_subdir("equations", item), "equations.csv")
        )
        node_directory_abs_path = os.path.abspath(directories.NODE_DIRECTORY)
        equations_relative_path = os.path.relpath(
            equations_abs_path, node_directory_abs_path
        )
        if not os.path.exists(equations_abs_path):
            logging.warning(
                "No directory of equations for arXiv ID %s. Skipping.", item
            )
            return

        command_args = [
            "npm",
            # Suppress boilerplate 'npm' output we don't care about.
            "--silent",
            "start",
            "equations-csv",
            equations_relative_path,
        ]

        if self.args.katex_throw_on_error or (self.args.katex_error_color is not None):
            command_args += ["--"]
            if self.args.katex_throw_on_error:
                command_args += ["--throw-on-error"]
            if self.args.katex_error_color is not None:
                command_args += ["--error-color", self.args.katex_error_color]

        logging.debug("Running command with arguments: %s", command_args)
        result = subprocess.run(
            command_args,
            cwd=directories.NODE_DIRECTORY,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            encoding="utf-8",
            check=False,
        )

        if result.returncode == 0:
            for symbol_data in _get_symbol_data(result.stdout):
                yield symbol_data
        else:
            logging.error(
                "Equation parsing for %s unexpectedly failed.\nStdout: %s\nStderr: %s\n",
                item,
                result.stdout,
                result.stderr,
            )

    def save(self, item: ArxivId, result: SymbolData) -> None:
        tokens_dir = directories.arxiv_subdir("symbols", item)
        if not os.path.exists(tokens_dir):
            os.makedirs(tokens_dir)

        if result.success:
            logging.debug(
                "Successfully extracted characters: %s", str(result.characters)
            )
        else:
            logging.warning(
                "Could not parse equation %s. See logs in %s.",
                result.equation,
                tokens_dir,
            )

        with open(
            os.path.join(tokens_dir, "parse_results.csv"), "a", encoding="utf-8"
        ) as results_file:
            writer = csv.writer(results_file, quoting=csv.QUOTE_ALL)
            try:
                writer.writerow(
                    [
                        item,
                        result.path,
                        result.i,
                        result.equation,
                        result.success,
                        result.errorMessage,
                    ]
                )
            except Exception:  # pylint: disable=broad-except
                logging.warning(
                    "Couldn't write parse results for arXiv %s: can't be converted to utf-8",
                    item,
                )

        if result.characters is not None and len(result.characters) > 0:
            with open(
                os.path.join(tokens_dir, "tokens.csv"), "a", encoding="utf-8"
            ) as tokens_file:
                writer = csv.writer(tokens_file, quoting=csv.QUOTE_ALL)
                for token in result.characters:
                    try:
                        writer.writerow(
                            [
                                result.path,
                                result.i,
                                result.equation,
                                token.i,
                                token.start,
                                token.end,
                                token.text,
                            ]
                        )
                    except Exception:  # pylint: disable=broad-except
                        logging.warning(
                            "Couldn't write row for token for arXiv %s: can't be converted to utf-8",
                            item,
                        )

        if result.symbols is not None and len(result.symbols) > 0:
            with open(
                os.path.join(tokens_dir, "symbols.csv"), "a", encoding="utf-8"
            ) as symbols_file, open(
                os.path.join(tokens_dir, "symbol_children.csv"), "a", encoding="utf-8"
            ) as symbol_children_file, open(
                os.path.join(tokens_dir, "symbol_tokens.csv"), "a", encoding="utf-8"
            ) as symbol_tokens_file:

                symbols_writer = csv.writer(symbols_file, quoting=csv.QUOTE_ALL)
                symbol_tokens_writer = csv.writer(
                    symbol_tokens_file, quoting=csv.QUOTE_ALL
                )
                symbol_children_writer = csv.writer(
                    symbol_children_file, quoting=csv.QUOTE_ALL
                )

                for symbol_index, symbol in enumerate(result.symbols):
                    try:
                        symbols_writer.writerow(
                            [
                                result.path,
                                result.i,
                                result.equation,
                                symbol_index,
                                symbol.mathml,
                            ]
                        )
                    except Exception:  # pylint: disable=broad-except
                        logging.warning(
                            "Couldn't write row for symbol for arXiv %s: can't be converted to utf-8",
                            item,
                        )
                        continue
                    for character in symbol.characters:
                        symbol_tokens_writer.writerow(
                            [
                                result.path,
                                result.i,
                                result.equation,
                                symbol_index,
                                character,
                            ]
                        )
                    for child in symbol.children:
                        symbol_children_writer.writerow(
                            [
                                result.path,
                                result.i,
                                result.equation,
                                symbol_index,
                                result.symbols.index(child),
                            ]
                        )


def _get_symbol_data(stdout: str) -> Iterator[SymbolData]:
    for result in stdout.strip().splitlines():
        data = json.loads(result)
        characters = None
        symbols = None

        if data["success"] is True:
            mathml = data["mathMl"]
            characters = get_characters(mathml)
            symbols = get_symbols(mathml)

        yield SymbolData(
            success=data["success"],
            i=data["i"],
            path=data["path"],
            equation=data["equation"],
            characters=characters,
            symbols=symbols,
            errorMessage=data["errorMessage"],
        )
