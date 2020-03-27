import logging
import os
from dataclasses import dataclass
from typing import Dict, Iterator, List

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId, SymbolWithId
from entities.sentences.commands.find_entity_sentences import EntitySentencePairIds


@dataclass(frozen=True)
class SymbolSentencesTask:
    arxiv_id: ArxivId
    symbols: List[SymbolWithId]
    token_sentence_id_pairs: List[EntitySentencePairIds]


@dataclass(frozen=True)
class SymbolSentencePair:
    tex_path: str
    equation_index: int
    symbol_index: int
    sentence_id: str


@dataclass(frozen=True)
class TokenId:
    tex_path: str
    equation_index: int
    token_index: int


class FindSymbolSentences(ArxivBatchCommand[SymbolSentencesTask, SymbolSentencePair]):
    @staticmethod
    def get_name() -> str:
        return "find-sentences-for-symbols"

    @staticmethod
    def get_description() -> str:
        return "Find which sentences symbols belong to using the sentences tokens belong to."

    def get_arxiv_ids_dirkey(self) -> str:
        return "sentences-for-equation-tokens"

    def load(self) -> Iterator[SymbolSentencesTask]:

        for arxiv_id in self.arxiv_ids:

            output_dir = directories.arxiv_subdir("sentences-for-symbols", arxiv_id)
            file_utils.clean_directory(output_dir)

            token_sentences_path = os.path.join(
                directories.arxiv_subdir("sentences-for-equation-tokens", arxiv_id),
                "entity_sentences.csv",
            )
            if not os.path.exists(token_sentences_path):
                logging.warning(  # pylint: disable=logging-not-lazy
                    "Could not find links between sentences and equation tokens at "
                    + "path %s for arXiv paper %s. Skipping the detection of symbol sentences.",
                    token_sentences_path,
                    arxiv_id,
                )
                continue

            token_sentence_pairs = list(
                file_utils.load_from_csv(token_sentences_path, EntitySentencePairIds)
            )

            symbols = file_utils.load_symbols(arxiv_id)
            if not symbols:
                continue

            # Filter to only those symbols for which tokens have been detected
            symbols = [s for s in symbols if len(s.symbol.tokens) > 0]

            yield SymbolSentencesTask(arxiv_id, symbols, token_sentence_pairs)

    def process(self, item: SymbolSentencesTask) -> Iterator[SymbolSentencePair]:

        sentence_ids_by_token: Dict[TokenId, str] = {}
        for pair in item.token_sentence_id_pairs:
            equation_index, token_index = [int(t) for t in pair.entity_id.split("-")]
            token_id = TokenId(pair.tex_path, equation_index, token_index)
            sentence_ids_by_token[token_id] = pair.sentence_id

        for symbol_with_id in item.symbols:
            symbol_id = symbol_with_id.symbol_id
            symbol = symbol_with_id.symbol
            sentence_ids = set()
            for token_index in symbol.tokens:
                token_id = TokenId(
                    symbol_id.tex_path, symbol_id.equation_index, token_index
                )
                if token_id in sentence_ids_by_token:
                    sentence_ids.add(sentence_ids_by_token[token_id])
                else:
                    logging.warning(  # pylint: disable=logging-not-lazy
                        "Could not find sentence associated with token %d of equation %d "
                        + "in arXiv paper %s while detected symbol sentences.",
                        token_index,
                        equation_index,
                        item.arxiv_id,
                    )

            if len(sentence_ids) > 1:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "Tokens for symbol %s (equation %d symbol %d paper %s) have been detected "
                    + "as belonging to different sentences. This may be a bug with the sentence "
                    + "detection command. No sentence will be associated with this symbol.",
                    symbol.mathml,
                    symbol_id.equation_index,
                    symbol_id.symbol_index,
                    item.arxiv_id,
                )
                continue
            if len(sentence_ids) == 0:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "No sentences found containing any of the tokens for symbol %s "
                    + "(equation %d symbol %d paper %s). This may be a bug with the sentence "
                    + "detector. Skipping this symbol.",
                    symbol.mathml,
                    symbol_id.equation_index,
                    symbol_id.symbol_index,
                    item.arxiv_id,
                )
                continue

            yield SymbolSentencePair(
                symbol_id.tex_path,
                symbol_id.equation_index,
                symbol_id.symbol_index,
                list(sentence_ids)[0],
            )

    def save(self, item: SymbolSentencesTask, result: SymbolSentencePair) -> None:
        output_dir = directories.arxiv_subdir("sentences-for-symbols", item.arxiv_id)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        entity_sentences_path = os.path.join(output_dir, "entity_sentences.csv",)
        file_utils.append_to_csv(
            entity_sentences_path,
            EntitySentencePairIds(
                result.tex_path,
                f"{result.equation_index}-{result.symbol_index}",
                result.sentence_id,
            ),
        )
