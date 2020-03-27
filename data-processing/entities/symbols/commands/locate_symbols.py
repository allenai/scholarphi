import os.path
from typing import Iterator, NamedTuple

from common import directories, file_utils
from common.bounding_box import get_symbol_bounding_box
from common.commands.base import ArxivBatchCommand
from common.types import (
    ArxivId,
    BoundingBox,
    SymbolLocation,
    SymbolWithId,
    TokenLocations,
)


class LocationTask(NamedTuple):
    arxiv_id: ArxivId
    token_locations: TokenLocations
    symbol_with_id: SymbolWithId


class LocateSymbols(ArxivBatchCommand[LocationTask, BoundingBox]):
    @staticmethod
    def get_name() -> str:
        return "locate-symbols"

    @staticmethod
    def get_description() -> str:
        return (
            "Find locations of symbols based on locations of equation tokens. "
            + "Requires 'locate-equation-token-hues' to have been run."
        )

    def get_arxiv_ids_dirkey(self) -> str:
        return "hue-locations-for-equation-tokens"

    def load(self) -> Iterator[LocationTask]:

        for arxiv_id in self.arxiv_ids:

            output_dir = directories.arxiv_subdir("symbol-locations", arxiv_id)
            file_utils.clean_directory(output_dir)

            token_locations = file_utils.load_equation_token_locations(arxiv_id)
            if token_locations is None:
                continue

            symbols_with_ids = file_utils.load_symbols(arxiv_id)
            if symbols_with_ids is None:
                continue

            for symbol_with_id in symbols_with_ids:
                yield LocationTask(
                    arxiv_id=arxiv_id,
                    token_locations=token_locations,
                    symbol_with_id=symbol_with_id,
                )

    def process(self, item: LocationTask) -> Iterator[BoundingBox]:
        symbol = item.symbol_with_id.symbol
        symbol_id = item.symbol_with_id.symbol_id
        box = get_symbol_bounding_box(symbol, symbol_id, item.token_locations)
        if box is not None:
            yield box

    def save(self, item: LocationTask, result: BoundingBox) -> None:
        output_dir = directories.arxiv_subdir("symbol-locations", item.arxiv_id)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        locations_path = os.path.join(output_dir, "symbol_locations.csv")
        symbol_id = item.symbol_with_id.symbol_id
        file_utils.append_to_csv(
            locations_path,
            SymbolLocation(
                tex_path=symbol_id.tex_path,
                equation_index=symbol_id.equation_index,
                symbol_index=symbol_id.symbol_index,
                page=result.page,
                left=result.left,
                top=result.top,
                width=result.width,
                height=result.height,
            ),
        )
