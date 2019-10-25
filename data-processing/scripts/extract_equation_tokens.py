import csv
import json
import logging
import os.path
import subprocess
from typing import Iterator, List, NamedTuple, Optional

from explanations import directories
from explanations.directories import EQUATIONS_DIR, NODE_DIRECTORY, get_arxiv_ids
from explanations.file_utils import clean_directory
from explanations.types import ArxivId, Equation, Token
from scripts.command import Command


class EquationWithPath(NamedTuple):
    arxiv_id: ArxivId
    path: str
    equation: Equation


EquationsWithPath = List[EquationWithPath]


class ParseResult(NamedTuple):
    success: bool
    i: int
    path: str
    equation: str
    tokens: Optional[List[Token]]
    errorMessage: str


def _get_parse_results(stdout: str) -> Iterator[ParseResult]:
    for line in stdout.split("\n"):
        if not line.isspace() and not line == "":
            data = json.loads(line)
            tokens: Optional[List[Token]] = None
            if data["tokens"] is not None:
                tokens = [
                    Token(text=token["text"], start=token["start"], end=token["end"])
                    for token in data["tokens"]
                ]
            yield ParseResult(
                success=data["success"],
                i=data["i"],
                path=data["path"],
                equation=data["equation"],
                tokens=tokens,
                errorMessage=data["errorMessage"],
            )


class ExtractEquationTokens(Command[ArxivId, ParseResult]):
    @staticmethod
    def get_name() -> str:
        return "extract-equation-tokens"

    @staticmethod
    def get_description() -> str:
        return "Extract tokens and positions from TeX equations."

    def load(self) -> Iterator[ArxivId]:
        for arxiv_id in get_arxiv_ids(EQUATIONS_DIR):
            clean_directory(directories.equation_tokens(arxiv_id))
            yield arxiv_id

    def process(self, item: ArxivId) -> Iterator[ParseResult]:
        equations_abs_path = os.path.abspath(
            os.path.join(directories.equations(item), "equations.csv")
        )
        node_directory_abs_path = os.path.abspath(NODE_DIRECTORY)
        equations_relative_path = os.path.relpath(
            equations_abs_path, node_directory_abs_path
        )
        result = subprocess.run(
            [
                "npm",
                # "--silent" flag suppressed boilerplate 'npm' output we don't care about.
                "--silent",
                "start",
                "equations-csv",
                equations_relative_path,
            ],
            cwd=NODE_DIRECTORY,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            encoding="utf-8",
        )

        if result.returncode == 0:
            for parse_result in _get_parse_results(result.stdout):
                yield parse_result
        else:
            logging.error(
                "Equation parsing for %s unexpectedly failed.\nStdout: %s\nStderr: %s\n",
                item,
                result.stdout,
                result.stderr,
            )

    def save(self, item: ArxivId, result: ParseResult) -> None:
        tokens_dir = directories.equation_tokens(item)
        if not os.path.exists(tokens_dir):
            os.makedirs(tokens_dir)

        if result.success:
            logging.debug(
                "Successfully extracted tokens. Tokens: %s", str(result.tokens)
            )
        else:
            logging.warning(
                "Could not parse equation %s. See logs in %s.",
                result.equation,
                tokens_dir,
            )

        with open(os.path.join(tokens_dir, "parse_results.json"), "a") as results_file:
            writer = csv.writer(results_file, quoting=csv.QUOTE_ALL)
            writer.writerow(
                [
                    result.path,
                    result.i,
                    result.equation,
                    result.success,
                    result.errorMessage,
                ]
            )

        if result.tokens is not None and len(result.tokens) > 0:
            with open(os.path.join(tokens_dir, "tokens.csv"), "a") as tokens_file:
                writer = csv.writer(tokens_file, quoting=csv.QUOTE_ALL)
                for token in result.tokens:
                    writer.writerow(
                        [
                            result.path,
                            result.i,
                            result.equation,
                            token.start,
                            token.end,
                            token.text,
                        ]
                    )
