import csv
import json
import logging
import os.path
import shutil
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Iterator, List, Optional

from explanations import directories
from explanations.colorize_tex import (
    ColorizedEntity,
    colorize_citations,
    colorize_equation_tokens,
    colorize_equations,
)
from explanations.compile import compile_tex, get_errors, is_driver_unimplemented
from explanations.directories import (
    escape_slashes,
    get_data_subdirectory_for_arxiv_id,
    get_data_subdirectory_for_iteration,
)
from explanations.file_utils import (
    clean_directory,
    find_files,
    load_tokens,
    read_file_tolerant,
    save_compilation_results,
)
from explanations.types import (
    ArxivId,
    CompilationResult,
    FileContents,
    Path,
    RelativePath,
)
from explanations.unpack import unpack
from scripts.command import ArxivBatchCommand


@dataclass(frozen=True)
class ColorizationTask:
    arxiv_id: ArxivId
    tex_path: RelativePath
    file_contents: FileContents


@dataclass(frozen=True)
class ColorizationResult:
    file_contents: FileContents
    entity: ColorizedEntity


@dataclass(frozen=True)
class Compilation:
    project_path: RelativePath
    entity: ColorizedEntity
    result: CompilationResult


def write_file(
    sources_dir: Path, file_path: RelativePath, tex: str, encoding: str
) -> None:
    write_path = os.path.join(sources_dir, file_path)
    with open(write_path, "w", encoding=encoding) as file_:
        file_.write(tex)


class DebugColorizeCommand(ArxivBatchCommand[ColorizationTask, Compilation], ABC):
    def get_arxiv_ids_dir(self) -> Path:
        return directories.SOURCES_DIR

    @abstractmethod
    def get_output_base_dir(self) -> RelativePath:
        """
        Path to the data directory where debugging results for all papers should be output.
        """

    @abstractmethod
    def colorize(self, task: ColorizationTask) -> Iterator[ColorizationResult]:
        """
        Perform colorization.
        """

    def load(self) -> Iterator[ColorizationTask]:
        for arxiv_id in self.arxiv_ids:

            arxiv_id_output_root = get_data_subdirectory_for_arxiv_id(
                self.get_output_base_dir(), arxiv_id
            )
            clean_directory(arxiv_id_output_root)

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

            original_sources_path = directories.sources(arxiv_id)
            for tex_path in find_files(original_sources_path, [".tex"], relative=True):
                file_contents = read_file_tolerant(
                    os.path.join(original_sources_path, tex_path)
                )
                if file_contents is not None:
                    yield ColorizationTask(arxiv_id, tex_path, file_contents)

    def process(self, item: ColorizationTask) -> Iterator[Compilation]:

        colorization_results = self.colorize(item)
        for iteration, colorized in enumerate(colorization_results):
            iteration_id = f"file-{escape_slashes(item.tex_path)}-iteration-{iteration}"

            output_sources_path = get_data_subdirectory_for_iteration(
                self.get_output_base_dir(), item.arxiv_id, iteration_id,
            )

            # Write the colorized files into a new directory.
            unpack_path = unpack(item.arxiv_id, output_sources_path)
            if unpack_path is None:
                logging.warning(
                    "Could not unpack sources into %s. Skipping this arXiv ID",
                    output_sources_path,
                )
                return
            write_file(
                output_sources_path,
                item.tex_path,
                colorized.file_contents.contents,
                colorized.file_contents.encoding,
            )

            # Compile the colorized files
            compilation_result = compile_tex(output_sources_path)
            yield Compilation(output_sources_path, colorized.entity, compilation_result)

            # If we haven't written colorization commands to support the TeX driver, don't bother
            # trying to colorize any of the other entities in this paper.
            if is_driver_unimplemented(compilation_result.stdout):
                return

    def save(self, item: ColorizationTask, result: Compilation) -> None:

        arxiv_id = item.arxiv_id
        entity = result.entity

        entity_id_string = ",".join([str(i) for i in entity.identifier.values()])
        entity_string = entity.tex if len(entity.tex) < 20 else entity.tex[:20] + "..."

        if result.result.success:
            logging.debug(
                "Successfully compiled colorized TeX for arXiv ID %s, entity %s (%s).",
                arxiv_id,
                entity_id_string,
                entity_string,
            )
            # To avoid saving a separate TeX project on each compilation, remove successfully
            # compiled projects.
            shutil.rmtree(result.project_path)
        else:
            logging.warning(
                "Failed to compile colorized TeX for arXiv ID %s, entity %s (%s).",
                arxiv_id,
                entity_id_string,
                entity_string,
            )
            logging.debug(  # pylint: disable=logging-not-lazy
                "The directory and compilation results for this colorization attempt "
                + "will be saved for inspection."
            )
            save_compilation_results(result.project_path, result.result)

        stdout = result.result.stdout
        missing_driver = is_driver_unimplemented(stdout)
        errors = list(get_errors(stdout))

        self.update_compilation_log(
            arxiv_id,
            result.entity,
            entity.tex,
            entity.context_tex,
            result.project_path,
            item.tex_path,
            result.result.success,
            missing_driver,
            errors,
        )

    def update_compilation_log(
        self,
        arxiv_id: ArxivId,
        entity: ColorizedEntity,
        tex: str,
        context: str,
        source_path: RelativePath,
        tex_path: RelativePath,
        success: bool,
        missing_driver: bool,
        errors: List[bytes],
    ) -> None:

        arxiv_id_output_root = get_data_subdirectory_for_arxiv_id(
            self.get_output_base_dir(), arxiv_id
        )
        errors_path = os.path.join(arxiv_id_output_root, "compilation_results.csv")

        # Leave a stamp in the directory if the compilation failed due to DVI problems.
        if missing_driver:
            logging.warning(  # pylint: disable=logging-not-lazy
                "Could not compile arXiv ID %s because colorization commands are missing for the"
                + "driver needed to compile that TeX project.",
                arxiv_id,
            )
            dvi_failure_stamp_path = os.path.join(
                arxiv_id_output_root, "missing_driver"
            )
            with open(dvi_failure_stamp_path, "w") as stamp_file:
                stamp_file.write("")

        # Write the compilation result to the log.
        with open(errors_path, "a", encoding="utf-8") as errors_file:
            writer = csv.writer(errors_file)
            data: List[Any] = [
                "SUCCESS" if success else "FAILURE",
                source_path,
                tex_path,
            ]
            data.extend(entity.identifier.values())
            data.extend([tex, context])
            data.extend(entity.data.values())
            data.append(json.dumps([e.decode("utf-8") for e in errors]))
            writer.writerow(data)


