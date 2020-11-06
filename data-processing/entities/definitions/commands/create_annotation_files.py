import logging
import os.path
from dataclasses import dataclass
from typing import Iterator, List, Optional

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId

from ..types import AnnotationToken, Token


@dataclass(frozen=True)
class PaperTokens:
    arxiv_id: ArxivId
    tokens: List[Token]


class CreateAnnotationFiles(ArxivBatchCommand[PaperTokens, None]):
    @staticmethod
    def get_name() -> str:
        return "create-annotation-files"

    @staticmethod
    def get_description() -> str:
        return (
            "Generate files for annotation with an annotation tool (e.g., 'brat') from tokens "
            + "extracted from TeX files. For each paper, three files are generated: (1) A cleaned "
            + "up text meant to be annotated; (2) an updated list of tokens containing position "
            + "information about where each one appears in the cleaned text; (3) an annotation "
            + "file for 'brat' containing a list of automatically generated initial annotations."
        )

    def get_arxiv_ids_dirkey(self) -> str:
        return "sentence-tokens"

    def load(self) -> Iterator[PaperTokens]:
        for arxiv_id in self.arxiv_ids:

            output_dir = directories.arxiv_subdir("annotation-files", arxiv_id)
            file_utils.clean_directory(output_dir)

            # Load tokens.
            tokens_path = os.path.join(
                directories.arxiv_subdir("sentence-tokens", arxiv_id), "tokens.csv",
            )
            try:
                tokens = list(file_utils.load_from_csv(tokens_path, Token))
            except FileNotFoundError:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "No tokens data found for arXiv paper %s. No annotation files will be "
                    + "generated for this paper.",
                    arxiv_id,
                )
                continue

            yield PaperTokens(arxiv_id, tokens)

    def process(self, _: PaperTokens) -> Iterator[None]:
        yield None

    def _create_annotation_token(
        self,
        token: Token,
        start: Optional[int],
        end: Optional[int],
        start_in_sentence: Optional[int],
        end_in_sentence: Optional[int],
    ) -> AnnotationToken:
        return AnnotationToken(
            text=token.text,
            text_for_annotation=token.text_for_annotation,
            tex=token.tex,
            tex_start=token.tex_start,
            tex_end=token.tex_end,
            sentence_id=token.sentence_id,
            sentence_transformations=token.sentence_transformations,
            start_in_text=start,
            end_in_text=end,
            start_in_sentence=start_in_sentence,
            end_in_sentence=end_in_sentence,
        )

    def save(self, item: PaperTokens, _: None) -> None:

        output_dir = directories.arxiv_subdir("annotation-files", item.arxiv_id)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Write tokens simultaneously to a file listing each token, and a file including
        # the transformed, cleaned text ready for human annotation.
        token_list_path = os.path.join(output_dir, "tokens.csv")
        sentence_list_path = os.path.join(output_dir, "sentences_for_annotation.txt")
        annotation_file_path = os.path.join(output_dir, "initial_annotations.ann")

        offset_in_file = 0
        offset_in_sentence = 0
        is_symbol = False
        brat_annotation_index = 1

        with open(
            sentence_list_path, mode="w", encoding="utf-8"
        ) as sentence_file, open(
            annotation_file_path, mode="w", encoding="utf-8"
        ) as ann_file:
            last_sentence_id = None

            for token in item.tokens:

                # Keep track of whether an upcoming token is a symbol. If it is, a tentative
                # annotation can be saved to a brat annotation file.
                if not is_symbol and token.text == "SYMBOL_START":
                    is_symbol = True
                elif is_symbol and token.text == "SYMBOL_END":
                    is_symbol = False

                # Skip tokens that lack a clean readable representation.
                if token.text_for_annotation is None:
                    annotation_token = self._create_annotation_token(
                        token,
                        start=None,
                        end=None,
                        start_in_sentence=None,
                        end_in_sentence=None,
                    )
                    file_utils.append_to_csv(token_list_path, annotation_token)
                    continue

                # Break lines between sentences.
                if (
                    token.sentence_id != last_sentence_id
                    and last_sentence_id is not None
                ):
                    sentence_file.write("\n")
                    offset_in_file += 1
                    offset_in_sentence = 0

                # Insert spaces between tokens.
                if token.sentence_id == last_sentence_id:
                    sentence_file.write(" ")
                    offset_in_file += 1
                    offset_in_sentence += 1

                start = offset_in_file
                start_in_sentence = offset_in_sentence

                # Write token to the text meant for annotation.
                sentence_file.write(token.text_for_annotation)
                offset_in_file += len(token.text_for_annotation)
                offset_in_sentence += len(token.text_for_annotation)

                end = offset_in_file
                end_in_sentence = offset_in_sentence
                last_sentence_id = token.sentence_id

                # Save a record of this token and its positions in the TeX and annotation file.
                annotation_token = self._create_annotation_token(
                    token,
                    start=start,
                    end=end,
                    start_in_sentence=start_in_sentence,
                    end_in_sentence=end_in_sentence,
                )
                file_utils.append_to_csv(token_list_path, annotation_token)

                # Save an annotation for each symbol. Annotations are stored to a '.ann' file in
                # brat standoff format. See more details about the format here:
                # https://brat.nlplab.org/standoff.html
                if is_symbol:
                    ann_file.write(
                        f"T{brat_annotation_index}\t"
                        + f"Symbol {start} {end}\t"
                        + f"{token.text_for_annotation}\n"
                    )
                    brat_annotation_index += 1
