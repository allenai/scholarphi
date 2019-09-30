import os

DATA_DIR = "data"

# Main directories for processing papers
SOURCE_ARCHIVES_DIR = os.path.join(DATA_DIR, "01-sources-archives")
SOURCES_DIR = os.path.join(DATA_DIR, "02-sources")
COLORIZED_SOURCES_DIR = os.path.join(DATA_DIR, "03-colorized-sources")
ANNOTATED_PDFS_DIR = os.path.join(DATA_DIR, "04-annotated-pdfs")

# Debug directories (may or may not be created based on command options)
DEBUG_DIR = os.path.join(DATA_DIR, "debug")
PAPER_IMAGES_DIR = os.path.join(DEBUG_DIR, "a-paper-images")
COLORIZED_PAPER_IMAGES_DIR = os.path.join(DEBUG_DIR, "b-colorized-paper-images")
DIFF_PAPER_IMAGES_DIR = os.path.join(DEBUG_DIR, "c-diff-paper-images")


def source_archives(arxiv_id):
    return os.path.join(SOURCE_ARCHIVES_DIR, arxiv_id)


def sources(arxiv_id):
    return os.path.join(SOURCES_DIR, arxiv_id)


def colorized_sources(arxiv_id):
    return os.path.join(COLORIZED_SOURCES_DIR, arxiv_id)


def annotated_pdfs(arxiv_id):
    return os.path.join(ANNOTATED_PDFS_DIR, arxiv_id)


def paper_images(arxiv_id):
    return os.path.join(PAPER_IMAGES_DIR, arxiv_id)


def colorized_paper_images(arxiv_id):
    return os.path.join(COLORIZED_PAPER_IMAGES_DIR, arxiv_id)


def diff_paper_images(arxiv_id):
    return os.path.join(DIFF_PAPER_IMAGES_DIR, arxiv_id)


def get_original_pdf_path(arxiv_id, pdf_name):
    return os.path.join(SOURCES_DIR, arxiv_id, pdf_name)


def get_colorized_pdf_path(arxiv_id, pdf_name):
    return os.path.join(COLORIZED_SOURCES_DIR, arxiv_id, pdf_name)


def get_annotated_pdf_path(arxiv_id: str, pdf_name: str) -> str:
    return os.path.join(ANNOTATED_PDFS_DIR, arxiv_id, pdf_name)
