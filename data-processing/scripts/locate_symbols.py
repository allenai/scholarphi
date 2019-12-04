import csv
import logging
import os.path
from typing import Dict, Iterator, List, NamedTuple

from explanations import directories
from explanations.bounding_box import get_symbol_bounding_box
from explanations.file_utils import clean_directory, load_symbols
from explanations.types import (
    ArxivId,
    CharacterId,
    CharacterLocations,
    Path,
    PdfBoundingBox,
    SymbolWithId,
)
from scripts.command import ArxivBatchCommand


class LocationTask(NamedTuple):
    arxiv_id: ArxivId
    character_locations: CharacterLocations
    symbol_with_id: SymbolWithId


class LocateSymbols(ArxivBatchCommand[LocationTask, PdfBoundingBox]):
    @staticmethod
    def get_name() -> str:
        return "locate-symbols"

    @staticmethod
    def get_description() -> str:
        return (
            "Find locations of symbols based on locations of equation tokens. "
            + "Requires 'locate-equation-token-hues' to have been run."
        )

    def get_arxiv_ids_dir(self) -> Path:
        return directories.HUE_LOCATIONS_FOR_EQUATION_TOKENS_DIR

    def load(self) -> Iterator[LocationTask]:

        for arxiv_id in self.arxiv_ids:

            output_dir = directories.get_data_subdirectory_for_arxiv_id(directories.SYMBOL_LOCATIONS_DIR, arxiv_id)
            clean_directory(output_dir)

            token_locations: Dict[CharacterId, List[PdfBoundingBox]] = {}
            token_locations_path = os.path.join(
                directories.get_data_subdirectory_for_arxiv_id(directories.HUE_LOCATIONS_FOR_EQUATION_TOKENS_DIR, arxiv_id),
                "hue_locations.csv",
            )
            if not os.path.exists(token_locations_path):
                logging.warning(
                    "Could not find bounding boxes information for %s. Skipping",
                    arxiv_id,
                )
                continue
            with open(token_locations_path) as token_locations_file:
                reader = csv.reader(token_locations_file)
                for row in reader:
                    tex_path = row[-3]
                    equation_index = int(row[-2])
                    character_index = int(row[-1])
                    character_id = CharacterId(
                        tex_path, equation_index, character_index
                    )
                    box = PdfBoundingBox(
                        page=int(row[3]),
                        left=float(row[4]),
                        top=float(row[5]),
                        width=float(row[6]),
                        height=float(row[7]),
                    )
                    if character_id not in token_locations:
                        token_locations[character_id] = []
                    token_locations[character_id].append(box)

            symbols_with_ids = load_symbols(arxiv_id)
            if symbols_with_ids is None:
                continue

            for symbol_with_id in symbols_with_ids:
                yield LocationTask(
                    arxiv_id=arxiv_id,
                    character_locations=token_locations,
                    symbol_with_id=symbol_with_id,
                )

    def process(self, item: LocationTask) -> Iterator[PdfBoundingBox]:
        symbol = item.symbol_with_id.symbol
        symbol_id = item.symbol_with_id.symbol_id
        box = get_symbol_bounding_box(symbol, symbol_id, item.character_locations)
        if box is not None:
            yield box

    def save(self, item: LocationTask, result: PdfBoundingBox) -> None:
        output_dir = directories.get_data_subdirectory_for_arxiv_id(directories.SYMBOL_LOCATIONS_DIR, item.arxiv_id)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        locations_path = os.path.join(output_dir, "symbol_locations.csv")
        symbol_id = item.symbol_with_id.symbol_id
        with open(locations_path, "a") as locations_file:
            writer = csv.writer(locations_file, quoting=csv.QUOTE_ALL)
            writer.writerow(
                [
                    symbol_id.tex_path,
                    symbol_id.equation_index,
                    symbol_id.symbol_index,
                    result.page,
                    result.left,
                    result.top,
                    result.width,
                    result.height,
                ]
            )
