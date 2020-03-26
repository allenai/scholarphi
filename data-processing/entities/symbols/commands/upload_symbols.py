import logging
import os.path
from typing import Dict, Iterator

from common import directories, file_utils
from common.commands.database import DatabaseUploadCommand
from common.s2_data import get_s2_id
from common.types import (
    BoundingBox,
    Match,
    Matches,
    SymbolId,
    SymbolLocation,
)
from entities.sentences.commands.find_entity_sentences import EntitySentencePairIds
from entities.sentences.upload import SentenceIdAndModelId

from ..types import SymbolData, SymbolKey, SentenceKey
from ..utils import upload_symbols

S2Id = str
Hue = float
SentenceModelId = str

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

            symbol_sentence_model_ids: Dict[SymbolId, SentenceModelId] = {}
            sentence_data_missing = False

            sentences_path = os.path.join(
                directories.arxiv_subdir("sentences-for-symbols", arxiv_id),
                "entity_sentences.csv",
            )
            if not os.path.exists(sentences_path):
                logging.warning(  # pylint: disable=logging-not-lazy
                    "Symbols for arXiv paper %s have not been aligned to sentences. "
                    + "Symbol data will be uploaded without links to sentences",
                    arxiv_id,
                )
                sentence_data_missing = True

            sentence_model_ids_path = os.path.join(
                directories.arxiv_subdir("sentences-model-ids", arxiv_id),
                "model_ids.csv",
            )
            if not os.path.exists(sentence_model_ids_path):
                logging.warning(  # pylint: disable=logging-not-lazy
                    "Sentence bounding boxes have not yet been uploaded for paper %s. "
                    + "Symbol data will be uploaded without links to sentences.",
                    arxiv_id,
                )
                sentence_data_missing = True

            if not sentence_data_missing:
                sentence_model_ids: Dict[SentenceKey, SentenceModelId] = {}
                for ids in file_utils.load_from_csv(
                    sentence_model_ids_path, SentenceIdAndModelId
                ):
                    key = SentenceKey(ids.tex_path, ids.entity_id)
                    sentence_model_ids[key] = ids.model_id

                for pair in file_utils.load_from_csv(
                    sentences_path, EntitySentencePairIds
                ):
                    tex_path = pair.tex_path
                    equation_index, symbol_index = [
                        int(t) for t in pair.entity_id.split("-")
                    ]
                    sentence_key = SentenceKey(pair.tex_path, pair.sentence_id)
                    symbol_id = SymbolId(tex_path, equation_index, symbol_index)
                    if sentence_key in sentence_model_ids:
                        symbol_sentence_model_ids[symbol_id] = sentence_model_ids[
                            sentence_key
                        ]

            yield SymbolData(
                arxiv_id,
                s2_id,
                symbols_with_ids,
                boxes,
                symbol_sentence_model_ids,
                matches,
            )

    def process(self, _: SymbolData) -> Iterator[None]:
        yield None

    def save(self, item: SymbolData, _: None) -> None:
        upload_symbols(item)
