import logging
import os
from distutils import dir_util

from explanations.directories import (
    COLORIZED_SOURCES_DIR,
    SOURCES_DIR,
    colorized_sources,
    sources,
)


def copy_sources_dir(arxiv_id):
    src_dir = sources(arxiv_id)
    dest_dir = colorized_sources(arxiv_id)
    if os.path.exists(dest_dir):
        logging.warn("Directory %s already exists, not copying a second time", dest_dir)
    # dir_util.copy_tree is used instead of shutil.copytree because shutil.copytree will not
    # fail if the destination directory already exists. The desired behavior is to overwrite old
    # files if the script is run a second time.
    dir_util.copy_tree(src_dir, dest_dir)
