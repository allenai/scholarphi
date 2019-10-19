import os
from typing import Iterator

DATA_DIR = "data"

# Main directories for processing papers
SOURCE_ARCHIVES_DIR = os.path.join(DATA_DIR, "01-sources-archives")
S2_METADATA_DIR = os.path.join(DATA_DIR, "02-s2-metadata")
SOURCES_DIR = os.path.join(DATA_DIR, "03-sources")
BIBITEMS_DIR = os.path.join(DATA_DIR, "04-bibitems")
BIBITEM_RESOLUTIONS_DIR = os.path.join(DATA_DIR, "05-bibitem-resolutions")
EQUATIONS_DIR = os.path.join(DATA_DIR, "06-equations")
EQUATION_TOKENS_DIR = os.path.join(DATA_DIR, "07-equation-tokens")
SOURCES_WITH_COLORIZED_CITATIONS = os.path.join(
    DATA_DIR, "08-sources-with-colorized-citations"
)
SOURCES_WITH_COLORIZED_EQUATIONS = os.path.join(
    DATA_DIR, "09-sources-with-colorized-equations"
)
SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR = os.path.join(
    DATA_DIR, "10-sources-with-colorized-equation-tokens"
)
COMPILATION_RESULTS_DIR = os.path.join(DATA_DIR, "11-compilation-results")
COLORIZED_SOURCES_DIR = os.path.join(DATA_DIR, "12-colorized-sources")

# Debug directories (may or may not be created based on command options)
DEBUG_DIR = os.path.join(DATA_DIR, "debug")
PAPER_IMAGES_DIR = os.path.join(DEBUG_DIR, "a-paper-images")
COLORIZED_PAPER_IMAGES_DIR = os.path.join(DEBUG_DIR, "b-colorized-paper-images")
DIFF_PAPER_IMAGES_DIR = os.path.join(DEBUG_DIR, "c-diff-paper-images")
ANNOTATED_PDFS_DIR = os.path.join(DEBUG_DIR, "d-annotated-pdfs")

# Directories for utilities
NODE_DIRECTORY = "node"


SLASH_SUBSTITUTE = "__"


def get_arxiv_ids(data_directory: str) -> Iterator[str]:
    """
    Most data directories will include (and only include) subdirectories, with one for each arXiv
    paper. These subdirectories will have as their name a normalized arXiv ID (see below). Call
    this function to get the arXiv IDs for which there are subdirectories in a data directory.
    """
    for filename in os.listdir(data_directory):
        yield unescape_slashes(filename)


def escape_slashes(s: str) -> str:
    """
    Slashes are valid in arXiv IDs, but can't be used in filenames. Before saving a file using an
    arXiv ID, call this helper function to remove slashes from the file names.
    """
    return s.replace("/", SLASH_SUBSTITUTE)


def unescape_slashes(s: str) -> str:
    return s.replace(SLASH_SUBSTITUTE, "/")


def source_archives(arxiv_id: str) -> str:
    return os.path.join(SOURCE_ARCHIVES_DIR, escape_slashes(arxiv_id))


def s2_metadata(arxiv_id: str) -> str:
    return os.path.join(S2_METADATA_DIR, escape_slashes(arxiv_id))


def sources(arxiv_id: str) -> str:
    return os.path.join(SOURCES_DIR, escape_slashes(arxiv_id))


def colorized_sources(arxiv_id: str) -> str:
    return os.path.join(COLORIZED_SOURCES_DIR, escape_slashes(arxiv_id))


def equations(arxiv_id: str) -> str:
    return os.path.join(EQUATIONS_DIR, escape_slashes(arxiv_id))


def equation_tokens(arxiv_id: str) -> str:
    return os.path.join(EQUATION_TOKENS_DIR, escape_slashes(arxiv_id))


def bibitems(arxiv_id: str) -> str:
    return os.path.join(BIBITEMS_DIR, escape_slashes(arxiv_id))


def bibitem_resolutions(arxiv_id: str) -> str:
    return os.path.join(BIBITEM_RESOLUTIONS_DIR, escape_slashes(arxiv_id))


def sources_with_colorized_equation_tokens(arxiv_id: str) -> str:
    return os.path.join(
        SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR, escape_slashes(arxiv_id)
    )


def compilation_results(arxiv_id: str) -> str:
    return os.path.join(COMPILATION_RESULTS_DIR, escape_slashes(arxiv_id))


def annotated_pdfs(arxiv_id: str) -> str:
    return os.path.join(ANNOTATED_PDFS_DIR, escape_slashes(arxiv_id))


def paper_images(arxiv_id: str) -> str:
    return os.path.join(PAPER_IMAGES_DIR, escape_slashes(arxiv_id))


def colorized_paper_images(arxiv_id: str) -> str:
    return os.path.join(COLORIZED_PAPER_IMAGES_DIR, escape_slashes(arxiv_id))


def diff_paper_images(arxiv_id: str) -> str:
    return os.path.join(DIFF_PAPER_IMAGES_DIR, escape_slashes(arxiv_id))


def get_original_pdf_path(arxiv_id: str, pdf_name: str) -> str:
    return os.path.join(SOURCES_DIR, escape_slashes(arxiv_id), pdf_name)


def get_colorized_pdf_path(arxiv_id: str, pdf_name: str) -> str:
    return os.path.join(COLORIZED_SOURCES_DIR, escape_slashes(arxiv_id), pdf_name)


def get_annotated_pdf_path(arxiv_id: str, pdf_name: str) -> str:
    return os.path.join(ANNOTATED_PDFS_DIR, escape_slashes(arxiv_id), pdf_name)
