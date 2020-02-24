import os
from typing import Iterator, List

from common.types import AbsolutePath, RelativePath

LOGS_DIR = "logs"

# Main directories for processing papers
DATA_DIR = "data"

data_directory_index = 0


def register_data_directory(directory_name: str) -> RelativePath:
    global data_directory_index  # pylint: disable=global-statement
    data_directory_index += 1
    return os.path.join(DATA_DIR, f"{data_directory_index:02d}-{directory_name}")


ARXIV_IDS_DIR = register_data_directory("arxiv-ids")
SOURCE_ARCHIVES_DIR = register_data_directory("sources-archives")
S2_METADATA_DIR = register_data_directory("s2-metadata")
SOURCES_DIR = register_data_directory("sources")
BIBITEMS_DIR = register_data_directory("bibitems")
BIBITEM_RESOLUTIONS_DIR = register_data_directory("bibitem-resolutions")
EQUATIONS_DIR = register_data_directory("equations")
SYMBOLS_DIR = register_data_directory("symbols")
SYMBOL_MATCHES_DIR = register_data_directory("symbol-matches")
SOURCES_WITH_COLORIZED_CITATIONS_DIR = register_data_directory(
    "sources-with-colorized-citations"
)
SOURCES_WITH_COLORIZED_SENTENCES_DIR = register_data_directory(
    "sources-with-colorized-sentences"
)
SOURCES_WITH_COLORIZED_EQUATIONS_DIR = register_data_directory(
    "sources-with-colorized-equations"
)
SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR = register_data_directory(
    "sources-with-colorized-equation-tokens"
)
COMPILED_SOURCES_DIR = register_data_directory("compiled-sources")
COMPILED_SOURCES_WITH_COLORIZED_CITATIONS_DIR = register_data_directory(
    "compiled-sources-with-colorized-citations"
)
COMPILED_SOURCES_WITH_COLORIZED_SENTENCES_DIR = register_data_directory(
    "compiled-sources-with-colorized-sentences"
)
COMPILED_SOURCES_WITH_COLORIZED_EQUATIONS_DIR = register_data_directory(
    "compiled-sources-with-colorized-equations"
)
COMPILED_SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR = register_data_directory(
    "compiled-sources-with-colorized-equation-tokens"
)
PAPER_IMAGES_DIR = register_data_directory("paper-images")
PAPER_WITH_COLORIZED_CITATIONS_IMAGES_DIR = register_data_directory(
    "paper-with-colorized-citations-images"
)
PAPER_WITH_COLORIZED_SENTENCES_IMAGES_DIR = register_data_directory(
    "paper-with-colorized-sentences-images"
)
PAPER_WITH_COLORIZED_EQUATIONS_IMAGES_DIR = register_data_directory(
    "paper-with-colorized-equations-images"
)
PAPER_WITH_COLORIZED_EQUATION_TOKENS_IMAGES_DIR = register_data_directory(
    "paper-with-colorized-equation-tokens-images"
)
DIFF_IMAGES_WITH_COLORIZED_CITATIONS_DIR = register_data_directory(
    "diff-images-with-colorized-citations"
)
DIFF_IMAGES_WITH_COLORIZED_EQUATIONS_DIR = register_data_directory(
    "diff-images-with-colorized-equations"
)
DIFF_IMAGES_WITH_COLORIZED_SENTENCES_DIR = register_data_directory(
    "diff-images-with-colorized-sentences"
)
DIFF_IMAGES_WITH_COLORIZED_EQUATION_TOKENS_DIR = register_data_directory(
    "diff-images-with-colorized-equation-tokens"
)
HUE_LOCATIONS_FOR_CITATIONS_DIR = register_data_directory("hue-locations-for-citations")
HUE_LOCATIONS_FOR_SENTENCES_DIR = register_data_directory(
    "diff-images-with-colorized-sentences"
)
HUE_LOCATIONS_FOR_EQUATIONS_DIR = register_data_directory("hue-locations-for-equations")
HUE_LOCATIONS_FOR_EQUATION_TOKENS_DIR = register_data_directory(
    "hue-locations-for-equation-tokens"
)
CITATION_LOCATIONS_DIR = register_data_directory("citation-locations")
SYMBOL_LOCATIONS_DIR = register_data_directory("symbol-locations")
ANNOTATED_PDFS_WITH_CITATION_BOXES_DIR = register_data_directory(
    "annotated-pdfs-with-citation-boxes"
)
ANNOTATED_PDFS_WITH_EQUATION_BOXES_DIR = register_data_directory(
    "annotated-pdfs-with-equation-boxes"
)
ANNOTATED_PDFS_WITH_EQUATION_TOKEN_BOXES_DIR = register_data_directory(
    "annotated-pdfs-with-equation-token-boxes"
)
SOURCES_WITH_ANNOTATED_SYMBOLS_DIR = register_data_directory(
    "sources-with-annotated-symbols"
)
DEBUGGING_COLORIZING_CITATIONS_DIR = register_data_directory(
    "debugging-colorizing-citations"
)
DEBUGGING_COLORIZING_EQUATIONS_DIR = register_data_directory(
    "debugging-colorizing-equations"
)
DEBUGGING_COLORIZING_EQUATION_TOKENS_DIR = register_data_directory(
    "debugging-colorizing-equation-tokens"
)
BOUNDING_BOX_ACCURACIES_DIR = register_data_directory("bounding-box-accuracies")

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


def sources_with_colorized_sentences(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(
        SOURCES_WITH_COLORIZED_SENTENCES_DIR, arxiv_id
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


def hue_locations_for_sentences(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(HUE_LOCATIONS_FOR_SENTENCES_DIR, arxiv_id)


def hue_locations_for_equations(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(HUE_LOCATIONS_FOR_EQUATIONS_DIR, arxiv_id)


def hue_locations_for_equation_tokens(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(
        HUE_LOCATIONS_FOR_EQUATION_TOKENS_DIR, arxiv_id
    )


def citation_locations(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(CITATION_LOCATIONS_DIR, arxiv_id)


def symbol_locations(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(SYMBOL_LOCATIONS_DIR, arxiv_id)


def bounding_box_accuracies(arxiv_id: str) -> RelativePath:
    return get_data_subdirectory_for_arxiv_id(BOUNDING_BOX_ACCURACIES_DIR, arxiv_id)
