import os
from typing import Dict, Iterator, List, Optional

from common.types import RelativePath

# Directories for utilities
LOGS_DIR = "logs"

# Main directories for output from processing papers
DATA_DIR = "data"

# Counter used to assign a unique, ordered, numeric prefix to each data directory
_directory_index = 0

# List of mappings from directory short names to paths
_directory_paths: Dict[str, RelativePath] = {}


def register(dirkey: str, suffix: Optional[str] = None) -> RelativePath:
    """
    Register a directory that will be referred to by a specific key. Registration involves:
    * Creating a new index for the directory
    * Creating the directory if it doesn't yet exist

    The directory's name will be [##-suffix] if 'suffix' is specified, or [##-dirkey] if it is
    not. ## is the order in which this directory was registered, and should roughly correspond
    to lower numbers referring to earlier processing steps, and higher numbers referring
    to later processing steps. Numbers start at 01.

    You can refer to this directory by the name you provide to this function in all
    subsequent calls to 'directories' helper functions.
    """

    suffix = suffix if suffix is not None else dirkey

    global _directory_index  # pylint: disable=global-statement
    _directory_index += 1

    relative_path = os.path.join(DATA_DIR, f"{_directory_index:02d}-{suffix}")
    if not os.path.exists(relative_path):
        os.makedirs(relative_path)

    _directory_paths[dirkey] = relative_path

    return relative_path


# Register directories in an order that roughly corresponds to the order they will be run in.
register("arxiv-ids")
register("arxiv-pdfs")
register("sources-archives")
register("s2-metadata")
register("sources")
register("compiled-sources")
register("normalized-sources")
register("compiled-normalized-sources")
register("paper-images")
register("bounding-box-accuracies")


# Helpers for converting paths with arXiv IDs to valid path names
SLASH_SUBSTITUTE = "__"


def escape_slashes(s: str) -> str:
    """
    Slashes are valid in arXiv IDs, but can't be used in filenames. Before saving a file using an
    arXiv ID, call this helper function to remove slashes from the file names.
    """
    return s.replace("/", SLASH_SUBSTITUTE)


def unescape_slashes(s: str) -> str:
    return s.replace(SLASH_SUBSTITUTE, "/")


# Helpers for getting data subdirectories
def dirpath(dirkey: str) -> RelativePath:
    " Get the path to a directory using the key you registered it with. "
    return _directory_paths[dirkey]


def dirkeys() -> List[str]:
    " Get a list of all registered directory keys. "
    return list(_directory_paths.keys())


def registered(dirkey: str) -> bool:
    return dirkey in _directory_paths


def get_arxiv_ids(dirkey: str) -> Iterator[str]:
    """
    Most data directories will include (and only include) subdirectories, with one for each arXiv
    paper. These subdirectories will have as their name a normalized arXiv ID (see below). Call
    this function to get the arXiv IDs for which there are subdirectories in a data directory.
    """
    relative_path = dirpath(dirkey)
    for filename in os.listdir(relative_path):
        yield unescape_slashes(filename)


def arxiv_subdir(dirkey: str, arxiv_id: str) -> str:
    relative_path = dirpath(dirkey)
    return os.path.join(relative_path, escape_slashes(arxiv_id))


def iteration(dirkey: str, arxiv_id: str, iteration_name: str) -> str:
    return os.path.join(arxiv_subdir(dirkey, arxiv_id), iteration_name)


def iteration_names(dirkey: str, arxiv_id: str) -> List[str]:
    arxiv_subdirectory = arxiv_subdir(dirkey, arxiv_id)
    if not os.path.exists(arxiv_subdirectory):
        return []
    # Only consider subdirectories when finding which iterations are in this directory, as some
    # commands output data files alongside the iteration directories to provide summaries of
    # results that cross iterations.
    return [
        file_
        for file_ in os.listdir(arxiv_subdirectory)
        if os.path.isdir(os.path.join(arxiv_subdirectory, file_))
    ]


def relpath_arxiv_id_iteration(arxiv_id: str, iteration_name: str) -> RelativePath:
    return os.path.join(escape_slashes(arxiv_id), iteration_name)


def tex_iteration(tex_path: RelativePath, iteration_name: str) -> RelativePath:
    escaped_tex_path = escape_slashes(tex_path)
    return f"{escaped_tex_path}-iteration-{iteration_name}"
