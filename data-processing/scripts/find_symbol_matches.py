import csv
import os.path
from typing import Iterator, List, NamedTuple

from explanations import directories
from explanations.directories import get_arxiv_ids
from explanations.file_utils import clean_directory, load_symbols
from explanations.match_symbols import Matches, match_symbols
from explanations.types import ArxivId, SymbolWithId
from scripts.command import Command


class SymbolsForPaper(NamedTuple):
    arxiv_id: ArxivId
    symbols_with_ids: List[SymbolWithId]


class FindSymbolMatches(Command[SymbolsForPaper, Matches]):
    @staticmethod
    def get_name() -> str:
        return "find-symbol-matches"

    @staticmethod
    def get_description() -> str:
        return "Find matches between a symbol and all other symbols in each paper."

    def load(self) -> Iterator[SymbolsForPaper]:

        for arxiv_id in get_arxiv_ids(directories.SYMBOLS_DIR):

            output_dir = directories.symbol_matches(arxiv_id)
            clean_directory(output_dir)

            yield SymbolsForPaper(
                arxiv_id=arxiv_id, symbols_with_ids=load_symbols(arxiv_id)
            )

    def process(self, item: SymbolsForPaper) -> Iterator[Matches]:
        matches = match_symbols(item.symbols_with_ids)
        yield matches

    def save(self, item: SymbolsForPaper, result: Matches) -> None:
        output_dir = directories.symbol_matches(item.arxiv_id)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        matches_path = os.path.join(output_dir, "matches.csv")
        with open(matches_path, "a") as matches_file:
            writer = csv.writer(matches_file, quoting=csv.QUOTE_ALL)
            for symbol_id, matches in result.items():
                for rank, match in enumerate(matches, start=1):
                    writer.writerow(
                        [
                            symbol_id.tex_path,
                            symbol_id.equation_index,
                            symbol_id.symbol_index,
                            rank,
                            match.symbol_id.tex_path,
                            match.symbol_id.equation_index,
                            match.symbol_id.symbol_index,
                            match.mathml,
                        ]
                    )
