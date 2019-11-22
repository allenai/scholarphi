import csv
import logging
import os.path
import shutil
from typing import Dict, Iterator, List, NamedTuple

from explanations import directories
from explanations.colorize_tex import colorize_equation_tokens, insert_color_in_tex
from explanations.compile import compile_tex
from explanations.directories import (
    escape_slashes,
    get_arxiv_ids,
    get_data_subdirectory_for_arxiv_id,
    get_data_subdirectory_for_iteration,
)
from explanations.file_utils import (
    clean_directory,
    load_tokens,
    read_file_tolerant,
    save_compilation_results,
)
from explanations.types import (
    ArxivId,
    CompilationResult,
    Path,
    RelativePath,
    TokenWithOrigin,
)
from explanations.unpack import unpack
from scripts.command import Command


class TexAndTokens(NamedTuple):
    arxiv_id: ArxivId
    tex_contents: Dict[Path, str]
    tokens: List[TokenWithOrigin]


class Compilation(NamedTuple):
    source_path: RelativePath
    token: TokenWithOrigin
    result: CompilationResult


class DebugColorizeEquationTokens(Command[TexAndTokens, Compilation]):
    @staticmethod
    def get_name() -> str:
        return "debug-colorize-equation-tokens"

    @staticmethod
    def get_description() -> str:
        return "Attempt to colorize tokens individually and save a list of errors."

    def _get_output_root(self, arxiv_id: ArxivId) -> RelativePath:
        return get_data_subdirectory_for_arxiv_id(
            directories.ERRORS_FROM_COLORIZING_EQUATION_TOKENS_DIR, arxiv_id
        )

    def load(self) -> Iterator[TexAndTokens]:
        for arxiv_id in get_arxiv_ids(directories.SOURCES_DIR):

            # Make sure that we have evidence that the paper can compile at all before attempting
            # to compile many variants of that file.
            past_compilation_dir = directories.compilation_results(arxiv_id)
            if not os.path.exists(past_compilation_dir):
                logging.info(
                    "Skipping paper %s. No existing compilation results.", arxiv_id
                )
                continue
            compilation_result_path = os.path.join(
                past_compilation_dir, "compilation_results", "result"
            )
            with open(compilation_result_path) as compilation_result_file:
                success = compilation_result_file.read()
                if success != "True":
                    logging.info(
                        "Skipping paper %s: Normal compilation already fails.", arxiv_id
                    )
                    continue

            output_root = self._get_output_root(arxiv_id)
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
                contents = read_file_tolerant(absolute_tex_path)
                if contents is not None:
                    contents_by_file[tex_path] = contents

            yield TexAndTokens(arxiv_id, contents_by_file, tokens)

    def process(self, item: TexAndTokens) -> Iterator[Compilation]:

        for token in item.tokens:
            # Colorize the single token in the sources.
            colorization_result = next(
                colorize_equation_tokens(item.tex_contents, [token])
            )

            iteration_id = (
                f"file-{escape_slashes(token.tex_path)}-"
                + f"equation-{token.equation_index}-"
                + f"token-{token.token_index}"
            )
            output_sources_path = get_data_subdirectory_for_iteration(
                directories.ERRORS_FROM_COLORIZING_EQUATION_TOKENS_DIR,
                item.arxiv_id,
                iteration_id,
            )

            # Write the colorized files into a new directory.
            unpack_path = unpack(item.arxiv_id, output_sources_path)
            sources_unpacked = unpack_path is not None
            if unpack_path is None:
                logging.warning("Could not unpack sources into %s", output_sources_path)

            if sources_unpacked:
                for (
                    tex_path,
                    colorized_tex,
                ) in colorization_result.colorized_files.items():
                    full_tex_path = os.path.join(output_sources_path, tex_path)
                    with open(full_tex_path, "w") as tex_file:
                        tex_file.write(colorized_tex)

                # Compile the colorized files
                compilation_result = compile_tex(output_sources_path)
                yield Compilation(output_sources_path, token, compilation_result)

    def save(self, item: TexAndTokens, result: Compilation) -> None:

        if result.result.success:
            logging.debug(
                "Successfully compiled colorized TeX for arXiv ID %s, equation %s, token %i (%s).",
                item.arxiv_id,
                result.token.equation,
                result.token.token_index,
                result.token.text,
            )
            # To avoid bloating the file system, remove successfully compiled project copies.
            shutil.rmtree(result.source_path)
        else:
            logging.warning(
                "Could not compile colorized TeX for arXiv ID %s, equation %s, token %i (%s).",
                item.arxiv_id,
                result.token.equation,
                result.token.token_index,
                result.token.text,
            )
            logging.debug(  # pylint: disable=logging-not-lazy
                "The directory and compilation results for this colorization attempt "
                + "will be saved for inspection."
            )
            save_compilation_results(result.source_path, result.result)

        self._save_compilation_result(
            item.arxiv_id, result.token, result.source_path, result.result.success
        )

    def _save_compilation_result(
        self,
        arxiv_id: ArxivId,
        token: TokenWithOrigin,
        source_path: RelativePath,
        success: bool,
    ) -> None:

        output_root = self._get_output_root(arxiv_id)
        errors_path = os.path.join(output_root, "compilation_results.csv")

        colorize_simulation = insert_color_in_tex(
            token.equation, 0, token.start, token.end
        )
        with open(errors_path, "a") as errors_file:
            writer = csv.writer(errors_file)
            writer.writerow(
                [
                    "SUCCESS" if success else "FAILURE",
                    source_path,
                    token.tex_path,
                    token.equation_index,
                    token.equation,
                    token.token_index,
                    token.start,
                    token.end,
                    token.text,
                    colorize_simulation,
                ]
            )
