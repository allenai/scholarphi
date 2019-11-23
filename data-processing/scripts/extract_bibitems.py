import csv
import logging
import os.path
from typing import Iterator

import explanations.directories as directories
from explanations.directories import sources
from explanations.file_utils import clean_directory, find_files, read_file_tolerant
from explanations.parse_tex import BibitemExtractor
from explanations.types import Bibitem, FileContents, Path
from scripts.command import ArxivBatchCommand


class ExtractBibitems(ArxivBatchCommand[FileContents, Bibitem]):
    @staticmethod
    def get_name() -> str:
        return "extract-bibitems"

    @staticmethod
    def get_description() -> str:
        return "Extract bibitems from TeX sources"

    def get_arxiv_ids_dir(self) -> Path:
        return directories.SOURCES_DIR

    def load(self) -> Iterator[FileContents]:
        for arxiv_id in self.arxiv_ids:
            sources_dir = sources(arxiv_id)
            clean_directory(directories.bibitems(arxiv_id))
            for path in find_files(sources_dir, [".tex", ".bbl"]):
                contents = read_file_tolerant(path)
                if contents is None:
                    continue
                yield FileContents(arxiv_id, path, contents)

    def process(self, item: FileContents) -> Iterator[Bibitem]:
        extractor = BibitemExtractor()
        for bibitem in extractor.parse(item.contents):
            yield bibitem

    def save(self, item: FileContents, result: Bibitem) -> None:
        logging.debug("Extracted bibitem %s from file %s", result, item.path)
        results_dir = directories.bibitems(item.arxiv_id)
        if not os.path.exists(results_dir):
            os.makedirs(results_dir)
        results_path = os.path.join(results_dir, "bibitems.csv")
        with open(results_path, "a") as results_file:
            writer = csv.writer(results_file, quoting=csv.QUOTE_ALL)
            writer.writerow([result.key, result.text])
