import logging
import os
import shutil
from typing import Iterator, List, Optional

from explanations.directories import annotated_pdfs, get_annotated_pdf_path


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


def find_files(dir_: str, extensions: List[str]) -> Iterator[str]:
    """
    Find all files in a directory with a given extension.
    """
    for (dirpath, _, filenames) in os.walk(dir_):
        for filename in filenames:
            __, ext = os.path.splitext(filename)
            if ext in extensions:
                path = os.path.join(dirpath, filename)
                yield path


def get_common_pdfs(original_pdfs: List[str], colorized_pdfs: List[str]) -> List[str]:
    shared_pdfs = [pdf for pdf in original_pdfs if pdf in colorized_pdfs]
    return shared_pdfs


def copy_pdf_for_annotation(arxiv_id: str, pdf_name: str) -> str:
    # TODO(andrewhead): Unbreak this code by reimplementing get_colorized_pdf_path
    src_pdf = get_annotated_pdf_path(arxiv_id, pdf_name)
    # src_pdf = get_colorized_pdf_path(arxiv_id, pdf_name)
    dest_pdf = get_annotated_pdf_path(arxiv_id, pdf_name)
    annotated_pdfs_dir = annotated_pdfs(arxiv_id)
    if not os.path.exists(annotated_pdfs_dir):
        os.makedirs(annotated_pdfs_dir)
    shutil.copy2(src_pdf, dest_pdf)
    return dest_pdf
