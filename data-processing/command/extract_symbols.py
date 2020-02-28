import json
import logging
import os.path
import subprocess
from argparse import ArgumentParser
from dataclasses import dataclass
from typing import Iterator, List, Optional

from command.command import ArxivBatchCommand
from common import directories, file_utils
from common.parse_equation import KATEX_ERROR_COLOR, get_characters, get_symbols
from common.types import (
    ArxivId,
    Character,
    SerializableCharacter,
    SerializableChild,
    SerializableSymbol,
    SerializableToken,
    Symbol,
)


@dataclass(frozen=True)  # pylint: disable=too-many-instance-attributes
class SymbolData:
    arxiv_id: ArxivId
    success: bool
    equation_index: int
    tex_path: str
    equation: str
    characters: Optional[List[Character]]
    symbols: Optional[List[Symbol]]
    errorMessage: str


@dataclass(frozen=True)
class ParseResult:
    arxiv_id: ArxivId
    success: bool
    equation_index: int
    tex_path: str
    equation: str
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
            file_utils.clean_directory(directories.arxiv_subdir("symbols", arxiv_id))
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
            for symbol_data in _get_symbol_data(item, result.stdout):
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

        parse_results_path = os.path.join(tokens_dir, "parse_results.csv")
        file_utils.append_to_csv(
            parse_results_path,
            ParseResult(
                arxiv_id=result.arxiv_id,
                success=result.success,
                equation_index=result.equation_index,
                tex_path=result.tex_path,
                equation=result.equation,
                errorMessage=result.errorMessage,
            ),
        )

        # Save string representations of every character extracted from the equation
        if result.characters is not None and len(result.characters) > 0:
            tokens_path = os.path.join(tokens_dir, "tokens.csv")
            for token in result.characters:
                file_utils.append_to_csv(
                    tokens_path,
                    SerializableToken(
                        tex_path=result.tex_path,
                        equation=result.equation,
                        equation_index=result.equation_index,
                        token_index=token.i,
                        start=token.start,
                        end=token.end,
                        text=token.text,
                    ),
                )

        if result.symbols is not None and len(result.symbols) > 0:
            symbols_path = os.path.join(tokens_dir, "symbols.csv")
            symbol_tokens_path = os.path.join(tokens_dir, "symbol_tokens.csv")
            symbol_children_path = os.path.join(tokens_dir, "symbol_children.csv")

            for symbol_index, symbol in enumerate(result.symbols):
                # Save data for the symbol
                file_utils.append_to_csv(
                    symbols_path,
                    SerializableSymbol(
                        tex_path=result.tex_path,
                        equation_index=result.equation_index,
                        equation=result.equation,
                        symbol_index=symbol_index,
                        mathml=symbol.mathml,
                    ),
                )

                # Save the symbol's relationship to all its component characters
                for character in symbol.characters:
                    file_utils.append_to_csv(
                        symbol_tokens_path,
                        SerializableCharacter(
                            tex_path=result.tex_path,
                            equation_index=result.equation_index,
                            equation=result.equation,
                            symbol_index=symbol_index,
                            character_index=character,
                        ),
                    )

                # Save the symbol's relationship to its children
                for child in symbol.children:
                    file_utils.append_to_csv(
                        symbol_children_path,
                        SerializableChild(
                            tex_path=result.tex_path,
                            equation_index=result.equation_index,
                            equation=result.equation,
                            symbol_index=symbol_index,
                            child_index=result.symbols.index(child),
                        ),
                    )


def _get_symbol_data(arxiv_id: ArxivId, stdout: str) -> Iterator[SymbolData]:
    for result in stdout.strip().splitlines():
        data = json.loads(result)
        characters = None
        symbols = None

        if data["success"] is True:
            mathml = data["mathMl"]
            characters = get_characters(mathml)
            symbols = get_symbols(mathml)

        yield SymbolData(
            arxiv_id=arxiv_id,
            success=data["success"],
            equation_index=data["i"],
            tex_path=data["tex_path"],
            equation=data["equation"],
            characters=characters,
            symbols=symbols,
            errorMessage=data["errorMessage"],
        )
