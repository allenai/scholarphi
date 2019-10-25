import os

from explanations.unpack import _is_path_forbidden

ROOT_PATH = os.path.abspath(os.sep)
DEST_DIR = os.path.join(ROOT_PATH, "path", "to", "dest", "dir")


def test_allow_relative_path_in_dest_dir():
    relative_inside = "filename"
    assert not _is_path_forbidden(relative_inside, DEST_DIR)


def test_forbid_relative_path_outside_dest_dir():
    relative_outside = os.path.join(os.pardir, "filename")
    assert _is_path_forbidden(relative_outside, DEST_DIR)


def test_allow_absolute_path_in_dest_dir():
    absolute_outside = os.path.join(DEST_DIR, "filename")
    assert not _is_path_forbidden(absolute_outside, DEST_DIR)


def test_forbid_absolute_path_outside_dest_dir():
    absolute_inside = os.path.join(ROOT_PATH, "forbidden", "path")
    assert _is_path_forbidden(absolute_inside, DEST_DIR)
