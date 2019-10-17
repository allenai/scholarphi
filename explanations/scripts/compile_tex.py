import csv
import logging
import os.path
from typing import Iterator

from explanations.compile import compile_tex
from explanations.directories import SOURCES_DIR, compilation_results
from explanations.types import ArxivId, CompilationResult
from scripts.command import Command


class CompileTex(Command[ArxivId, CompilationResult]):
    @staticmethod
    def get_name() -> str:
        return "compile-tex"

    @staticmethod
    def get_description() -> str:
        return "Compile TeX sources."

    def load(self) -> Iterator[ArxivId]:
        for arxiv_id in os.listdir(SOURCES_DIR):
            yield arxiv_id

    def process(self, item: ArxivId) -> Iterator[CompilationResult]:
        sources_dir = os.path.join(SOURCES_DIR, item)
        result = compile_tex(sources_dir)
        yield result

    def save(self, item: ArxivId, result: CompilationResult) -> None:
        results_dir = compilation_results(item)
        if not os.path.exists(results_dir):
            os.makedirs(results_dir)

        if result.success:
            logging.debug(
                "Successfully compiled TeX. Generated PDFs %s",
                str(result.compiled_pdfs),
            )
        else:
            logging.warning(
                "Could not compile TeX for arXiv ID %s. See logs in %s.",
                item,
                results_dir,
            )

        with open(os.path.join(results_dir, "result"), "w") as success_file:
            success_file.write(str(result.success))

        if result.compiled_pdfs is not None:
            with open(
                os.path.join(results_dir, "pdf_names.csv"), "w"
            ) as pdf_names_file:
                writer = csv.writer(pdf_names_file, quoting=csv.QUOTE_ALL)
                for i, pdf in enumerate(result.compiled_pdfs):
                    writer.writerow([i, pdf])

        with open(os.path.join(results_dir, "stdout.log"), "wb") as stdout_file:
            stdout_file.write(result.stdout)

        with open(os.path.join(results_dir, "stderr.log"), "wb") as stderr_file:
            stderr_file.write(result.stderr)
