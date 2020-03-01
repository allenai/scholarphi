import logging
import os.path
from argparse import ArgumentParser
from typing import Dict, Iterator, List, NamedTuple

from common import directories, file_utils
from common.colorize_tex import TokenColorizationBatch, colorize_equation_tokens
from common.commands.base import ArxivBatchCommand, add_one_entity_at_a_time_arg
from common.types import (
    ArxivId,
    EquationTokenColorizationRecord,
    FileContents,
    Path,
    TokenWithOrigin,
)
from common.unpack import unpack


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

    def get_arxiv_ids_dirkey(self) -> str:
        return "sources"

    def load(self) -> Iterator[TexAndTokens]:
        for arxiv_id in self.arxiv_ids:

            output_root = directories.arxiv_subdir(
                "sources-with-colorized-equation-tokens", arxiv_id
            )
            file_utils.clean_directory(output_root)

            tokens_path = os.path.join(
                directories.arxiv_subdir("symbols", arxiv_id), "tokens.csv"
            )
            if not os.path.exists(tokens_path):
                logging.info(
                    "No equation token data found for paper %s. Skipping.", arxiv_id
                )
                continue

            # Load token location information
            tokens = file_utils.load_tokens(arxiv_id)
            if tokens is None:
                continue
            tex_paths = set({token.tex_path for token in tokens})

            # Load original sources for TeX files that need to be colorized
            contents_by_file = {}
            for tex_path in tex_paths:
                absolute_tex_path = os.path.join(
                    directories.arxiv_subdir("sources", arxiv_id), tex_path
                )
                file_contents = file_utils.read_file_tolerant(absolute_tex_path)
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
        output_sources_path = directories.iteration(
            "sources-with-colorized-equation-tokens", item.arxiv_id, iteration_id,
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

            hues_path = os.path.join(output_sources_path, "entity_hues.csv")
            for colorized_token in result.result.colorized_tokens:
                file_utils.append_to_csv(
                    hues_path,
                    EquationTokenColorizationRecord(
                        entity_id=(
                            str(colorized_token.equation_index)
                            + "-"
                            + str(colorized_token.token_index)
                        ),
                        hue=colorized_token.hue,
                        tex_path=colorized_token.tex_path,
                        iteration=str(iteration),
                        equation_index=colorized_token.equation_index,
                        token_index=colorized_token.token_index,
                        start=colorized_token.start,
                        end=colorized_token.end,
                        text=colorized_token.text,
                    ),
                )