class DebugColorizeCitations(DebugColorizeCommand):
    @staticmethod
    def get_name() -> str:
        return "debug-colorize-citations"

    @staticmethod
    def get_description() -> str:
        return "Collect compilation errors from colorizing each citation."

    def get_output_base_dir(self) -> RelativePath:
        return directories.DEBUGGING_COLORIZING_CITATIONS_DIR

    def colorize(self, task: ColorizationTask) -> Iterator[ColorizationResult]:
        file_contents = task.file_contents
        batches = colorize_citations(file_contents.contents, batch_size=1)
        for batch in batches:
            colorized_tex = batch.tex
            colorized_contents = FileContents(
                file_contents.path, colorized_tex, file_contents.encoding
            )
            yield ColorizationResult(colorized_contents, batch.entities[0])


class DebugColorizeEquations(DebugColorizeCommand):
    @staticmethod
    def get_name() -> str:
        return "debug-colorize-equations"

    @staticmethod
    def get_description() -> str:
        return "Collect compilation errors from colorizing each equation."

    def get_output_base_dir(self) -> RelativePath:
        return directories.DEBUGGING_COLORIZING_EQUATIONS_DIR

    def colorize(self, task: ColorizationTask) -> Iterator[ColorizationResult]:
        file_contents = task.file_contents
        batches = colorize_equations(file_contents.contents, batch_size=1)
        for batch in batches:
            colorized_tex = batch.tex
            colorized_contents = FileContents(
                file_contents.path, colorized_tex, file_contents.encoding
            )
            yield ColorizationResult(colorized_contents, batch.entities[0])


class DebugColorizeEquationTokens(DebugColorizeCommand):
    @staticmethod
    def get_name() -> str:
        return "debug-colorize-equation-tokens"

    @staticmethod
    def get_description() -> str:
        return "Attempt to colorize tokens individually and save a list of errors."

    def get_output_base_dir(self) -> RelativePath:
        return directories.DEBUGGING_COLORIZING_EQUATION_TOKENS_DIR

    def colorize(self, task: ColorizationTask) -> Iterator[ColorizationResult]:

        arxiv_id = task.arxiv_id
        file_contents = task.file_contents
        tex_path = task.tex_path

        tokens_path = os.path.join(directories.symbols(arxiv_id), "tokens.csv")
        if not os.path.exists(tokens_path):
            logging.info(
                "No equation token data found for paper %s. Skipping.", arxiv_id
            )
            return

        # Load token location information
        tokens = load_tokens(arxiv_id)
        if tokens is None:
            return

        file_tokens = filter(lambda t: t.tex_path == tex_path, tokens)
        for token in file_tokens:
            batch = next(
                colorize_equation_tokens({tex_path: task.file_contents}, [token])
            )
            colorized_contents = FileContents(
                file_contents.path,
                batch.colorized_files[tex_path].contents,
                file_contents.encoding,
            )
            colorized_token = batch.colorized_tokens[0]
            identifier = {
                "equation_index": colorized_token.equation_index,
                "token_index": colorized_token.token_index,
            }
            colorized_entity = ColorizedEntity(
                colorized_token.hue,
                identifier,
                colorized_token.text,
                "NO CONTEXT RETRIEVED",
                {"text": colorized_token.text},
            )
            yield ColorizationResult(colorized_contents, colorized_entity)
