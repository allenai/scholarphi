import json
import logging
import os.path
import subprocess
from argparse import ArgumentParser
from dataclasses import dataclass
from typing import Iterator, List, Optional

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.parse_equation import KATEX_ERROR_COLOR, Node, parse_equation
from common.types import (
    ArxivId,
    SerializableChild,
    SerializableSymbol,
    SerializableSymbolToken,
    SerializableToken,
)


@dataclass(frozen=True)  # pylint: disable=too-many-instance-attributes
class SymbolData:
    arxiv_id: ArxivId
    success: bool
    equation_index: int
    tex_path: str
    equation: str
    equation_start: int
    equation_depth: int
    context_tex: str
    symbols: Optional[List[Node]]
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
        return "Extract symbols and the tokens within them from TeX equations."

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

    def get_arxiv_ids_dirkey(self) -> str:
        return "detected-equations"

    def load(self) -> Iterator[ArxivId]:
        for arxiv_id in self.arxiv_ids:
            file_utils.clean_directory(
                directories.arxiv_subdir("detected-equation-tokens", arxiv_id)
            )
            yield arxiv_id

    def process(self, item: ArxivId) -> Iterator[SymbolData]:
        equations_abs_path = os.path.abspath(
            os.path.join(
                directories.arxiv_subdir("detected-equations", item), "entities.csv"
            )
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

        command_args += ["--"]
        if self.args.katex_throw_on_error:
            command_args += ["--throw-on-error"]
        command_args += ["--error-color", KATEX_ERROR_COLOR]

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
        tokens_dir = directories.arxiv_subdir("detected-equation-tokens", item)
        if not os.path.exists(tokens_dir):
            os.makedirs(tokens_dir)

        if result.success and result.symbols is not None:
            logging.debug(
                "Successfully extracted %d symbols for equation %s.",
                len(result.symbols),
                result.equation,
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

        # Save symbol data, including parent-child relationships between symbols, and which tokens
        # were found in each symbol.
        if result.symbols is not None and len(result.symbols) > 0:
            symbols = result.symbols

            tokens_path = os.path.join(tokens_dir, "entities.csv")
            symbols_path = os.path.join(tokens_dir, "symbols.csv")
            symbol_tokens_path = os.path.join(tokens_dir, "symbol_tokens.csv")
            symbol_children_path = os.path.join(tokens_dir, "symbol_children.csv")

            # The list of symbol children might be empty, e.g., for a paper with only
            # very simple symbols. Make sure there's at least an empty file, as later stages expect
            # to be able to read the list of symbol children at this path.
            open(symbol_children_path, "a").close()

            all_tokens = set()
            for symbol in symbols:
                symbol_index = symbols.index(symbol)

                # Save a record of this symbol.
                file_utils.append_to_csv(
                    symbols_path,
                    SerializableSymbol(
                        tex_path=result.tex_path,
                        equation_index=result.equation_index,
                        equation=result.equation,
                        symbol_index=symbol_index,
                        mathml=str(symbol.element),
                    ),
                )

                # Save the relationships between this symbol and its tokens.
                all_tokens.update(symbol.tokens)
                for token in symbol.tokens:
                    file_utils.append_to_csv(
                        symbol_tokens_path,
                        SerializableSymbolToken(
                            tex_path=result.tex_path,
                            equation_index=result.equation_index,
                            symbol_index=symbol_index,
                            token_index=token.token_index,
                        ),
                    )

                # Save the relationships between this symbol and its children.
                for child in symbol.children:
                    child_index = symbols.index(child)
                    file_utils.append_to_csv(
                        symbol_children_path,
                        SerializableChild(
                            tex_path=result.tex_path,
                            equation_index=result.equation_index,
                            equation=result.equation,
                            symbol_index=symbol_index,
                            child_index=child_index,
                        ),
                    )

            # Write record of all tokens to file.
            for token in all_tokens:
                file_utils.append_to_csv(
                    tokens_path,
                    SerializableToken(
                        tex_path=result.tex_path,
                        id_=f"{result.equation_index}-{token.token_index}",
                        equation_index=result.equation_index,
                        token_index=token.token_index,
                        start=result.equation_start + token.start,
                        end=result.equation_start + token.end,
                        relative_start=token.start,
                        relative_end=token.end,
                        tex=result.equation[token.start : token.end],
                        context_tex=result.context_tex,
                        text=token.text,
                        equation=result.equation,
                        equation_depth=result.equation_depth,
                    ),
                )


def _get_symbol_data(arxiv_id: ArxivId, stdout: str) -> Iterator[SymbolData]:
    for result in stdout.strip().splitlines():
        data = json.loads(result)
        symbols = None

        if data["success"] is True:
            mathml = data["mathMl"]
            symbols = parse_equation(mathml)

        yield SymbolData(
            arxiv_id=arxiv_id,
            success=data["success"],
            equation_index=int(data["i"]),
            tex_path=data["tex_path"],
            equation=data["equation"],
            equation_start=int(data["equation_start"]),
            equation_depth=int(data["equation_depth"]),
            context_tex=data["context_tex"],
            errorMessage=data["errorMessage"],
            symbols=symbols,
        )
