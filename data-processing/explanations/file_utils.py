import csv
import logging
import os
import shutil
from typing import Dict, Iterator, List, Optional

from explanations import directories
from explanations.types import (
    ArxivId,
    CompilationResult,
    Equation,
    EquationId,
    FileContents,
    Path,
    Symbol,
    SymbolId,
    SymbolWithId,
    TokenWithOrigin,
)

Contents = str
Encoding = str


def read_file_tolerant(path: str) -> Optional[FileContents]:
    """
    Attempt to read the contents of a file using several encodings.
    """
    for encoding in ["utf-8", "latin-1"]:
        with open(path, "r", encoding=encoding) as file_:
            try:
                return FileContents(path, file_.read(), encoding)
            except Exception:  # pylint: disable=broad-except
                logging.debug(
                    "Could not decode file %s using encoding %s", path, encoding
                )

    logging.error("Could not find an appropriate encoding for file %s", path)
    return None


def clean_directory(directory: str) -> None:
    """
    Remove all files and subdirectories from a directory; leave the directory.
    """
    if not os.path.exists(directory):
        return
    logging.debug("Cleaning directory %s", directory)
    for filename in os.listdir(directory):
        path = os.path.join(directory, filename)
        try:
            if os.path.isfile(path):
                os.unlink(path)
            elif os.path.isdir(path):
                shutil.rmtree(path)
        except Exception as e:  # pylint: disable=broad-except
            logging.warning(
                "Could not remove path %s from directory %s: %s", path, directory, e
            )


def find_files(
    dir_: str, extensions: List[str], relative: bool = False
) -> Iterator[str]:
    """
    Find all files in a directory with a given extension.
    """
    for (dirpath, _, filenames) in os.walk(dir_):
        for filename in filenames:
            __, ext = os.path.splitext(filename)
            if ext in extensions:
                path = os.path.join(dirpath, filename)
                if relative:
                    path = os.path.relpath(path, os.path.abspath(dir_))
                yield path


def _get_symbol_id(row: List[str]) -> SymbolId:
    """
    Get symbol ID for a row in a symbols data file.
    """
    return SymbolId(
        tex_path=row[0], equation_index=int(row[1]), symbol_index=int(row[3])
    )


def load_equations(arxiv_id: ArxivId) -> Optional[Dict[EquationId, Equation]]:
    equations_path = os.path.join(directories.equations(arxiv_id), "equations.csv")
    if not os.path.exists(equations_path):
        logging.warning("No equation data found for paper %s. Skipping.", arxiv_id)
        return None

    equations: Dict[EquationId, Equation] = {}
    with open(equations_path, encoding="utf-8") as equations_file:
        reader = csv.reader(equations_file)
        for row in reader:
            tex_path = row[0]
            equation_index = int(row[1])
            equation = Equation(
                int(row[8]),
                int(row[9]),
                int(row[1]),
                row[4],
                int(row[5]),
                row[6],
                int(row[7]),
            )
            equation_id = EquationId(tex_path, equation_index)
            equations[equation_id] = equation

    return equations


def load_tokens(arxiv_id: ArxivId) -> Optional[List[TokenWithOrigin]]:
    equations = load_equations(arxiv_id)
    if equations is None:
        return None

    tokens_path = os.path.join(directories.symbols(arxiv_id), "tokens.csv")
    if not os.path.exists(tokens_path):
        logging.warning(
            "No equation token data found for paper %s. Skipping.", arxiv_id
        )
        return None

    # Load token location information
    tokens = []
    with open(tokens_path, encoding="utf-8") as tokens_file:
        reader = csv.reader(tokens_file)
        for row in reader:
            tex_path = row[0]
            equation_index = int(row[1])
            equation_id = EquationId(tex_path, equation_index)
            if equation_id not in equations:
                logging.warning(
                    "Couldn't find equation with ID %s for token", equation_id
                )
                continue
            tokens.append(
                TokenWithOrigin(
                    tex_path=tex_path,
                    equation=equations[equation_id],
                    token_index=int(row[3]),
                    start=int(row[4]),
                    end=int(row[5]),
                    text=row[6],
                )
            )

    return tokens


def load_symbols(arxiv_id: ArxivId) -> Optional[List[SymbolWithId]]:

    data_dir = directories.symbols(arxiv_id)
    symbols_path = os.path.join(data_dir, "symbols.csv")
    symbol_tokens_path = os.path.join(data_dir, "symbol_tokens.csv")
    symbol_children_path = os.path.join(data_dir, "symbol_children.csv")

    file_not_found = False
    if not os.path.exists(symbols_path):
        logging.info("Symbols data missing for paper %s. Skipping.", arxiv_id)
        file_not_found = True
    if not os.path.exists(symbol_tokens_path):
        logging.info("Symbol tokens data missing for paper %s. Skipping.", arxiv_id)
        file_not_found = True
    if not os.path.exists(symbol_children_path):
        logging.info("Symbol children data missing for paper %s. Skipping.", arxiv_id)
        file_not_found = True

    if file_not_found:
        return None

    symbols_by_id: Dict[SymbolId, Symbol] = {}

    with open(symbols_path, encoding="utf-8") as symbols_file:
        reader = csv.reader(symbols_file)
        for row in reader:
            symbol_id = _get_symbol_id(row)
            mathml = row[4]
            symbols_by_id[symbol_id] = Symbol(characters=[], mathml=mathml, children=[])

    with open(symbol_tokens_path, encoding="utf-8") as symbol_tokens_file:
        reader = csv.reader(symbol_tokens_file)
        for row in reader:
            symbol_id = _get_symbol_id(row)
            character_index = int(row[4])
            symbols_by_id[symbol_id].characters.append(character_index)

    with open(symbol_children_path, encoding="utf-8") as symbol_children_file:
        reader = csv.reader(symbol_children_file)
        for row in reader:
            symbol = symbols_by_id[_get_symbol_id(row)]
            child_symbol_id = SymbolId(row[0], int(row[1]), int(row[4]))
            child_symbol = symbols_by_id[child_symbol_id]
            symbol.children.append(child_symbol)

    return [
        SymbolWithId(symbol_id, symbol) for symbol_id, symbol in symbols_by_id.items()
    ]


def save_compilation_results(
    path: Path, result: CompilationResult, verbose: bool = True
) -> None:
    results_dir = os.path.join(path, "compilation_results")
    if not os.path.exists(results_dir):
        os.makedirs(results_dir)

    if verbose:
        if result.success:
            logging.debug(
                "Successfully compiled TeX. Generated PDFs %s",
                str(result.compiled_pdfs),
            )
        else:
            logging.warning(
                "Could not compile TeX in %s. See logs in %s.", path, results_dir
            )

    with open(os.path.join(results_dir, "result"), "w") as success_file:
        success_file.write(str(result.success))

    if result.compiled_pdfs is not None:
        with open(os.path.join(results_dir, "pdf_names.csv"), "w") as pdf_names_file:
            writer = csv.writer(pdf_names_file, quoting=csv.QUOTE_ALL)
            for i, pdf in enumerate(result.compiled_pdfs):
                writer.writerow([i, pdf])

    with open(os.path.join(results_dir, "stdout.log"), "wb") as stdout_file:
        stdout_file.write(result.stdout)

    with open(os.path.join(results_dir, "stderr.log"), "wb") as stderr_file:
        stderr_file.write(result.stderr)
