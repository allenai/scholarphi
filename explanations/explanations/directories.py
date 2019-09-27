import os

DATA_DIR = "data"

SOURCE_ARCHIVES_DIR = os.path.join(DATA_DIR, "01-sources-archives")
SOURCES_DIR = os.path.join(DATA_DIR, "02-sources")
COLORIZED_SOURCES_DIR = os.path.join(DATA_DIR, "03-colorized-sources")


def source_archives(arxiv_id):
    return os.path.join(SOURCE_ARCHIVES_DIR, arxiv_id)


def sources(arxiv_id):
    return os.path.join(SOURCES_DIR, arxiv_id)


def colorized_sources(arxiv_id):
    return os.path.join(COLORIZED_SOURCES_DIR, arxiv_id)
