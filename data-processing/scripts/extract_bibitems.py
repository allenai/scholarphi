import csv
import logging
import os.path
from typing import Iterator

import explanations.directories as directories
from explanations.directories import SOURCES_DIR, get_arxiv_ids, sources
from explanations.file_utils import clean_directory, find_files, read_file_tolerant
from explanations.scrape_tex import TexSoupParseError, extract_bibitems
from explanations.types import Bibitem, FileContents
from scripts.command import Command


class ExtractBibitems(Command[FileContents, Bibitem]):
    @staticmethod
    def get_name() -> str:
        return "extract-bibitems"

    @staticmethod
    def get_description() -> str:
        return "Extract bibitems from TeX sources"

    def load(self) -> Iterator[FileContents]:
        for arxiv_id in get_arxiv_ids(SOURCES_DIR):
            sources_dir = sources(arxiv_id)
            clean_directory(directories.bibitems(arxiv_id))
            for path in find_files(sources_dir, [".tex", ".bbl"]):
                contents = read_file_tolerant(path)
                if contents is None:
                    continue
                yield FileContents(arxiv_id, path, contents)

    def process(self, item: FileContents) -> Iterator[Bibitem]:
        try:
            bibitems = extract_bibitems(item.contents)
            logging.debug(
                "Extracted %d bibitems from file %s", len(bibitems), item.path
            )
            for bibitem in bibitems:
                yield bibitem
        except TexSoupParseError as e:
            logging.error("Could not parse TeX file %s with TexSoup: %s", item.path, e)

    def save(self, item: FileContents, result: Bibitem) -> None:
        results_dir = directories.bibitems(item.arxiv_id)
        if not os.path.exists(results_dir):
            os.makedirs(results_dir)
        results_path = os.path.join(results_dir, "bibitems.csv")
        with open(results_path, "a") as results_file:
            writer = csv.writer(results_file, quoting=csv.QUOTE_ALL)
            writer.writerow([result.key, result.text])
