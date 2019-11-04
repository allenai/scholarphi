import csv
import logging
import os.path
from typing import Dict, Iterator, List, NamedTuple

import explanations.directories as directories
from explanations.directories import SOURCES_DIR, get_arxiv_ids
from explanations.s2_data import get_s2_id
from explanations.types import ArxivId, PdfBoundingBox
from models.models import (
    BoundingBox,
    Entity,
    EntityBoundingBox,
    Paper,
    Symbol,
    create_tables,
)
from scripts.command import Command

S2Id = str
Hue = float


class SymbolKey(NamedTuple):
    arxiv_id: ArxivId
    tex_path: str
    equation_index: int
    token_index: int


class SymbolData(NamedTuple):
    arxiv_id: ArxivId
    s2_id: S2Id
    boxes: Dict[SymbolKey, List[PdfBoundingBox]]
    symbols: Dict[SymbolKey, str]


class UploadSymbols(Command[SymbolData, None]):
    @staticmethod
    def get_name() -> str:
        return "upload-symbols"

    @staticmethod
    def get_description() -> str:
        return "Upload symbol locations to the database."

    def load(self) -> Iterator[SymbolData]:
        for arxiv_id in get_arxiv_ids(SOURCES_DIR):

            s2_id = get_s2_id(arxiv_id)
            if s2_id is None:
                continue

            boxes: Dict[SymbolKey, List[PdfBoundingBox]] = {}
            boxes_path = os.path.join(
                directories.hue_locations_for_equation_tokens(arxiv_id),
                "hue_locations.csv",
            )
            if not os.path.exists(boxes_path):
                logging.warning(
                    "Could not find bounding boxes information for %s. Skipping",
                    arxiv_id,
                )
                continue
            with open(boxes_path) as boxes_file:
                reader = csv.reader(boxes_file)
                for row in reader:
                    tex_path = row[-3]
                    equation_index = int(row[-2])
                    token_index = int(row[-1])
                    symbol_key = SymbolKey(
                        arxiv_id, tex_path, equation_index, token_index
                    )

                    box = PdfBoundingBox(
                        page=int(row[3]),
                        left=float(row[4]),
                        top=float(row[5]),
                        width=float(row[6]),
                        height=float(row[7]),
                    )
                    if symbol_key not in boxes:
                        boxes[symbol_key] = []
                    boxes[symbol_key].append(box)

            symbols: Dict[SymbolKey, str] = {}
            symbols_path = os.path.join(
                directories.equation_tokens(arxiv_id), "tokens.csv"
            )
            if not os.path.exists(symbols_path):
                logging.warning("Could not find symbol hues for %s. Skipping", arxiv_id)
                continue
            with open(symbols_path) as symbols_file:
                reader = csv.reader(symbols_file)
                for row in reader:
                    tex_path = row[0]
                    equation_index = int(row[1])
                    token_index = int(row[3])
                    key = SymbolKey(arxiv_id, tex_path, equation_index, token_index)
                    symbol = row[6]
                    symbols[key] = symbol

            yield SymbolData(arxiv_id, s2_id, boxes, symbols)

    def process(self, _: SymbolData) -> Iterator[None]:
        yield None

    def save(self, item: SymbolData, _: None) -> None:

        arxiv_id = item.arxiv_id
        s2_id = item.s2_id
        boxes_by_symbol_key = item.boxes
        symbols_by_key = item.symbols

        create_tables()

        try:
            paper = Paper.get(Paper.s2_id == s2_id)
        except Paper.DoesNotExist:
            paper = Paper.create(s2_id=s2_id, arxiv_id=arxiv_id)

        for symbol_key, boxes in boxes_by_symbol_key.items():

            symbol_tex = symbols_by_key[symbol_key]
            symbol = Symbol.create(paper=paper, tex=symbol_tex)
            entity = Entity.create(type="symbol", entity_id=symbol.id)

            for box in boxes:

                bounding_box = BoundingBox.create(
                    page=box.page,
                    left=box.left,
                    top=box.top,
                    width=box.width,
                    height=box.height,
                )
                EntityBoundingBox.create(bounding_box=bounding_box, entity=entity)
