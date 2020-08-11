from collections import defaultdict
from dataclasses import dataclass
import logging
import os.path
import re
from typing import Dict, Iterator, List, Tuple

from common.commands.base import ArxivBatchCommand
from common import directories, file_utils
from common.types import ArxivId, CharacterRange, Equation, Symbol
from entities.sentences.types import Sentence

from ..types import EmbellishedSentence


TexPath = str
EquationIndex = int
Equations = Dict[Tuple[TexPath, EquationIndex], Equation]
Symbols = Dict[Tuple[TexPath, EquationIndex], List[Symbol]]


@dataclass(frozen=True)
class Task:
    arxiv_id: ArxivId
    sentence: Sentence
    equations: Equations
    symbols: Symbols


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

            # Load equation data.
            equations: Equations = {}
            equations_path = os.path.join(
                directories.arxiv_subdir("detected-equations", arxiv_id), "entities.csv"
            )
            try:
                equation_data = file_utils.load_from_csv(equations_path, Equation)
                for equation in equation_data:
                    equations[(equation.tex_path, int(equation.id_))] = equation
            except FileNotFoundError:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "No equation data found for arXiv ID %s. It will not be "
                    + "possible to expand equations in sentences with symbol data. This should only "
                    + "be a problem if it's expected that there are no symbols in paper %s.",
                    arxiv_id,
                )

            # Load symbols, for use in embellishing equations.
            symbols: Symbols = defaultdict(list)
            symbol_data = file_utils.load_symbols(arxiv_id)
            if symbol_data is not None:
                for id_, symbol in symbol_data:
                    symbols[(id_.tex_path, id_.equation_index)].append(symbol)
            else:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "No symbol data found for arXiv ID %s. It will not be "
                    + "possible to expand equations in sentences with symbol data. This should only "
                    + "be a problem if it's expected that there are no symbols in paper %s.",
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
                yield Task(arxiv_id, sentence, equations, symbols)

    def process(self, item: Task) -> Iterator[EmbellishedSentence]:
        sentence = item.sentence
        equations = item.equations
        symbols = item.symbols

        pattern = r"\[\[equation-(\d+)\]\]"
        regex = re.compile(pattern)

        equation_spans: Dict[int, CharacterRange] = {}
        equation_indexes_reversed: List[int] = []
        start = 0
        while True:
            match = regex.search(sentence.sanitized_text, start)
            if match is None:
                break
            start = match.end()
            equation_index = int(match.group(1))
            equation_indexes_reversed.insert(0, equation_index)
            equation_spans[equation_index] = CharacterRange(
                start=match.start(), end=match.end()
            )

        # Replace equations with more helpful representations.
        # Replace equations in reverse so that earlier replacements don't affect the character
        # offsets for the later replacements.
        with_symbol_and_formula_tags = sentence.sanitized_text
        with_equation_tex = sentence.sanitized_text
        with_symbol_tex = sentence.sanitized_text
        with_bag_of_symbols = sentence.sanitized_text
        legacy_definition_input = sentence.sanitized_text

        for ei in equation_indexes_reversed:

            equation = equations[(sentence.tex_path, ei)]
            equation_symbols = symbols[(equation.tex_path, ei)]
            span = equation_spans[ei]

            # Replace equation with its TeX
            with_equation_tex = replace(
                with_equation_tex,
                span.start,
                span.end,
                f"[[FORMULA:{equation.content_tex}]]",
            )

            # Replace equations with tags indicating whether each equation is
            # a symbol or a formula, and additionally with values for the symbols.
            is_symbol = count_top_level_symbols(equation_symbols) == 1
            if is_symbol:
                with_symbol_and_formula_tags = replace(
                    with_symbol_and_formula_tags, span.start, span.end, "[[SYMBOL]]"
                )
                with_symbol_tex = replace(
                    with_symbol_tex,
                    span.start,
                    span.end,
                    f"[[SYMBOL({equation.tex.strip()})]]",
                )
            else:
                with_symbol_and_formula_tags = replace(
                    with_symbol_and_formula_tags, span.start, span.end, "[[FORMULA]]"
                )
                with_symbol_tex = replace(
                    with_symbol_tex, span.start, span.end, f"[[FORMULA]]"
                )

            # Replace each equation with a bag of the symbols that it contains.
            bag_of_symbols = {s.tex.strip() for s in equation_symbols}
            with_bag_of_symbols = replace(
                with_bag_of_symbols,
                span.start,
                span.end,
                f"[[FORMULA:{bag_of_symbols}]]",
            )

            # Replace each equation with 'SYMBOL'.
            legacy_definition_input = replace(legacy_definition_input, span.start, span.end, "SYMBOL")

        yield EmbellishedSentence(
            id_=sentence.id_,
            tex_path=sentence.tex_path,
            start=sentence.start,
            end=sentence.end,
            tex=sentence.tex,
            context_tex=sentence.context_tex,
            text=sentence.text,
            sanitized_text=sentence.sanitized_text,
            section_name=sentence.section_name,
            in_figure=sentence.in_figure,
            in_table=sentence.in_table,
            in_itemize=sentence.in_itemize,
            label=sentence.label,
            ref=sentence.ref,
            cite=sentence.cite,
            url=sentence.url,
            others=sentence.others,
            with_symbol_and_formula_tags=with_symbol_and_formula_tags,
            with_equation_tex=with_equation_tex,
            with_symbol_tex=with_symbol_tex,
            with_bag_of_symbols=with_bag_of_symbols,
            legacy_definition_input=legacy_definition_input
        )

    def save(self, item: Task, result: EmbellishedSentence) -> None:

        output_dir = directories.arxiv_subdir("embellished-sentences", item.arxiv_id)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        output_path = os.path.join(output_dir, "sentences.csv")
        file_utils.append_to_csv(output_path, result)


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
