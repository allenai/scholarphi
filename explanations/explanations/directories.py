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
SOURCES_WITH_COLORIZED_CITATIONS_DIR = os.path.join(
    DATA_DIR, "08-sources-with-colorized-citations"
)
SOURCES_WITH_COLORIZED_EQUATIONS_DIR = os.path.join(
    DATA_DIR, "09-sources-with-colorized-equations"
)
SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR = os.path.join(
    DATA_DIR, "10-sources-with-colorized-equation-tokens"
)
COMPILED_SOURCES_DIR = os.path.join(DATA_DIR, "11-compiled-sources")
COMPILED_SOURCES_WITH_COLORIZED_CITATIONS_DIR = os.path.join(
    DATA_DIR, "12-compiled-sources-with-colorized-citations"
)
COMPILED_SOURCES_WITH_COLORIZED_EQUATIONS_DIR = os.path.join(
    DATA_DIR, "13-compiled-sources-with-colorized-equations"
)
COMPILED_SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR = os.path.join(
    DATA_DIR, "14-compiled-sources-with-colorized-equation-tokens"
)
PAPER_IMAGES_DIR = os.path.join(DATA_DIR, "15-paper-images")
PAPER_WITH_COLORIZED_CITATIONS_IMAGES_DIR = os.path.join(
    DATA_DIR, "16-paper-with-colorized-citations-images"
)
PAPER_WITH_COLORIZED_EQUATIONS_IMAGES_DIR = os.path.join(
    DATA_DIR, "17-paper-with-colorized-equations-images"
)
PAPER_WITH_COLORIZED_EQUATION_TOKENS_IMAGES_DIR = os.path.join(
    DATA_DIR, "18-paper-with-colorized-equation-tokens-images"
)
DIFF_IMAGES_WITH_COLORIZED_CITATIONS_DIR = os.path.join(
    DATA_DIR, "19-diff-images-with-colorized-citations"
)

# Debug directories (may or may not be created based on command options)
DEBUG_DIR = os.path.join(DATA_DIR, "debug")
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


def get_data_subdirectory_for_arxiv_id(data_dir: str, arxiv_id: str) -> str:
    return os.path.join(data_dir, escape_slashes(arxiv_id))


def source_archives(arxiv_id: str) -> str:
    return get_data_subdirectory_for_arxiv_id(SOURCE_ARCHIVES_DIR, arxiv_id)


def s2_metadata(arxiv_id: str) -> str:
    return get_data_subdirectory_for_arxiv_id(S2_METADATA_DIR, arxiv_id)


def sources(arxiv_id: str) -> str:
    return get_data_subdirectory_for_arxiv_id(SOURCES_DIR, arxiv_id)


def equations(arxiv_id: str) -> str:
    return get_data_subdirectory_for_arxiv_id(EQUATIONS_DIR, arxiv_id)


def equation_tokens(arxiv_id: str) -> str:
    return get_data_subdirectory_for_arxiv_id(EQUATION_TOKENS_DIR, arxiv_id)


def bibitems(arxiv_id: str) -> str:
    return get_data_subdirectory_for_arxiv_id(BIBITEMS_DIR, arxiv_id)


def bibitem_resolutions(arxiv_id: str) -> str:
    return get_data_subdirectory_for_arxiv_id(BIBITEM_RESOLUTIONS_DIR, arxiv_id)


def sources_with_colorized_citations(arxiv_id: str) -> str:
    return get_data_subdirectory_for_arxiv_id(
        SOURCES_WITH_COLORIZED_CITATIONS_DIR, arxiv_id
    )


def sources_with_colorized_equations(arxiv_id: str) -> str:
    return get_data_subdirectory_for_arxiv_id(
        SOURCES_WITH_COLORIZED_EQUATIONS_DIR, arxiv_id
    )


def sources_with_colorized_equation_tokens(arxiv_id: str) -> str:
    return get_data_subdirectory_for_arxiv_id(
        SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR, arxiv_id
    )


def compilation_results(arxiv_id: str) -> str:
    return get_data_subdirectory_for_arxiv_id(COMPILED_SOURCES_DIR, arxiv_id)


def annotated_pdfs(arxiv_id: str) -> str:
    return get_data_subdirectory_for_arxiv_id(ANNOTATED_PDFS_DIR, arxiv_id)


def paper_images(arxiv_id: str) -> str:
    return get_data_subdirectory_for_arxiv_id(PAPER_IMAGES_DIR, arxiv_id)


def colorized_paper_images(arxiv_id: str) -> str:
    return get_data_subdirectory_for_arxiv_id(COLORIZED_PAPER_IMAGES_DIR, arxiv_id)


def diff_paper_images(arxiv_id: str) -> str:
    return get_data_subdirectory_for_arxiv_id(DIFF_PAPER_IMAGES_DIR, arxiv_id)


def get_original_pdf_path(arxiv_id: str, pdf_name: str) -> str:
    """
    TODO(andrewhead): Remove this function: should no longer be called.
    """
    return os.path.join(SOURCES_DIR, escape_slashes(arxiv_id), pdf_name)


def get_annotated_pdf_path(arxiv_id: str, pdf_name: str) -> str:
    """
    TODO(andrewhead): Remove this function: should no longer be called.
    """
    return os.path.join(ANNOTATED_PDFS_DIR, escape_slashes(arxiv_id), pdf_name)
