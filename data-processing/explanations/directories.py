import os
from typing import Iterator, List

from explanations.types import AbsolutePath, RelativePath

DATA_DIR = "data"

# Main directories for processing papers
ARXIV_IDS_DIR = os.path.join(DATA_DIR, "00-arxiv-ids")
SOURCE_ARCHIVES_DIR = os.path.join(DATA_DIR, "01-sources-archives")
S2_METADATA_DIR = os.path.join(DATA_DIR, "02-s2-metadata")
SOURCES_DIR = os.path.join(DATA_DIR, "03-sources")
BIBITEMS_DIR = os.path.join(DATA_DIR, "04-bibitems")
BIBITEM_RESOLUTIONS_DIR = os.path.join(DATA_DIR, "05-bibitem-resolutions")
EQUATIONS_DIR = os.path.join(DATA_DIR, "06-equations")
SYMBOLS_DIR = os.path.join(DATA_DIR, "07-symbols")
SYMBOL_MATCHES_DIR = os.path.join(DATA_DIR, "08-symbol-matches")
SOURCES_WITH_COLORIZED_CITATIONS_DIR = os.path.join(
    DATA_DIR, "09-sources-with-colorized-citations"
)
VISUAL_VALIDATE_SOURCES_WITH_COLORIZED_CITATIONS_DIR = os.path.join(
    DATA_DIR, "09x-visual-validate-sources-with-colorized-citations"
)
SOURCES_WITH_COLORIZED_EQUATIONS_DIR = os.path.join(
    DATA_DIR, "10-sources-with-colorized-equations"
)
SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR = os.path.join(
    DATA_DIR, "11-sources-with-colorized-equation-tokens"
)
COMPILED_SOURCES_DIR = os.path.join(DATA_DIR, "12-compiled-sources")
COMPILED_SOURCES_WITH_COLORIZED_CITATIONS_DIR = os.path.join(
    DATA_DIR, "13-compiled-sources-with-colorized-citations"
)
VISUAL_VALIDATE_COMPILED_SOURCES_WITH_COLORIZED_CITATIONS_DIR = os.path.join(
    DATA_DIR, "13x-visual-validate-compiled-sources-with-colorized-citations"
)
COMPILED_SOURCES_WITH_COLORIZED_EQUATIONS_DIR = os.path.join(
    DATA_DIR, "14-compiled-sources-with-colorized-equations"
)
COMPILED_SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR = os.path.join(
    DATA_DIR, "15-compiled-sources-with-colorized-equation-tokens"
)
PAPER_IMAGES_DIR = os.path.join(DATA_DIR, "16-paper-images")
PAPER_WITH_COLORIZED_CITATIONS_IMAGES_DIR = os.path.join(
    DATA_DIR, "17-paper-with-colorized-citations-images"
)
VISUAL_VALIDATE_PAPER_WITH_COLORIZED_CITATIONS_IMAGES_DIR = os.path.join(
    DATA_DIR, "17x-visual-validate-paper-with-colorized-citations-images/"
)
PAPER_WITH_COLORIZED_EQUATIONS_IMAGES_DIR = os.path.join(
    DATA_DIR, "18-paper-with-colorized-equations-images"
)
PAPER_WITH_COLORIZED_EQUATION_TOKENS_IMAGES_DIR = os.path.join(
    DATA_DIR, "19-paper-with-colorized-equation-tokens-images"
)
DIFF_IMAGES_WITH_COLORIZED_CITATIONS_DIR = os.path.join(
    DATA_DIR, "20-diff-images-with-colorized-citations"
)
VISUAL_VALIDATE_DIFF_IMAGES_WITH_COLORIZED_CITATIONS_DIR = os.path.join(
    DATA_DIR, "20x-visual-validate-diff-images-with-colorized-citations"
)
DIFF_IMAGES_WITH_COLORIZED_EQUATIONS_DIR = os.path.join(
    DATA_DIR, "21-diff-images-with-colorized-equations"
)
DIFF_IMAGES_WITH_COLORIZED_EQUATION_TOKENS_DIR = os.path.join(
    DATA_DIR, "22-diff-images-with-colorized-equation-tokens"
)
HUE_LOCATIONS_FOR_CITATIONS_DIR = os.path.join(
    DATA_DIR, "23-hue-locations-for-citations"
)
VISUAL_VALIDATE_HUE_LOCATIONS_FOR_CITATIONS_DIR = os.path.join(
    DATA_DIR, "23x-visual-validate-hue-locations-for-citations/"
)
HUE_LOCATIONS_FOR_EQUATIONS_DIR = os.path.join(
    DATA_DIR, "24-hue-locations-for-equations"
)
HUE_LOCATIONS_FOR_EQUATION_TOKENS_DIR = os.path.join(
    DATA_DIR, "25-hue-locations-for-equation-tokens"
)
SYMBOL_LOCATIONS_DIR = os.path.join(DATA_DIR, "26-symbol-locations")
ANNOTATED_PDFS_WITH_CITATION_BOXES_DIR = os.path.join(
    DATA_DIR, "27-annotated-pdfs-with-citation-boxes"
)
ANNOTATED_PDFS_WITH_EQUATION_BOXES_DIR = os.path.join(
    DATA_DIR, "28-annotated-pdfs-with-equation-boxes"
)
ANNOTATED_PDFS_WITH_EQUATION_TOKEN_BOXES_DIR = os.path.join(
    DATA_DIR, "29-annotated-pdfs-with-equation-token-boxes"
)
SOURCES_WITH_ANNOTATED_SYMBOLS_DIR = os.path.join(
    DATA_DIR, "30-sources-with-annotated-symbols"
)
DEBUGGING_COLORIZING_CITATIONS_DIR = os.path.join(
    DATA_DIR, "31-debugging-colorizing-citations"
)
DEBUGGING_COLORIZING_EQUATIONS_DIR = os.path.join(
    DATA_DIR, "32-debugging-colorizing-equations"
)
DEBUGGING_COLORIZING_EQUATION_TOKENS_DIR = os.path.join(
    DATA_DIR, "33-debugging-colorizing-equation-tokens"
)

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


