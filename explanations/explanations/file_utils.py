import logging
import os
import shutil
from distutils import dir_util
from typing import List

from explanations.directories import (
    COLORIZED_SOURCES_DIR,
    SOURCES_DIR,
    annotated_pdfs,
    colorized_sources,
    get_annotated_pdf_path,
    get_colorized_pdf_path,
    sources,
)


def get_common_pdfs(original_pdfs, colorized_pdfs) -> List[str]:
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
