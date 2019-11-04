import csv
import logging
import os.path
from typing import Dict, Iterator, List, NamedTuple

from explanations import directories
from explanations.colorize_tex import colorize_equation_tokens
from explanations.directories import (
    SOURCES_DIR,
    SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR,
    get_arxiv_ids,
)
from explanations.file_utils import read_file_tolerant
from explanations.parse_tex import TexSoupParseError
from explanations.types import (
    ColorizedTokensByEquation,
    Equation,
    EquationIndex,
    FileContents,
    Token,
    TokenEquationPair,
)
from explanations.unpack import unpack
from scripts.command import Command


class TexAndTokens(NamedTuple):
    file: FileContents
    tokens: List[TokenEquationPair]


class TexWithColorizedTokens(NamedTuple):
    tex: str
    colorized_tokens_by_equation: ColorizedTokensByEquation


class ColorizeEquationTokens(Command[TexAndTokens, TexWithColorizedTokens]):
    @staticmethod
    def get_name() -> str:
        return "colorize-equation-tokens"

    @staticmethod
    def get_description() -> str:
        return "Instrument TeX to colorize tokens in equations."

    def load(self) -> Iterator[TexAndTokens]:
        for arxiv_id in get_arxiv_ids(SOURCES_DIR):
            tokens_path = os.path.join(
                directories.equation_tokens(arxiv_id), "tokens.csv"
            )
            if not os.path.exists(tokens_path):
                logging.info(
                    "No equation token data found for paper %s. Skipping.", arxiv_id
                )
                continue

            # Unpack the sources into a new directory.
            unpack_path = unpack(arxiv_id, SOURCES_WITH_COLORIZED_EQUATION_TOKENS_DIR)
            if unpack_path is None:
                continue

            tokens_by_path: Dict[str, List[TokenEquationPair]] = {}
            with open(tokens_path) as tokens_file:
                reader = csv.reader(tokens_file)
                for row in reader:
                    relative_tex_path = row[0]
                    token_equation_pair = TokenEquationPair(
                        token=Token(start=int(row[3]), end=int(row[4]), text=row[5]),
                        equation=Equation(i=int(row[1]), tex=row[2]),
                    )
                    if not relative_tex_path in tokens_by_path:
                        tokens_by_path[relative_tex_path] = []
                    tokens_by_path[relative_tex_path].append(token_equation_pair)

            for relative_tex_path in tokens_by_path:
                tokens = tokens_by_path[relative_tex_path]
                tex_path = os.path.join(unpack_path, relative_tex_path)
                contents = read_file_tolerant(tex_path)
                if contents is not None:
                    yield TexAndTokens(
                        FileContents(arxiv_id, relative_tex_path, contents), tokens
                    )

    def process(self, item: TexAndTokens) -> Iterator[TexWithColorizedTokens]:
        tokens_by_equation: Dict[EquationIndex, List[Token]] = {}
        for token_equation in item.tokens:
            if not token_equation.equation.i in tokens_by_equation:
                tokens_by_equation[token_equation.equation.i] = []
            tokens_by_equation[token_equation.equation.i].append(token_equation.token)

        try:
            colorized_tex, colorized_tokens_by_equation = colorize_equation_tokens(
                item.file.contents, tokens_by_equation
            )
            yield TexWithColorizedTokens(colorized_tex, colorized_tokens_by_equation)
        except TexSoupParseError as e:
            logging.error(
                "Failed to parse TeX file %s for arXiv ID %s: %s",
                item.file.path,
                item.file.arxiv_id,
                e,
            )

    def save(self, item: TexAndTokens, result: TexWithColorizedTokens) -> None:
        colorized_tex = result.tex
        colorized_tokens = result.colorized_tokens_by_equation

        tex_path = os.path.join(
            directories.sources_with_colorized_equation_tokens(item.file.arxiv_id),
            item.file.path,
        )
        with open(tex_path, "w") as tex_file:
            tex_file.write(colorized_tex)

        hues_path = os.path.join(
            directories.sources_with_colorized_equation_tokens(item.file.arxiv_id),
            "token_hues.csv",
        )
        with open(hues_path, "a") as hues_file:
            writer = csv.writer(hues_file, quoting=csv.QUOTE_ALL)
            for equation_index, tokens_by_hue in colorized_tokens.items():
                for hue, token in tokens_by_hue.items():
                    writer.writerow(
                        [
                            item.file.path,
                            equation_index,
                            hue,
                            token.start,
                            token.end,
                            token.text,
                        ]
                    )
