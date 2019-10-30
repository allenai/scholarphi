import csv
import logging
import os.path
from typing import Dict, Iterator, List, NamedTuple

import explanations.directories as directories
from explanations.directories import SOURCES_DIR, get_arxiv_ids
from explanations.s2_data import get_s2_id
from explanations.types import ArxivId, EquationIndex, Path, PdfBoundingBox
from models.models import (BoundingBox, Entity, EntityBoundingBox, Paper,
                           Symbol, create_tables)
from scripts.command import Command

S2Id = str
Hue = float


class EquationHue(NamedTuple):
    path: Path
    equation_index: EquationIndex
    hue: Hue


class SymbolData(NamedTuple):
    arxiv_id: ArxivId
    s2_id: S2Id
    boxes: Dict[EquationHue, List[PdfBoundingBox]]
    symbols: Dict[EquationHue, str]


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

            boxes: Dict[EquationHue, List[PdfBoundingBox]] = {}
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
                    hue = float(row[1])
                    box = PdfBoundingBox(
                        page=int(row[2]),
                        left=float(row[3]),
                        top=float(row[4]),
                        width=float(row[5]),
                        height=float(row[6]),
                    )
                    tex_path = row[11]
                    equation_index = int(row[12])
                    key = EquationHue(tex_path, equation_index, hue)
                    if key not in boxes:
                        boxes[key] = []
                    boxes[key].append(box)

            symbols: Dict[EquationHue, str] = {}
            symbol_hues_path = os.path.join(
                directories.sources_with_colorized_equation_tokens(arxiv_id),
                "token_hues.csv",
            )
            if not os.path.exists(symbol_hues_path):
                logging.warning("Could not find symbol hues for %s. Skipping", arxiv_id)
                continue
            with open(symbol_hues_path) as symbol_hues_file:
                reader = csv.reader(symbol_hues_file)
                for row in reader:
                    tex_path = row[0]
                    equation_index = int(row[1])
                    hue = float(row[2])
                    key = EquationHue(tex_path, equation_index, hue)
                    symbol = row[5]
                    symbols[key] = symbol

            yield SymbolData(arxiv_id, s2_id, boxes, symbols)

    def process(self, _: SymbolData) -> Iterator[None]:
        yield None

    def save(self, item: SymbolData, _: None) -> None:

        arxiv_id = item.arxiv_id
        s2_id = item.s2_id
        boxes_by_equation_hue = item.boxes
        symbols_by_equation_hue = item.symbols

        create_tables()

        try:
            paper = Paper.get(Paper.s2_id == s2_id)
        except Paper.DoesNotExist:
            paper = Paper.create(s2_id=s2_id, arxiv_id=arxiv_id)

        for equation_hue, boxes in boxes_by_equation_hue.items():

            symbol_tex = symbols_by_equation_hue[equation_hue]
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
