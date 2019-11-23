import csv
import json
import logging
import os.path
import subprocess
from typing import Iterator, List, NamedTuple, Optional

from explanations import directories
from explanations.directories import NODE_DIRECTORY
from explanations.file_utils import clean_directory
from explanations.parse_equation import get_characters, get_symbols
from explanations.types import ArxivId, Character, Path, Symbol
from scripts.command import ArxivBatchCommand


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

    def get_arxiv_ids_dir(self) -> Path:
        return directories.EQUATIONS_DIR

    def load(self) -> Iterator[ArxivId]:
        for arxiv_id in self.arxiv_ids:
            clean_directory(directories.symbols(arxiv_id))
            yield arxiv_id

    def process(self, item: ArxivId) -> Iterator[SymbolData]:
        equations_abs_path = os.path.abspath(
            os.path.join(directories.equations(item), "equations.csv")
        )
        node_directory_abs_path = os.path.abspath(NODE_DIRECTORY)
        equations_relative_path = os.path.relpath(
            equations_abs_path, node_directory_abs_path
        )
        if not os.path.exists(equations_abs_path):
            logging.warning(
                "No directory of equations for arXiv ID %s. Skipping.", item
            )
            return

        result = subprocess.run(
            [
                "npm",
                # Suppress boilerplate 'npm' output we don't care about.
                "--silent",
                "start",
                "equations-csv",
                equations_relative_path,
            ],
            cwd=NODE_DIRECTORY,
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
        tokens_dir = directories.symbols(item)
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

        with open(os.path.join(tokens_dir, "parse_results.json"), "a") as results_file:
            writer = csv.writer(results_file, quoting=csv.QUOTE_ALL)
            writer.writerow(
                [
                    result.path,
                    result.i,
                    result.equation,
                    result.success,
                    result.errorMessage,
                ]
            )

        if result.characters is not None and len(result.characters) > 0:
            with open(os.path.join(tokens_dir, "tokens.csv"), "a") as tokens_file:
                writer = csv.writer(tokens_file, quoting=csv.QUOTE_ALL)
                for token in result.characters:
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

        if result.symbols is not None and len(result.symbols) > 0:
            with open(
                os.path.join(tokens_dir, "symbols.csv"), "a"
            ) as symbols_file, open(
                os.path.join(tokens_dir, "symbol_children.csv"), "a"
            ) as symbol_children_file, open(
                os.path.join(tokens_dir, "symbol_tokens.csv"), "a"
            ) as symbol_tokens_file:

                symbols_writer = csv.writer(symbols_file, quoting=csv.QUOTE_ALL)
                symbol_tokens_writer = csv.writer(
                    symbol_tokens_file, quoting=csv.QUOTE_ALL
                )
                symbol_children_writer = csv.writer(
                    symbol_children_file, quoting=csv.QUOTE_ALL
                )

                for symbol_index, symbol in enumerate(result.symbols):
                    symbols_writer.writerow(
                        [
                            result.path,
                            result.i,
                            result.equation,
                            symbol_index,
                            symbol.mathml,
                        ]
                    )
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
