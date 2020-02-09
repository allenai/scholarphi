import csv
import logging
import os.path
from typing import Dict, Iterator, List, NamedTuple

import explanations.directories as directories
from explanations.file_utils import load_symbols
from explanations.s2_data import get_s2_id
from explanations.types import (
    ArxivId,
    Match,
    Matches,
    MathML,
    Path,
    PdfBoundingBox,
    SymbolId,
    SymbolWithId,
)
from models.models import BoundingBox, Entity, EntityBoundingBox
from models.models import MathMl as MathMlModel
from models.models import MathMlMatch, Paper
from models.models import Symbol as SymbolModel
from models.models import SymbolChild, output_database
from scripts.command import DatabaseUploadCommand

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


class UploadSymbols(DatabaseUploadCommand[SymbolData, None]):
    @staticmethod
    def get_name() -> str:
        return "upload-symbols"

    @staticmethod
    def get_description() -> str:
        return "Upload symbols to the database."

    @staticmethod
    def get_entity_type() -> str:
        return "symbols"

    def get_arxiv_ids_dir(self) -> Path:
        return directories.SOURCES_DIR

    def load(self) -> Iterator[SymbolData]:
        for arxiv_id in self.arxiv_ids:

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
            with open(matches_path, encoding="utf-8") as matches_file:
                reader = csv.reader(matches_file)
                for row in reader:
                    mathml = row[0]
                    match_mathml = row[1]
                    rank = int(row[2])
                    if mathml not in matches:
                        matches[mathml] = []
                    matches[mathml].append(Match(match_mathml, rank))

            yield SymbolData(arxiv_id, s2_id, symbols_with_ids, boxes, matches)

    def process(self, _: SymbolData) -> Iterator[None]:
        yield None

    def save(self, item: SymbolData, _: None) -> None:

        arxiv_id = item.arxiv_id
        s2_id = item.s2_id
        symbols_with_ids = item.symbols_with_ids
        boxes = item.boxes
        matches = item.matches

        try:
            paper = Paper.get(Paper.s2_id == s2_id)
        except Paper.DoesNotExist:
            paper = Paper.create(s2_id=s2_id, arxiv_id=arxiv_id)

        # Load MathML models into cache; they will be needed for creating multiple symbols.
        mathml_cache: Dict[MathML, MathMlModel] = {}
        mathml_equations = {swi.symbol.mathml for swi in symbols_with_ids}
        for mathml, mathml_matches in matches.items():
            mathml_equations.update(
                {mathml}.union({match.mathml for match in mathml_matches})
            )
        for mathml in mathml_equations:
            if mathml not in mathml_cache:
                try:
                    mathml_model = MathMlModel.get(MathMlModel.mathml == mathml)
                except MathMlModel.DoesNotExist:
                    mathml_model = MathMlModel.create(mathml=mathml)
                mathml_cache[mathml] = mathml_model

        # Upload MathML search results.
        mathml_match_models = []
        for mathml, mathml_matches in matches.items():
            for match in mathml_matches:
                mathml_match_models.append(
                    MathMlMatch(
                        paper=paper,
                        mathml=mathml_cache[mathml],
                        match=mathml_cache[match.mathml],
                        rank=match.rank,
                    )
                )
        with output_database.atomic():
            MathMlMatch.bulk_create(mathml_match_models, 200)

        # Create all symbols in bulk. This lets us resolve their IDs before we start referring to
        # them from other tables. It also lets us refer to their models in the parent-child table.
        symbol_models: Dict[SymbolId, SymbolModel] = {}
        symbol_models_by_symbol_object_id: Dict[int, SymbolModel] = {}

        for symbol_with_id in symbols_with_ids:
            symbol = symbol_with_id.symbol
            symbol_id = symbol_with_id.symbol_id
            mathml_model = mathml_cache[symbol.mathml]
            symbol_model = SymbolModel(paper=paper, mathml=mathml_model)
            symbol_models[symbol_id] = symbol_model
            symbol_models_by_symbol_object_id[id(symbol)] = symbol_model

        with output_database.atomic():
            SymbolModel.bulk_create(symbol_models.values(), 300)

        # Upload bounding boxes for symbols. 'bulk_create' must have already been called on the
        # the symbol models to make sure their model IDs can be used here.
        entities = []
        entity_bounding_boxes = []
        bounding_boxes = []
        for symbol_with_id in symbols_with_ids:

            symbol_id = symbol_with_id.symbol_id
            symbol_model = symbol_models[symbol_id]

            box = boxes.get(symbol_id)
            if box is not None:
                entity = Entity(
                    type="symbol", source="tex-pipeline", entity_id=symbol_model.id
                )
                entities.append(entity)
                bounding_box = BoundingBox(
                    page=box.page,
                    left=box.left,
                    top=box.top,
                    width=box.width,
                    height=box.height,
                )
                bounding_boxes.append(bounding_box)

                entity_bounding_box = EntityBoundingBox(
                    bounding_box=bounding_box, entity=entity
                )
                entity_bounding_boxes.append(entity_bounding_box)

        with output_database.atomic():
            BoundingBox.bulk_create(bounding_boxes, 100)
        with output_database.atomic():
            Entity.bulk_create(entities, 300)
        with output_database.atomic():
            EntityBoundingBox.bulk_create(entity_bounding_boxes, 300)

        # Upload parent-child relationships between symbols.
        symbol_child_models = []
        for symbol_with_id in symbols_with_ids:

            symbol = symbol_with_id.symbol
            symbol_id = symbol_with_id.symbol_id
            symbol_model = symbol_models[symbol_id]

            for child in symbol.children:
                child_model = symbol_models_by_symbol_object_id[id(child)]
                symbol_child_models.append(
                    SymbolChild(parent=symbol_model, child=child_model)
                )
        with output_database.atomic():
            SymbolChild.bulk_create(symbol_child_models, 300)
