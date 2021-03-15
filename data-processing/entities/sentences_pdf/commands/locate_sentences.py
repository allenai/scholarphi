# TODO - keep for development
from scripts import run_pipeline

import logging
import os.path
from dataclasses import dataclass
from typing import Iterator, List, Any

from common import directories, file_utils
from common.bounding_box import cluster_boxes
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId, BoundingBox, EntityLocationInfo, SerializableSymbol, Equation, HueLocationInfo, \
    RelativePath, Context
from entities.sentences.types import Sentence

from entities.sentences_pdf.pdf_stuff import SppBBox, TokenWithBBox, SymbolWithBBoxes, SentenceWithBBoxes, \
    RowWithBBox, Block, are_bboxes_intersecting


@dataclass(frozen=True)
class LocationTask:
    tex_path: RelativePath
    arxiv_id: ArxivId
    sentences: List[Sentence]
    symbols: List[SerializableSymbol]
    equations: List[Equation]
    contexts: List[Context]
    blocks: List[Block]


# TODO; any type
class LocateSentencesCommand(ArxivBatchCommand[Any, Any]):
    @staticmethod
    def get_name() -> str:
        return "locate-sentences"

    @staticmethod
    def get_description() -> str:
        return "Find locations of sentences. Requires 'locate-equations', 'locate-sentences', etc to have been run."

    def get_arxiv_ids_dirkey(self) -> str:
        return "detected-sentences"

    def load(self) -> Iterator[LocationTask]:

        for arxiv_id in self.arxiv_ids:

            output_dir = directories.arxiv_subdir("sentences-locations", arxiv_id)
            file_utils.clean_directory(output_dir)

             # TODO; this is good
            sentences = list(file_utils.load_from_csv(csv_path=os.path.join(
                directories.arxiv_subdir(dirkey='detected-sentences', arxiv_id=arxiv_id), 'entities.csv'
            ), D=Sentence))


            # TODO:  alternative is f'{symbol.tex_path}-{symbol.equation-index}-{symbol.symbol_index}'
            _symbol_id_to_symbol_bboxes = dict(file_utils.load_locations(arxiv_id=arxiv_id, entity_name='symbols'))
            pipeline_symbols = list(file_utils.load_from_csv(os.path.join(
                directories.arxiv_subdir(dirkey='detected-symbols', arxiv_id=arxiv_id), 'entities.csv'
            ), SerializableSymbol))
            symbol_id_to_symbol = {
                f'{symbol.tex_path}-{symbol.id_}': SymbolWithBBoxes(text=f'${symbol.tex}$', bboxes=_symbol_id_to_symbol_bboxes[symbol.id_])
                for symbol in pipeline_symbols
            }

            _equation_id_to_equation_bboxes = dict(file_utils.load_locations(arxiv_id=arxiv_id, entity_name='equations'))
            pipeline_equations = list(file_utils.load_from_csv(os.path.join(
                directories.arxiv_subdir(dirkey='detected-equations', arxiv_id=arxiv_id), 'entities.csv'
            ), Equation))
            equation_id_to_equation = {
                equation.id_: SymbolWithBBoxes(text=equation.tex, bboxes=_equation_id_to_equation_bboxes[equation.id_])
                for equation in pipeline_equations
            }

            contexts = list(file_utils.load_from_csv(os.path.join(
                directories.arxiv_subdir(dirkey='contexts-for-symbols', arxiv_id=arxiv_id), 'contexts.csv'), Context))

            # TODO; fill this out
            blocks = 0

            yield LocationTask(arxiv_id=arxiv_id, sentneces=[], symbols=[], equations=[], contexts=[])


    def process(self, item: LocationTask) -> Iterator[EntityLocationInfo]:
        sentences = []
        for sentence in sentences:
            for bbox in sentence.bboxes:
                yield EntityLocationInfo(
                    tex_path="N/A",
                    entity_id=sentence.id_,
                    page=bbox.page,
                    left=bbox.left,
                    top=bbox.top,
                    width=bbox.width,
                    height=bbox.height,
                )

    def save(self, item: LocationTask, result: EntityLocationInfo) -> None:
        output_dir = directories.arxiv_subdir("sentences-locations", item.arxiv_id)
        locations_path = os.path.join(output_dir, "entity_locations.csv")
        file_utils.append_to_csv(locations_path, result)
