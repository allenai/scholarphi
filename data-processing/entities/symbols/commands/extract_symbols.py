import json
import logging
import os.path
import re
import subprocess
from argparse import ArgumentParser
from dataclasses import dataclass
from typing import Iterator, List, Optional, Set, Tuple

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
class EquationSymbols:
    arxiv_id: ArxivId
    success: bool
    equation_index: int
    tex_path: str
    equation: str
    equation_start: int
    equation_depth: int
    context_tex: str
    symbols: Optional[List[Node]]
    error_message: str


@dataclass(frozen=True)
class ParseResult:
    arxiv_id: ArxivId
    success: bool
    equation_index: int
    tex_path: str
    equation: str
    errorMessage: str


@dataclass(frozen=True)
class SavedSymbol:
    tex: str
    start: int
    end: int


class ExtractSymbols(ArxivBatchCommand[ArxivId, List[EquationSymbols]]):
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
            file_utils.clean_directory(
                directories.arxiv_subdir("detected-symbols", arxiv_id)
            )
            yield arxiv_id

    def process(self, item: ArxivId) -> Iterator[List[EquationSymbols]]:
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
            yield _get_symbol_data(item, result.stdout)
        else:
            logging.error(
                "Equation parsing for %s unexpectedly failed.\nStdout: %s\nStderr: %s\n",
                item,
                result.stdout,
                result.stderr,
            )

    def save(self, item: ArxivId, result: List[EquationSymbols]) -> None:
        tokens_dir = directories.arxiv_subdir("detected-equation-tokens", item)
        if not os.path.exists(tokens_dir):
            os.makedirs(tokens_dir)
        symbols_dir = directories.arxiv_subdir("detected-symbols", item)
        if not os.path.exists(symbols_dir):
            os.makedirs(symbols_dir)

        # Before saving any symbol, check that it hasn't already been saved. This check is needed
        # because sometimes the same symbol is extracted twice or more. This happens when a symbol is
        # in an equation nested within another equation (e.g., the symbol 'x' in
        # '\begin{equation}\begin{split}x\end{split}\end{equation}').
        saved_symbols: Set[SavedSymbol] = set()

        equations_from_inside_out = sorted(
            result, key=lambda e: e.equation_depth, reverse=True
        )
        for equation_symbols in equations_from_inside_out:

            success = equation_symbols.success
            tex_path = equation_symbols.tex_path
            equation_index = equation_symbols.equation_index
            equation = equation_symbols.equation
            equation_start = equation_symbols.equation_start
            equation_depth = equation_symbols.equation_depth
            context_tex = equation_symbols.context_tex
            symbols = equation_symbols.symbols
            error_message = equation_symbols.error_message

            if success and symbols is not None:
                logging.debug(
                    "Successfully extracted %d symbols for equation %s.",
                    len(symbols),
                    equation,
                )
            else:
                logging.warning(
                    "Could not parse equation %s. See logs in %s.",
                    equation,
                    tokens_dir,
                )

            parse_results_path = os.path.join(tokens_dir, "parse_results.csv")
            file_utils.append_to_csv(
                parse_results_path,
                ParseResult(
                    arxiv_id=item,
                    success=success,
                    equation_index=equation_index,
                    tex_path=tex_path,
                    equation=equation,
                    errorMessage=error_message,
                ),
            )

            # Save symbol data, including parent-child relationships between symbols, and which tokens
            # were found in each symbol.
            if symbols is None or len(symbols) == 0:
                continue

            tokens_path = os.path.join(tokens_dir, "entities.csv")
            symbols_path = os.path.join(symbols_dir, "entities.csv")
            symbol_tokens_path = os.path.join(symbols_dir, "symbol_tokens.csv")
            symbol_children_path = os.path.join(symbols_dir, "symbol_children.csv")

            # The list of symbol children might be empty, e.g., for a paper with only
            # very simple symbols. Make sure there's at least an empty file, as later stages expect
            # to be able to read the list of symbol children at this path.
            open(symbol_children_path, "a").close()

            all_tokens = set()
            for symbol in symbols:
                symbol_index = symbols.index(symbol)

                if len(symbol.tokens) == 0:
                    continue

                # Collect extra information about the symbol.
                def get_tex(s: Node, equation: str) -> Tuple[str, int, int]:
                    """
                    Extract approximate TeX for the symbol. It's estimated to be the span of TeX
                    that covers all of the tokens, including extra curly braces needed to close
                    opened curly braces (which often aren't included in the token start and end
                    character indexes). While these positions aren't used for colorization (and
                    hence don't have to be super precise), they are useful for:
                    1. Ordering the symbols
                    2. Rendering the symbols in the user interface
                    Hence it is a good thing if a complete subset of the TeX can be extracted that
                    can be used to render the symbol.
                    """
                    start = min([t.start for t in s.tokens])
                    end = max([t.end for t in s.tokens])

                    # Grab the macro right before the symbol if there is one. This ensures that the
                    # rendered 'tex' field will include, for instance, `\mathrm` commands that are
                    # used to style the math.
                    for match in re.finditer(r"\\((math|text)\w+)\{", equation):
                        if match.end() == start:
                            start = match.start()

                    # Adjust the end position to after curly braces are closed.
                    open_brace_count = 0
                    for i, c in enumerate(equation[start:], start=start):
                        open_brace_count = (
                            open_brace_count + 1
                            if c == "{"
                            else open_brace_count - 1
                            if c == "}" and open_brace_count > 0
                            else open_brace_count
                        )
                        if (i + 1) >= end and open_brace_count == 0:
                            end = i + 1
                            break

                    return (equation[start:end], start, end)

                symbol_tex, relative_start, relative_end = get_tex(symbol, equation)
                start = equation_start + relative_start
                end = equation_start + relative_end

                # Skip this symbol if it has already been saved.
                if SavedSymbol(symbol_tex, start, end) in saved_symbols:
                    continue

                # Save a record of this symbol.
                file_utils.append_to_csv(
                    symbols_path,
                    SerializableSymbol(
                        id_=f"{equation_index}-{symbol_index}",
                        tex_path=tex_path,
                        equation_index=equation_index,
                        equation=equation,
                        symbol_index=symbol_index,
                        start=start,
                        end=end,
                        tex=symbol_tex,
                        context_tex=context_tex,
                        mathml=str(symbol.element),
                        is_definition=symbol.defined or False,
                        relative_start=relative_start,
                        relative_end=relative_end,
                    ),
                )

                # Save the relationships between this symbol and its tokens.
                all_tokens.update(symbol.tokens)
                for token in symbol.tokens:
                    file_utils.append_to_csv(
                        symbol_tokens_path,
                        SerializableSymbolToken(
                            tex_path=tex_path,
                            equation_index=equation_index,
                            symbol_index=symbol_index,
                            token_index=token.token_index,
                        ),
                    )

                # Save the relationships between this symbol and its children.
                for child in symbol.child_symbols:
                    child_index = symbols.index(child)
                    file_utils.append_to_csv(
                        symbol_children_path,
                        SerializableChild(
                            tex_path=tex_path,
                            equation_index=equation_index,
                            equation=equation,
                            symbol_index=symbol_index,
                            child_index=child_index,
                        ),
                    )

                saved_symbols.add(SavedSymbol(symbol_tex, start, end))

            # Write record of all tokens to file.
            for token in all_tokens:
                file_utils.append_to_csv(
                    tokens_path,
                    SerializableToken(
                        tex_path=tex_path,
                        id_=f"{equation_index}-{token.token_index}",
                        equation_index=equation_index,
                        token_index=token.token_index,
                        start=equation_start + token.start,
                        end=equation_start + token.end,
                        relative_start=token.start,
                        relative_end=token.end,
                        tex=equation[token.start : token.end],
                        context_tex=context_tex,
                        text=token.text,
                        equation=equation,
                        equation_depth=equation_depth,
                    ),
                )


def _get_symbol_data(arxiv_id: ArxivId, stdout: str) -> List[EquationSymbols]:
    symbol_data = []

    for result in stdout.strip().splitlines():
        data = json.loads(result)
        symbols = None

        if data["success"] is True:
            mathml = data["mathMl"]
            symbols = parse_equation(mathml)

        symbol_data.append(
            EquationSymbols(
                arxiv_id=arxiv_id,
                success=data["success"],
                equation_index=int(data["i"]),
                tex_path=data["tex_path"],
                equation=data["equation"],
                equation_start=int(data["equation_start"]),
                equation_depth=int(data["equation_depth"]),
                context_tex=data["context_tex"],
                error_message=data["errorMessage"],
                symbols=symbols,
            )
        )

    return symbol_data
