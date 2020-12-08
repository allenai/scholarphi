import logging
import os.path
from dataclasses import dataclass
from typing import Iterator, List

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId, EntityLocationInfo


@dataclass(frozen=True)
class Locations:
    arxiv_id: ArxivId
    locations: List[EntityLocationInfo]


class CollectSymbolLocations(ArxivBatchCommand[Locations, None]):
    @staticmethod
    def get_name() -> str:
        return "collect-symbol-locations"

    @staticmethod
    def get_description() -> str:
        return "Collect locations of all symbols found in previous steps."

    def get_arxiv_ids_dirkey(self) -> str:
        return "detected-symbols"

    def load(self) -> Iterator[Locations]:

        for arxiv_id in self.arxiv_ids:

            output_dir = directories.arxiv_subdir("symbols-locations", arxiv_id)
            file_utils.clean_directory(output_dir)

            all_locations: List[EntityLocationInfo] = []
            composite_symbols_path = os.path.join(
                directories.arxiv_subdir("composite-symbols-locations", arxiv_id),
                "symbol_locations.csv",
            )
            if os.path.exists(composite_symbols_path):
                all_locations.extend(
                    file_utils.load_from_csv(composite_symbols_path, EntityLocationInfo)
                )
            else:
                logging.info(
                    "No locations could be found for composite symbols for paper %s.",
                    arxiv_id,
                )

            symbols_with_affixes_path = os.path.join(
                directories.arxiv_subdir("symbols-with-affixes-locations", arxiv_id),
                "entity_locations.csv",
            )
            if os.path.exists(symbols_with_affixes_path):
                all_locations.extend(
                    file_utils.load_from_csv(
                        symbols_with_affixes_path, EntityLocationInfo
                    )
                )
            else:
                logging.info(
                    "No locations could be found for symbols with affixes for paper %s.",
                    arxiv_id,
                )

            yield Locations(arxiv_id, all_locations)

    def process(self, item: Locations) -> Iterator[None]:
        yield None

    def save(self, item: Locations, result: None) -> None:
        output_dir = directories.arxiv_subdir("symbols-locations", item.arxiv_id)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        output_path = os.path.join(output_dir, "entity_locations.csv")
        for location in item.locations:
            file_utils.append_to_csv(output_path, location)