def get_data_subdirectory_for_iteration(
    data_dir: str, arxiv_id: str, iteration_name: str
) -> str:
    return os.path.join(
        get_data_subdirectory_for_arxiv_id(data_dir, arxiv_id), iteration_name
    )


def get_iteration_names(data_dir: AbsolutePath, arxiv_id: str) -> List[str]:
    arxiv_subdirectory = get_data_subdirectory_for_arxiv_id(data_dir, arxiv_id)
    if not os.path.exists(arxiv_subdirectory):
        return []
    return os.listdir(arxiv_subdirectory)


def get_arxiv_id_iteration_path(arxiv_id: str, iteration: str) -> RelativePath:
    return os.path.join(escape_slashes(arxiv_id), iteration)


def get_iteration_id(tex_path: str, iteration: int) -> RelativePath:
    escaped_tex_path = escape_slashes(tex_path)
    return f"{escaped_tex_path}-iteration-{iteration}"


def arxiv_ids(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(ARXIV_IDS_DIR, arxiv_id)


def source_archives(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(SOURCE_ARCHIVES_DIR, arxiv_id)


def s2_metadata(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(S2_METADATA_DIR, arxiv_id)


def sources(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(SOURCES_DIR, arxiv_id)


def equations(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(EQUATIONS_DIR, arxiv_id)


def symbols(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(SYMBOLS_DIR, arxiv_id)


def symbol_matches(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(SYMBOL_MATCHES_DIR, arxiv_id)


def bibitems(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(BIBITEMS_DIR, arxiv_id)


def bibitem_resolutions(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(BIBITEM_RESOLUTIONS_DIR, arxiv_id)


def sources_with_colorized_citations(
    arxiv_id: str, tex_path: str, iteration: int
) -> RelativePath:
    iteration_id = get_iteration_id(tex_path, iteration)
    return os.path.join(sources_with_colorized_citations_root(arxiv_id), iteration_id)


def sources_with_colorized_citations_root(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(
        SOURCES_WITH_COLORIZED_CITATIONS_DIR, arxiv_id
    )


def sources_with_colorized_equations(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(
        SOURCES_WITH_COLORIZED_EQUATIONS_DIR, arxiv_id
    )


def sources_with_colorized_equation_tokens(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(
        SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR, arxiv_id
    )


def compilation_results(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(COMPILED_SOURCES_DIR, arxiv_id)


def paper_images(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(PAPER_IMAGES_DIR, arxiv_id)


def hue_locations_for_citations(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(HUE_LOCATIONS_FOR_CITATIONS_DIR, arxiv_id)


def hue_locations_for_equations(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(HUE_LOCATIONS_FOR_EQUATIONS_DIR, arxiv_id)


def hue_locations_for_equation_tokens(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(
        HUE_LOCATIONS_FOR_EQUATION_TOKENS_DIR, arxiv_id
    )


def symbol_locations(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(SYMBOL_LOCATIONS_DIR, arxiv_id)
