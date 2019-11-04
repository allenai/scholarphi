import logging
import os
import shutil
from typing import Iterator, List, Optional

import fitz


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
