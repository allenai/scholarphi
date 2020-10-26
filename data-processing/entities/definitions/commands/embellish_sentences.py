import logging
import os.path
import re
from collections import defaultdict
from dataclasses import dataclass
from typing import Dict, Iterator, List

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId, Symbol
from entities.sentences.types import Sentence

from ..types import EmbellishedSentence

TexPath = str
EquationIndex = int


@dataclass(frozen=True)
class Task:
    arxiv_id: ArxivId
    sentence: Sentence
    symbols: List[Symbol]


class EmbellishSentences(ArxivBatchCommand[Task, EmbellishedSentence]):
    @staticmethod
    def get_name() -> str:
        return "embellish-sentences"

    @staticmethod
    def get_description() -> str:
        return (
            "Embellish sentences to prepare them for definition detection. Examples of "
            + "embellishments include inserting bags of words of symbols in place of equations."
        )

    def get_arxiv_ids_dirkey(self) -> str:
        return "embellished-sentences"

    def load(self) -> Iterator[Task]:
        for arxiv_id in self.arxiv_ids:

            output_dir = directories.arxiv_subdir("embellished-sentences", arxiv_id)
            file_utils.clean_directory(output_dir)

            # Load symbols, for use in embellishing equations.
            symbols: Dict[str, List[Symbol]] = defaultdict(list)
            symbol_data = file_utils.load_symbols(arxiv_id)
            if symbol_data is not None:
                for id_, symbol in symbol_data:
                    symbols[id_.tex_path].append(symbol)
            else:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "No symbol data found for arXiv ID %s. It will not be "
                    + "possible to expand equations in sentences with symbol data. This should only "
                    + "be a problem if it's expected that there are no symbols in paper %s.",
                    arxiv_id,
                    arxiv_id,
                )

            # Load sentences.
            detected_sentences_path = os.path.join(
                directories.arxiv_subdir("detected-sentences", arxiv_id),
                "entities.csv",
            )
            try:
                sentences = file_utils.load_from_csv(detected_sentences_path, Sentence)
            except FileNotFoundError:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "No sentences data found for arXiv paper %s. Try re-running the pipeline, "
                    + "this time enabling the processing of sentences. If that doesn't work, "
                    + "there is likely an error in detcting sentences for this paper.",
                    arxiv_id,
                )
                continue

            for sentence in sentences:
                yield Task(arxiv_id, sentence, symbols[sentence.tex_path])

    def process(self, item: Task) -> Iterator[EmbellishedSentence]:
        sentence = item.sentence
        symbols = item.symbols

        # Replace equations with more helpful representations.
        # Replace equations in reverse so that earlier replacements don't affect the character
        # offsets for the later replacements.
        with_symbols_marked = sentence.sanitized_journal
        legacy_definition_input = sentence.sanitized_journal

        # To create the legacy input for the definition detector, replace each top-level
        # equation with the text 'SYMBOL'.
        equation_matches = list(
            re.finditer("EQUATION_DEPTH_0_START.*?EQUATION_DEPTH_0_END", sentence.text)
        )
        for match in reversed(equation_matches):
            legacy_definition_input.edit(match.start(), match.end(), "SYMBOL")

        def is_symbol_in_sentence(symbol: Symbol) -> bool:
            return symbol.start >= sentence.start and symbol.end <= sentence.end

        symbols_in_sentence = filter(is_symbol_in_sentence, symbols)
        top_level_symbols = filter(lambda s: s.parent is None, symbols_in_sentence)
        top_level_symbols_reversed = sorted(
            top_level_symbols, key=lambda s: s.start, reverse=True
        )

        # To create a version of the sentence with symbols marked, add triple parentheses and a flag
        # indicating that a symbol has been found.
        for symbol in top_level_symbols_reversed:
            relative_symbol_start = symbol.start - sentence.start
            relative_symbol_end = symbol.end - sentence.start
            sanitized_start, sanitized_end = sentence.sanitized_journal.current_offsets(
                relative_symbol_start, relative_symbol_end
            )
            if sanitized_start and sanitized_end:
                with_symbols_marked = with_symbols_marked.edit(
                    sanitized_end, sanitized_end, "))) "
                )
                with_symbols_marked = with_symbols_marked.edit(
                    sanitized_start, sanitized_start, " (((SYMBOL:",
                )

        yield EmbellishedSentence(
            id_=sentence.id_,
            tex_path=sentence.tex_path,
            start=sentence.start,
            end=sentence.end,
            tex=sentence.tex,
            context_tex=sentence.context_tex,
            text=sentence.text,
            text_journal=sentence.text_journal,
            sanitized=sentence.sanitized,
            sanitized_journal=sentence.sanitized_journal,
            validity_guess=sentence.validity_guess,
            is_clean=sentence.is_clean,
            section_name=sentence.section_name,
            in_figure=sentence.in_figure,
            in_table=sentence.in_table,
            in_itemize=sentence.in_itemize,
            label=sentence.label,
            ref=sentence.ref,
            cite=sentence.cite,
            url=sentence.url,
            others=sentence.others,
            with_symbols_marked=str(with_symbols_marked),
            with_symbols_marked_journal=with_symbols_marked,
            legacy_definition_input=str(legacy_definition_input),
            legacy_definition_input_journal=legacy_definition_input,
        )

    def save(self, item: Task, result: EmbellishedSentence) -> None:

        output_dir = directories.arxiv_subdir("embellished-sentences", item.arxiv_id)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        sentence_data_path = os.path.join(output_dir, "sentences.csv")
        file_utils.append_to_csv(sentence_data_path, result)

        # Write clean sentences to file in a format that is ready for human annotation.
        sentence_list_path = os.path.join(output_dir, "sentences_for_annotation.txt")
        with open(sentence_list_path, mode="a", encoding="utf-8") as sentence_list_file:
            if result.is_clean:
                sentence_list_file.write(result.with_symbols_marked + "\n")


def count_top_level_symbols(symbols: List[Symbol]) -> int:
    " Count the number of top-level symbols in a list of symbols for a single equation."

    count = 0
    for symbol in symbols:
        # A symbol is a top-level symbol if it is not a child of any other symbol.
        is_child = False
        for other_symbol in symbols:
            try:
                other_symbol.children.index(symbol)
                is_child = True
            except ValueError:  # 'symbol' is not a child of 'other_symbol'
                continue

        if not is_child:
            count += 1

    return count


def replace(s: str, start: int, end: int, replacement: str) -> str:
    " Replace characters 'start' to 'end' in 's' with 'replacement'. "
    return s[:start] + replacement + s[end:]
