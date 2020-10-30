import logging
import os.path
import re
from collections import defaultdict
from dataclasses import dataclass
from typing import Any, Dict, Iterator, List

import spacy
from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId, Symbol
from entities.sentences.types import Sentence

from ..types import EmbellishedSentence, OutputToken, Token

TexPath = str
EquationIndex = int


@dataclass(frozen=True)
class Task:
    arxiv_id: ArxivId
    sentence: Sentence
    symbols: List[Symbol]


@dataclass(frozen=True)
class TokenizedSentence:
    embellished_sentence: EmbellishedSentence
    tokens: List[Token]


class TokenizeSentences(ArxivBatchCommand[Task, TokenizedSentence]):
    def __init__(self, args: Any) -> None:
        super().__init__(args)

        # Load Spacy English language model for tokenizing sentences.
        # Note that the model and tokenizer should be initialized in a way it is initialized in the
        # DefinitionDetectionModel constructor.
        self.spacy_model = spacy.load("en_core_sci_md")

    @staticmethod
    def get_name() -> str:
        return "tokenize-sentences"

    @staticmethod
    def get_description() -> str:
        return (
            "Pre-process sentences for NLP annotation and model training. This command produces "
            + "three related outputs. First, a CSV of embellished sentences. Second, a list of "
            + "sentences that can be loaded into an annotation program like 'brat.' Third, a list "
            + "of tokens that can be provided to a model."
        )

    def get_arxiv_ids_dirkey(self) -> str:
        return "detected-sentences"

    def load(self) -> Iterator[Task]:
        for arxiv_id in self.arxiv_ids:

            output_dir = directories.arxiv_subdir("sentence-tokens", arxiv_id)
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

    def process(self, item: Task) -> Iterator[TokenizedSentence]:
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
            re.finditer(
                "EQUATION_DEPTH_0_START.*?EQUATION_DEPTH_0_END",
                sentence.text,
                flags=re.DOTALL,
            )
        )
        for match in reversed(equation_matches):
            legacy_definition_input = legacy_definition_input.edit(
                match.start(), match.end(), "SYMBOL"
            )

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
                    sanitized_end, sanitized_end, " SYMBOL_END "
                )
                with_symbols_marked = with_symbols_marked.edit(
                    sanitized_start, sanitized_start, " SYMBOL_START ",
                )

        embellished_sentence = EmbellishedSentence(
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

        # Make sure that symbols aren't split by the tokenizer (i.e., if a subscript includes
        # a curly brace, comma, period, etc.)
        spacy_doc = self.spacy_model(str(with_symbols_marked))
        with spacy_doc.retokenize() as retokenizer:
            symbol_start_token = None
            for t in spacy_doc:
                if t.text == "SYMBOL_END" and symbol_start_token is not None:
                    symbol_end_token = t.nbor(-1)
                    if symbol_end_token.i > symbol_start_token.i:
                        retokenizer.merge(
                            spacy_doc[symbol_start_token.i : symbol_end_token.i + 1]
                        )
                    symbol_start_token = None
                if t.text == "SYMBOL_START":
                    symbol_start_token = t.nbor()

        tokens = []
        for t in spacy_doc:
            start_in_transformed_sentence = t.idx
            end_in_transformed_sentence = start_in_transformed_sentence + len(t)
            offsets_in_tex_sentence = with_symbols_marked.initial_offsets(
                start_in_transformed_sentence, end_in_transformed_sentence
            )
            start_in_tex_sentence = offsets_in_tex_sentence[0]
            end_in_tex_sentence = offsets_in_tex_sentence[1]
            if start_in_tex_sentence is None or end_in_tex_sentence is None:
                continue
            tex = with_symbols_marked.initial[start_in_tex_sentence:end_in_tex_sentence]

            # Determine what text should be shown for the token in the file meant for human
            # annotation. This involves removing repetitive spaces and distracting markers for
            # special tokens that only the model will need to know about.
            text_for_annotation = t.text
            if t.text.startswith("EQUATION_DEPTH_") and t.text.endswith("_START"):
                text_for_annotation = "[["
            elif t.text.startswith("EQUATION_DEPTH_") and t.text.endswith("_END"):
                text_for_annotation = "]]"
            elif t.text in ["SYMBOL_START", "SYMBOL_END"]:
                text_for_annotation = None
            elif t.text.isspace():
                text_for_annotation = None

            tokens.append(
                Token(
                    text=t.text,
                    text_for_annotation=text_for_annotation,
                    tex=tex,
                    tex_start=sentence.start + start_in_tex_sentence,
                    tex_end=sentence.start + end_in_tex_sentence,
                    sentence_transformations="with_symbols_marked",
                )
            )

        yield TokenizedSentence(embellished_sentence, tokens)

    def save(self, item: Task, result: TokenizedSentence) -> None:

        # Only save embellished sentences if they are made from sentences that are 'clean,' i.e.,
        # that look like they contain natural language.
        if not item.sentence.is_clean:
            return

        output_dir = directories.arxiv_subdir("sentence-tokens", item.arxiv_id)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        sentence_data_path = os.path.join(output_dir, "sentences.csv")
        file_utils.append_to_csv(sentence_data_path, result.embellished_sentence)

        # Write tokens simultaneously to a file listing each token, and a file including
        # the transformed, cleaned text ready for human annotation.
        token_list_path = os.path.join(output_dir, "tokens.csv")
        sentence_list_path = os.path.join(output_dir, "sentences_for_annotation.txt")

        try:
            with open(sentence_list_path, encoding="utf-8") as sentence_file:
                offset_of_sentence = len(sentence_file.read())
        except FileNotFoundError:
            offset_of_sentence = 0

        offset_within_sentence = 0
        with open(sentence_list_path, mode="a", encoding="utf-8") as sentence_file:
            for token in result.tokens:
                output_token = OutputToken(
                    text=token.text,
                    text_for_annotation=token.text_for_annotation,
                    tex=token.tex,
                    tex_start=token.tex_start,
                    tex_end=token.tex_end,
                    sentence_transformations=token.sentence_transformations,
                    start_in_text=offset_of_sentence + offset_within_sentence,
                    end_in_text=(
                        offset_of_sentence + offset_within_sentence + len(token.text)
                    ),
                    start_in_sentence=offset_within_sentence,
                    end_in_sentence=offset_within_sentence + len(token.text),
                )

                # Write token to list of tokens.
                file_utils.append_to_csv(token_list_path, output_token)

                # Write token to text to be annotated (including spaces between each token).
                if token.text_for_annotation is not None:
                    if offset_within_sentence > 0:
                        sentence_file.write(" ")
                        offset_within_sentence += 1

                    sentence_file.write(token.text_for_annotation)
                    offset_within_sentence += len(token.text_for_annotation)

            sentence_file.write("\n")
