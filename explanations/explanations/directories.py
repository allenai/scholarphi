import os
from typing import Iterator

DATA_DIR = "data"

# Main directories for processing papers
SOURCE_ARCHIVES_DIR = os.path.join(DATA_DIR, "01-sources-archives")
S2_METADATA_DIR = os.path.join(DATA_DIR, "02-s2-metadata")
SOURCES_DIR = os.path.join(DATA_DIR, "03-sources")
BIBITEMS_DIR = os.path.join(DATA_DIR, "04-bibitems")
EQUATIONS_DIR = os.path.join(DATA_DIR, "05-equations")
COMPILATION_RESULTS_DIR = os.path.join(DATA_DIR, "06-compilation-results")
COLORIZED_SOURCES_DIR = os.path.join(DATA_DIR, "07-colorized-sources")

# Debug directories (may or may not be created based on command options)
DEBUG_DIR = os.path.join(DATA_DIR, "debug")
PAPER_IMAGES_DIR = os.path.join(DEBUG_DIR, "a-paper-images")
COLORIZED_PAPER_IMAGES_DIR = os.path.join(DEBUG_DIR, "b-colorized-paper-images")
DIFF_PAPER_IMAGES_DIR = os.path.join(DEBUG_DIR, "c-diff-paper-images")
ANNOTATED_PDFS_DIR = os.path.join(DEBUG_DIR, "d-annotated-pdfs")


SLASH_SUBSTITUTE = "__"


def get_arxiv_ids(data_directory: str) -> Iterator[str]:
    """
    Most data directories will include (and only include) subdirectories, with one for each arXiv
    paper. These subdirectories will have as their name a normalized arXiv ID (see below). Call
    this function to get the arXiv IDs for which there are subdirectories in a data directory.
    """
    for filename in os.listdir(data_directory):
        yield get_arxiv_id(filename)


def normalize_arxiv_id(arxiv_id: str) -> str:
    """
    Slashes are valid in arXiv IDs, but can't be used in filenames. Before saving a file using an
    arXiv ID, call this helper function to remove slashes from the file names.
    """
    return arxiv_id.replace("/", SLASH_SUBSTITUTE)


def get_arxiv_id(filename: str) -> str:
    return filename.replace(SLASH_SUBSTITUTE, "/")


def source_archives(arxiv_id: str) -> str:
    return os.path.join(SOURCE_ARCHIVES_DIR, normalize_arxiv_id(arxiv_id))


def s2_metadata(arxiv_id: str) -> str:
    return os.path.join(S2_METADATA_DIR, normalize_arxiv_id(arxiv_id))


def sources(arxiv_id: str) -> str:
    return os.path.join(SOURCES_DIR, normalize_arxiv_id(arxiv_id))


def colorized_sources(arxiv_id: str) -> str:
    return os.path.join(COLORIZED_SOURCES_DIR, normalize_arxiv_id(arxiv_id))


def equations(arxiv_id: str) -> str:
    return os.path.join(EQUATIONS_DIR, normalize_arxiv_id(arxiv_id))


def bibitems(arxiv_id: str) -> str:
    return os.path.join(BIBITEMS_DIR, normalize_arxiv_id(arxiv_id))


def compilation_results(arxiv_id: str) -> str:
    return os.path.join(COMPILATION_RESULTS_DIR, normalize_arxiv_id(arxiv_id))


def annotated_pdfs(arxiv_id: str) -> str:
    return os.path.join(ANNOTATED_PDFS_DIR, normalize_arxiv_id(arxiv_id))


def paper_images(arxiv_id: str) -> str:
    return os.path.join(PAPER_IMAGES_DIR, normalize_arxiv_id(arxiv_id))


def colorized_paper_images(arxiv_id: str) -> str:
    return os.path.join(COLORIZED_PAPER_IMAGES_DIR, normalize_arxiv_id(arxiv_id))


def diff_paper_images(arxiv_id: str) -> str:
    return os.path.join(DIFF_PAPER_IMAGES_DIR, normalize_arxiv_id(arxiv_id))


def get_original_pdf_path(arxiv_id: str, pdf_name: str) -> str:
    return os.path.join(SOURCES_DIR, normalize_arxiv_id(arxiv_id), pdf_name)


def get_colorized_pdf_path(arxiv_id: str, pdf_name: str) -> str:
    return os.path.join(COLORIZED_SOURCES_DIR, normalize_arxiv_id(arxiv_id), pdf_name)


def get_annotated_pdf_path(arxiv_id: str, pdf_name: str) -> str:
    return os.path.join(ANNOTATED_PDFS_DIR, normalize_arxiv_id(arxiv_id), pdf_name)
