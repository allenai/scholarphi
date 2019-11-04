import csv
import logging
import os.path
from typing import Dict, Iterator, List, NamedTuple

from explanations import directories
from explanations.colorize_tex import (
    TokenColorizationBatch,
    TokenWithOrigin,
    colorize_equation_tokens,
)
from explanations.directories import (
    get_arxiv_ids,
    get_data_subdirectory_for_arxiv_id,
    get_data_subdirectory_for_iteration,
)
from explanations.file_utils import clean_directory, read_file_tolerant
from explanations.parse_tex import TexSoupParseError
from explanations.types import ArxivId, Path
from explanations.unpack import unpack
from scripts.command import Command


class TexAndTokens(NamedTuple):
    arxiv_id: ArxivId
    tex_contents: Dict[Path, str]
    tokens: List[TokenWithOrigin]


class ColorizationResult(NamedTuple):
    iteration: int
    result: TokenColorizationBatch


class ColorizeEquationTokens(Command[TexAndTokens, ColorizationResult]):
    @staticmethod
    def get_name() -> str:
        return "colorize-equation-tokens"

    @staticmethod
    def get_description() -> str:
        return "Instrument TeX to colorize tokens in equations."

    def load(self) -> Iterator[TexAndTokens]:
        for arxiv_id in get_arxiv_ids(directories.SOURCES_DIR):

            output_root = get_data_subdirectory_for_arxiv_id(
                directories.SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR, arxiv_id
            )
            clean_directory(output_root)

            tokens_path = os.path.join(
                directories.equation_tokens(arxiv_id), "tokens.csv"
            )
            if not os.path.exists(tokens_path):
                logging.info(
                    "No equation token data found for paper %s. Skipping.", arxiv_id
                )
                continue

            # Load token location information
            tokens = []
            tex_paths = set()
            with open(tokens_path) as tokens_file:
                reader = csv.reader(tokens_file)
                for row in reader:
                    tex_path = row[0]
                    tokens.append(
                        TokenWithOrigin(
                            tex_path=tex_path,
                            equation_index=int(row[1]),
                            token_index=int(row[3]),
                            start=int(row[4]),
                            end=int(row[5]),
                            text=row[6],
                        )
                    )
                    tex_paths.add(tex_path)

            # Load original sources for TeX files that need to be colorized
            contents_by_file = {}
            for tex_path in tex_paths:
                absolute_tex_path = os.path.join(
                    directories.sources(arxiv_id), tex_path
                )
                contents = read_file_tolerant(absolute_tex_path)
                if contents is not None:
                    contents_by_file[tex_path] = contents

            yield TexAndTokens(arxiv_id, contents_by_file, tokens)

    def process(self, item: TexAndTokens) -> Iterator[ColorizationResult]:
        try:
            for i, result_batch in enumerate(
                colorize_equation_tokens(item.tex_contents, item.tokens)
            ):
                yield ColorizationResult(i, result_batch)
        except TexSoupParseError as e:
            logging.error(
                "Failed to parse a TeX file for arXiv ID %s: %s", item.arxiv_id, e
            )

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
                with open(full_tex_path, "w") as tex_file:
                    tex_file.write(colorized_tex)

            hues_path = os.path.join(output_sources_path, "token_hues.csv")
            with open(hues_path, "a") as hues_file:
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
