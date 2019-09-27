import logging
import os
from distutils import dir_util
from typing import List

from explanations.directories import (
    COLORIZED_SOURCES_DIR,
    SOURCES_DIR,
    colorized_sources,
    sources,
)


def get_shared_pdfs(original_pdfs, colorized_pdfs) -> List[str]:
    shared_pdfs = [pdf for pdf in original_pdfs if pdf in colorized_pdfs]
    return shared_pdfs
