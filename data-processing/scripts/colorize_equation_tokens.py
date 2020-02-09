import csv
import logging
import os.path
from argparse import ArgumentParser
from typing import Dict, Iterator, List, NamedTuple

from explanations import directories
from explanations.colorize_tex import TokenColorizationBatch, colorize_equation_tokens
from explanations.directories import (
    get_data_subdirectory_for_arxiv_id,
    get_data_subdirectory_for_iteration,
)
from explanations.file_utils import clean_directory, load_tokens, read_file_tolerant
from explanations.types import ArxivId, FileContents, Path, TokenWithOrigin
from explanations.unpack import unpack
from scripts.command import ArxivBatchCommand, add_one_entity_at_a_time_arg


class TexAndTokens(NamedTuple):
    arxiv_id: ArxivId
    tex_contents: Dict[Path, FileContents]
    tokens: List[TokenWithOrigin]


class ColorizationResult(NamedTuple):
    iteration: int
    result: TokenColorizationBatch


class ColorizeEquationTokens(ArxivBatchCommand[TexAndTokens, ColorizationResult]):
    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        super(ColorizeEquationTokens, ColorizeEquationTokens).init_parser(parser)
        add_one_entity_at_a_time_arg(parser)

    @staticmethod
    def get_name() -> str:
        return "colorize-equation-tokens"

    @staticmethod
    def get_description() -> str:
        return "Instrument TeX to colorize tokens in equations."

    @staticmethod
    def get_entity_type() -> str:
        return "symbols"

    def get_arxiv_ids_dir(self) -> Path:
        return directories.SOURCES_DIR

    def load(self) -> Iterator[TexAndTokens]:
        for arxiv_id in self.arxiv_ids:

            output_root = get_data_subdirectory_for_arxiv_id(
                directories.SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR, arxiv_id
            )
            clean_directory(output_root)

            tokens_path = os.path.join(directories.symbols(arxiv_id), "tokens.csv")
            if not os.path.exists(tokens_path):
                logging.info(
                    "No equation token data found for paper %s. Skipping.", arxiv_id
                )
                continue

            # Load token location information
            tokens = load_tokens(arxiv_id)
            if tokens is None:
                continue
            tex_paths = set({token.tex_path for token in tokens})

            # Load original sources for TeX files that need to be colorized
            contents_by_file = {}
            for tex_path in tex_paths:
                absolute_tex_path = os.path.join(
                    directories.sources(arxiv_id), tex_path
                )
                file_contents = read_file_tolerant(absolute_tex_path)
                if file_contents is not None:
                    contents_by_file[tex_path] = file_contents

            yield TexAndTokens(arxiv_id, contents_by_file, tokens)

    def process(self, item: TexAndTokens) -> Iterator[ColorizationResult]:

        token_batches: List[List[TokenWithOrigin]] = [item.tokens]
        if self.args.one_entity_at_a_time:
            token_batches = [[token] for token in item.tokens]

        i = 0
        for tokens in token_batches:
            for result_batch in colorize_equation_tokens(item.tex_contents, tokens):
                yield ColorizationResult(i, result_batch)
                i += 1

    def save(self, item: TexAndTokens, result: ColorizationResult) -> None:
        iteration = result.iteration
        iteration_id = f"all-files-{iteration}"
        output_sources_path = get_data_subdirectory_for_iteration(
            directories.SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR,
            item.arxiv_id,
            iteration_id,
        )
        logging.debug("Outputting to %s", output_sources_path)

        # Create new directory for each colorization iteration.
        unpack_path = unpack(item.arxiv_id, output_sources_path)
        sources_unpacked = unpack_path is not None
        if unpack_path is None:
            logging.warning("Could not unpack sources into %s", output_sources_path)

        if sources_unpacked:
            for tex_path, colorized_tex in result.result.colorized_files.items():
                full_tex_path = os.path.join(output_sources_path, tex_path)
                with open(
                    full_tex_path, "w", encoding=colorized_tex.encoding
                ) as tex_file:
                    tex_file.write(colorized_tex.contents)

            hues_path = os.path.join(output_sources_path, "token_hues.csv")
            with open(hues_path, "a", encoding="utf-8") as hues_file:
                writer = csv.writer(hues_file, quoting=csv.QUOTE_ALL)
                for colorized_token in result.result.colorized_tokens:
                    writer.writerow(
                        [
                            colorized_token.tex_path,
                            colorized_token.equation_index,
                            colorized_token.token_index,
                            colorized_token.hue,
                            colorized_token.start,
                            colorized_token.end,
                            colorized_token.text,
                        ]
                    )
