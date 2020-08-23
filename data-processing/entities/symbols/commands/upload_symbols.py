import logging
import os.path
from typing import Callable, Dict, Iterator, Optional

from common import directories, file_utils
from common.commands.database import DatabaseUploadCommand
from common.s2_data import get_s2_id
from common.types import (
    BoundingBox,
    EntityData,
    EntityInformation,
    EntityReference,
    EntityRelationships,
    Match,
    Matches,
    SymbolId,
    SymbolLocation,
)
from common.upload_entities import upload_entities
from entities.sentences.types import Context

from ..types import SymbolData


class UploadSymbols(DatabaseUploadCommand[SymbolData, None]):
    @staticmethod
    def get_name() -> str:
        return "upload-symbols"

    @staticmethod
    def get_description() -> str:
        return "Upload symbols to the database."

    def get_arxiv_ids_dirkey(self) -> str:
        return "sources"

    def load(self) -> Iterator[SymbolData]:
        for arxiv_id in self.arxiv_ids:

            s2_id = get_s2_id(arxiv_id)
            if s2_id is None:
                continue

            symbols_with_ids = file_utils.load_symbols(arxiv_id)
            if symbols_with_ids is None:
                continue

            boxes: Dict[SymbolId, BoundingBox] = {}
            boxes_path = os.path.join(
                directories.arxiv_subdir("symbol-locations", arxiv_id),
                "symbol_locations.csv",
            )
            if not os.path.exists(boxes_path):
                logging.warning(
                    "Could not find bounding boxes information for %s. Skipping",
                    arxiv_id,
                )
                continue
            for location in file_utils.load_from_csv(boxes_path, SymbolLocation):
                symbol_id = SymbolId(
                    tex_path=location.tex_path,
                    equation_index=location.equation_index,
                    symbol_index=location.symbol_index,
                )
                box = BoundingBox(
                    page=int(location.page),
                    left=location.left,
                    top=location.top,
                    width=location.width,
                    height=location.height,
                )
                boxes[symbol_id] = box

            matches: Matches = {}
            matches_path = os.path.join(
                directories.arxiv_subdir("symbol-matches", arxiv_id), "matches.csv"
            )
            if not os.path.exists(matches_path):
                logging.warning(
                    "Could not find symbol matches information for %s. Skipping",
                    arxiv_id,
                )
                continue
            for match in file_utils.load_from_csv(matches_path, Match):
                if match.queried_mathml not in matches:
                    matches[match.queried_mathml] = []
                matches[match.queried_mathml].append(match)

            context_data_missing = False
            contexts_path = os.path.join(
                directories.arxiv_subdir("contexts-for-symbols", arxiv_id),
                "contexts.csv",
            )
            if not os.path.exists(contexts_path):
                logging.warning(  # pylint: disable=logging-not-lazy
                    "Contexts have not been found for symbols for arXiv paper %s. "
                    + "Symbol data will be uploaded without contexts.",
                    arxiv_id,
                )
                context_data_missing = True

            if not context_data_missing:
                contexts = {}
                for context in file_utils.load_from_csv(contexts_path, Context):
                    tex_path = context.tex_path
                    equation_index, symbol_index = [
                        int(t) for t in context.entity_id.split("-")
                    ]
                    symbol_id = SymbolId(tex_path, equation_index, symbol_index)
                    contexts[symbol_id] = context

            yield SymbolData(
                arxiv_id, s2_id, symbols_with_ids, boxes, contexts, matches,
            )

    def process(self, _: SymbolData) -> Iterator[None]:
        yield None

    def save(self, item: SymbolData, _: None) -> None:
        symbols_with_ids = item.symbols_with_ids
        boxes = item.boxes
        matches = item.matches
        contexts = item.symbol_contexts

        symbol_ids_by_symbol_object_ids = {}
        for symbol_with_id in symbols_with_ids:
            symbol_ids_by_symbol_object_ids[
                id(symbol_with_id.symbol)
            ] = symbol_with_id.symbol_id

        entity_infos = []

        for symbol_with_id in symbols_with_ids:
            symbol = symbol_with_id.symbol
            symbol_id = symbol_with_id.symbol_id
            context = contexts.get(symbol_id)

            box = boxes.get(symbol_id)
            if box is None:
                continue

            data: EntityData = {
                "tex": f"${symbol.tex}$",
                "tex_start": symbol.start,
                "tex_end": symbol.end,
                "mathml": symbol.mathml,
                "mathml_near_matches": [
                    m.matching_mathml for m in matches[symbol.mathml]
                ]
            }
            if context is not None:
                data["snippet"] = context.snippet

            create_symbol_id_string: Callable[[SymbolId], str] = (
                lambda sid: f"{sid.tex_path}-{sid.equation_index}-{sid.symbol_index}"
            )

            sentence_id = (
                f"{context.tex_path}-{context.sentence_id}"
                if context is not None
                else None
            )

            parent_id: Optional[str] = None
            for other_symbol_with_id in symbols_with_ids:
                other_symbol_id = other_symbol_with_id.symbol_id
                other_symbol = other_symbol_with_id.symbol
                try:
                    other_symbol.children.index(symbol)
                    parent_id = create_symbol_id_string(other_symbol_id)
                except ValueError:
                    continue

            child_ids = []
            for child_symbol in symbol.children:
                child_symbol_id = symbol_ids_by_symbol_object_ids[id(child_symbol)]
                string_id = create_symbol_id_string(child_symbol_id)
                child_ids.append(string_id)

            relationships: EntityRelationships = {
                "equation": EntityReference(
                    type_="equation",
                    id_=f"{symbol_id.tex_path}-{symbol_id.equation_index}",
                ),
                "parent": EntityReference(type_="symbol", id_=parent_id),
                "children": [
                    EntityReference(type_="symbol", id_=id_) for id_ in child_ids
                ],
                "sentence": EntityReference(type_="sentence", id_=sentence_id)
                if sentence_id is not None
                else EntityReference(type_="sentence", id_=None),
            }

            entity_information = EntityInformation(
                id_=f"{symbol_id.tex_path}-{symbol_id.equation_index}-{symbol_id.symbol_index}",
                type_="symbol",
                bounding_boxes=[box],
                data=data,
                relationships=relationships,
            )
            entity_infos.append(entity_information)

        upload_entities(item.s2_id, item.arxiv_id, entity_infos, self.args.data_version)
