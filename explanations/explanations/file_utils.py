import logging
import os
import shutil
from typing import List

from explanations.directories import (
    annotated_pdfs,
    get_annotated_pdf_path,
    get_colorized_pdf_path,
)


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


def get_common_pdfs(original_pdfs: List[str], colorized_pdfs: List[str]) -> List[str]:
    shared_pdfs = [pdf for pdf in original_pdfs if pdf in colorized_pdfs]
    return shared_pdfs


def copy_pdf_for_annotation(arxiv_id: str, pdf_name: str) -> str:
    src_pdf = get_colorized_pdf_path(arxiv_id, pdf_name)
    dest_pdf = get_annotated_pdf_path(arxiv_id, pdf_name)
    annotated_pdfs_dir = annotated_pdfs(arxiv_id)
    if not os.path.exists(annotated_pdfs_dir):
        os.makedirs(annotated_pdfs_dir)
    shutil.copy2(src_pdf, dest_pdf)
    return dest_pdf
