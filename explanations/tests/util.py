import os.path


def get_test_path(relative_path: str) -> str:
    """
    Given a path relative to the "tests" directory, return an absolute path to that file.
    """
    path_to_this_file = os.path.abspath(__file__)
    this_file_dir = os.path.dirname(path_to_this_file)
    return os.path.join(this_file_dir, relative_path)
