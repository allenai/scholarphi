import csv
import logging
import os
import shutil
from typing import Dict, Iterator, List, Optional

import fitz

from explanations import directories
from explanations.types import Symbol, SymbolId, SymbolWithId


def open_pdf(pdf_path: str) -> fitz.Document:
    return fitz.open(pdf_path)


def read_file_tolerant(path: str) -> Optional[str]:
    """
    Attempt to read the contents of a file using several encodings.
    """
    for encoding in ["utf-8", "latin-1"]:
        with open(path, "r", encoding=encoding) as file_:
            try:
                return file_.read()
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


def load_symbols(arxiv_id: str) -> List[SymbolWithId]:

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
        return []

    symbols_by_id: Dict[SymbolId, Symbol] = {}

    with open(symbols_path) as symbols_file:
        reader = csv.reader(symbols_file)
        for row in reader:
            symbol_id = _get_symbol_id(row)
            mathml = row[4]
            symbols_by_id[symbol_id] = Symbol(characters=[], mathml=mathml, children=[])

    with open(symbol_tokens_path) as symbol_tokens_file:
        reader = csv.reader(symbol_tokens_file)
        for row in reader:
            symbol_id = _get_symbol_id(row)
            character_index = int(row[4])
            symbols_by_id[symbol_id].characters.append(character_index)

    with open(symbol_children_path) as symbol_children_file:
        reader = csv.reader(symbol_children_file)
        for row in reader:
            symbol = symbols_by_id[_get_symbol_id(row)]
            child_symbol_id = SymbolId(row[0], int(row[1]), int(row[4]))
            child_symbol = symbols_by_id[child_symbol_id]
            symbol.children.append(child_symbol)

    return [
        SymbolWithId(symbol_id, symbol) for symbol_id, symbol in symbols_by_id.items()
    ]
