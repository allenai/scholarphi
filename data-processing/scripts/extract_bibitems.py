import csv
import logging
import os.path
from typing import Iterator, NamedTuple

import explanations.directories as directories
from explanations.file_utils import clean_directory, find_files, read_file_tolerant
from explanations.parse_tex import BibitemExtractor
from explanations.types import ArxivId, Bibitem, FileContents, Path
from scripts.command import ArxivBatchCommand


class ExtractionTask(NamedTuple):
    arxiv_id: ArxivId
    file_contents: FileContents


class ExtractBibitems(ArxivBatchCommand[ExtractionTask, Bibitem]):
    @staticmethod
    def get_name() -> str:
        return "extract-bibitems"

    @staticmethod
    def get_description() -> str:
        return "Extract bibitems from TeX sources"

    def get_arxiv_ids_dir(self) -> Path:
        return directories.SOURCES_DIR

    def load(self) -> Iterator[ExtractionTask]:
        for arxiv_id in self.arxiv_ids:
            sources_dir = directories.get_data_subdirectory_for_arxiv_id(directories.SOURCES_DIR, arxiv_id)
            clean_directory(directories.get_data_subdirectory_for_arxiv_id(directories.BIBITEMS_DIR, arxiv_id))
            for path in find_files(sources_dir, [".tex", ".bbl"]):
                file_contents = read_file_tolerant(path)
                if file_contents is None:
                    continue
                yield ExtractionTask(arxiv_id, file_contents)

    def process(self, item: ExtractionTask) -> Iterator[Bibitem]:
        extractor = BibitemExtractor()
        for bibitem in extractor.parse(item.file_contents.contents):
            yield bibitem

    def save(self, item: ExtractionTask, result: Bibitem) -> None:
        logging.debug(
            "Extracted bibitem %s from file %s", result, item.file_contents.path
        )
        results_dir = directories.get_data_subdirectory_for_arxiv_id(directories.BIBITEMS_DIR, item.arxiv_id)
        if not os.path.exists(results_dir):
            os.makedirs(results_dir)
        results_path = os.path.join(results_dir, "bibitems.csv")
        with open(results_path, "a", encoding="utf-8") as results_file:
            writer = csv.writer(results_file, quoting=csv.QUOTE_ALL)
            try:
                writer.writerow([result.key, result.text])
            except Exception:  # pylint: disable=broad-except
                logging.warning(
                    "Couldn't write row for bibitem for arXiv %s: can't be converted to utf-8",
                    item.arxiv_id,
                )
