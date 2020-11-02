import logging
import os.path
import shutil
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Iterator, List

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.compile import compile_tex, get_errors, is_driver_unimplemented
from common.types import AbsolutePath, ArxivId, CompilationResult, Path, RelativePath

CompilationPath = AbsolutePath


@dataclass(frozen=True)
class CompilationSummaryEntry:
    outcome: str
    source_path: str
    missing_driver: bool
    errors: List[str]


@dataclass(frozen=True)
class CompilationTask:
    arxiv_id: ArxivId
    compilation_path: Path


class CompileTexCommand(ArxivBatchCommand[CompilationTask, CompilationResult], ABC):
    """
    Compile a TeX project, first copying it to a new directory.
    """

    @abstractmethod
    def get_sources_dirkey(self) -> str:
        " Key for data directory containing TeX sources to be compiled. "

    @abstractmethod
    def get_output_dirkey(self) -> str:
        " Key for data directory into which sources will be copied and then compiled. "

    def get_arxiv_ids_dirkey(self) -> str:
        return self.get_sources_dirkey()

    def load(self) -> Iterator[CompilationTask]:
        for arxiv_id in self.arxiv_ids:
            output_dir = directories.arxiv_subdir(self.get_output_dirkey(), arxiv_id)
            if os.path.exists(output_dir):
                logging.warning(
                    "Compilation directory already exists in %s. Deleting.", output_dir,
                )
                shutil.rmtree(output_dir)
            shutil.copytree(
                directories.arxiv_subdir(self.get_sources_dirkey(), arxiv_id),
                output_dir,
            )
            yield CompilationTask(arxiv_id, output_dir)

    def process(self, item: CompilationTask) -> Iterator[CompilationResult]:
        result = compile_tex(item.compilation_path)
        yield result

    def save(self, item: CompilationTask, result: CompilationResult) -> None:
        save_compilation_result(
            self.get_output_dirkey(), item.arxiv_id, item.compilation_path, result
        )


class CompileTexSources(CompileTexCommand):
    @staticmethod
    def get_name() -> str:
        return "compile-tex"

    @staticmethod
    def get_description() -> str:
        return "Compile original TeX sources."

    def get_sources_dirkey(self) -> str:
        return "sources"

    def get_output_dirkey(self) -> str:
        return "compiled-sources"


class CompileNormalizedTexSources(CompileTexCommand):
    @staticmethod
    def get_name() -> str:
        return "compile-normalized-tex"

    @staticmethod
    def get_description() -> str:
        return "Compile normalized TeX sources."

    def get_sources_dirkey(self) -> str:
        return "normalized-sources"

    def get_output_dirkey(self) -> str:
        return "compiled-normalized-sources"


def save_compilation_result(
    output_dir_key: str,
    arxiv_id: ArxivId,
    compilation_path: AbsolutePath,
    result: CompilationResult,
) -> None:
    file_utils.save_compilation_results(compilation_path, result)
    update_compilation_log(
        output_dir_key, arxiv_id, result.stdout, compilation_path, result.success
    )


def update_compilation_log(
    output_dir_key: str,
    arxiv_id: ArxivId,
    stdout: bytes,
    source_path: RelativePath,
    success: bool,
) -> None:

    arxiv_id_output_root = directories.arxiv_subdir(output_dir_key, arxiv_id)
    results_path = os.path.join(arxiv_id_output_root, "compilation_results.csv")

    missing_driver = is_driver_unimplemented(stdout)
    errors = list(get_errors(stdout))
    if missing_driver:
        logging.warning(  # pylint: disable=logging-not-lazy
            "Could not compile arXiv ID %s because colorization commands are missing for the"
            + "driver needed to compile that TeX project.",
            arxiv_id,
        )

    # Write the compilation result to the log.
    file_utils.append_to_csv(
        results_path,
        CompilationSummaryEntry(
            outcome="SUCCESS" if success else "FAILURE",
            source_path=source_path,
            missing_driver=missing_driver,
            errors=[e.decode("utf-8", "ignore") for e in errors],
        ),
    )
