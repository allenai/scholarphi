import csv
import logging
import os.path
from typing import Dict, Iterator, List, NamedTuple

import explanations.directories as directories
from explanations.directories import SOURCES_DIR, get_arxiv_ids
from explanations.file_utils import load_symbols
from explanations.s2_data import get_s2_id
from explanations.types import (
    ArxivId,
    Match,
    Matches,
    PdfBoundingBox,
    SymbolId,
    SymbolWithId,
)
from models.models import BoundingBox, Entity, EntityBoundingBox, MathMl, Paper
from models.models import Symbol as SymbolModel
from models.models import SymbolChild, SymbolMatch, create_tables
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
    symbols_with_ids: List[SymbolWithId]
    boxes: Dict[SymbolId, PdfBoundingBox]
    matches: Matches


class UploadSymbols(Command[SymbolData, None]):
    @staticmethod
    def get_name() -> str:
        return "upload-symbols"

    @staticmethod
    def get_description() -> str:
        return "Upload symbols to the database."

    def load(self) -> Iterator[SymbolData]:
        for arxiv_id in get_arxiv_ids(SOURCES_DIR):

            s2_id = get_s2_id(arxiv_id)
            if s2_id is None:
                continue

            symbols_with_ids = load_symbols(arxiv_id)
            if symbols_with_ids is None:
                continue

            boxes: Dict[SymbolId, PdfBoundingBox] = {}
            boxes_path = os.path.join(
                directories.symbol_locations(arxiv_id), "symbol_locations.csv"
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
                    symbol_id = SymbolId(
                        tex_path=row[0],
                        equation_index=int(row[1]),
                        symbol_index=int(row[2]),
                    )
                    box = PdfBoundingBox(
                        page=int(row[3]),
                        left=float(row[4]),
                        top=float(row[5]),
                        width=float(row[6]),
                        height=float(row[7]),
                    )
                    boxes[symbol_id] = box

            matches: Matches = {}
            matches_path = os.path.join(
                directories.symbol_matches(arxiv_id), "matches.csv"
            )
            if not os.path.exists(matches_path):
                logging.warning(
                    "Could not find symbol matches information for %s. Skipping",
                    arxiv_id,
                )
                continue
            with open(matches_path) as matches_file:
                # XXX(andrewhead): Currently assumes that the records in the matches.csv file
                # are in order of rank of the matches. If that's not the case, then the below
                # code needs to take the rank into account when sorting the matches.
                reader = csv.reader(matches_file)
                for row in reader:
                    symbol_id = SymbolId(
                        tex_path=row[0],
                        equation_index=int(row[1]),
                        symbol_index=int(row[2]),
                    )
                    matched_symbol_id = SymbolId(
                        tex_path=row[4],
                        equation_index=int(row[5]),
                        symbol_index=int(row[6]),
                    )
                    mathml = row[7]
                    if symbol_id not in matches:
                        matches[symbol_id] = []
                    matches[symbol_id].append(Match(matched_symbol_id, mathml))

            yield SymbolData(arxiv_id, s2_id, symbols_with_ids, boxes, matches)

    def process(self, _: SymbolData) -> Iterator[None]:
        yield None

    def save(self, item: SymbolData, _: None) -> None:

        arxiv_id = item.arxiv_id
        s2_id = item.s2_id
        symbols_with_ids = item.symbols_with_ids
        boxes = item.boxes
        matches = item.matches

        create_tables()

        try:
            paper = Paper.get(Paper.s2_id == s2_id)
        except Paper.DoesNotExist:
            paper = Paper.create(s2_id=s2_id, arxiv_id=arxiv_id)

        # First, create all symbols, so we can store them in memory as we link them with
        # match records and parent-child relationships.
        symbol_models: Dict[SymbolId, SymbolModel] = {}
        symbol_models_by_symbol_object_id: Dict[int, SymbolModel] = {}
        for symbol_with_id in symbols_with_ids:

            symbol = symbol_with_id.symbol
            symbol_id = symbol_with_id.symbol_id

            try:
                mathml = MathMl.get(MathMl.mathml == symbol.mathml)
            except MathMl.DoesNotExist:
                mathml = MathMl.create(mathml=symbol.mathml)

            symbol_model = SymbolModel.create(paper=paper, mathml=mathml)
            symbol_models[symbol_id] = symbol_model
            symbol_models_by_symbol_object_id[id(symbol)] = symbol_model

            box = boxes.get(symbol_id)
            if box is not None:
                entity = Entity.create(type="symbol", entity_id=symbol_model.id)
                bounding_box = BoundingBox.create(
                    page=box.page,
                    left=box.left,
                    top=box.top,
                    width=box.width,
                    height=box.height,
                )
                EntityBoundingBox.create(bounding_box=bounding_box, entity=entity)

        for symbol_id, symbol_matches in matches.items():
            symbol_model = symbol_models[symbol_id]
            for rank, match in enumerate(symbol_matches, start=1):
                match_symbol_model = symbol_models[match.symbol_id]
                SymbolMatch.create(
                    symbol=symbol_model, match=match_symbol_model, rank=rank
                )

        for symbol_with_id in symbols_with_ids:

            symbol = symbol_with_id.symbol
            symbol_id = symbol_with_id.symbol_id
            symbol_model = symbol_models[symbol_id]

            for child in symbol.children:
                child_model = symbol_models_by_symbol_object_id[id(child)]
                SymbolChild.create(parent=symbol_model, child=child_model)
