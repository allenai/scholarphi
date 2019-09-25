import os
import unittest

from explanations.unpack import _is_path_forbidden

ROOT_PATH = os.path.abspath(os.sep)
DEST_DIR = os.path.join(ROOT_PATH, "path", "to", "dest", "dir")


class TestUnpack(unittest.TestCase):
    def test_allow_relative_path_in_dest_dir(self):
        relative_inside = "filename"
        self.assertFalse(_is_path_forbidden(relative_inside, DEST_DIR))

    def test_forbid_relative_path_outside_dest_dir(self):
        relative_outside = os.path.join(os.pardir, "filename")
        self.assertTrue(_is_path_forbidden(relative_outside, DEST_DIR))

    def test_allow_absolute_path_in_dest_dir(self):
        absolute_outside = os.path.join(DEST_DIR, "filename")
        self.assertFalse(_is_path_forbidden(absolute_outside, DEST_DIR))

    def test_forbid_absolute_path_outside_dest_dir(self):
        absolute_inside = os.path.join(ROOT_PATH, "forbidden", "path")
        self.assertTrue(_is_path_forbidden(absolute_inside, DEST_DIR))
