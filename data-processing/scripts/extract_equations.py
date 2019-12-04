import csv
import os.path
from typing import Iterator, NamedTuple

from explanations import directories
from explanations.directories import (
    get_data_subdirectory_for_iteration,
    get_iteration_names,
)
from explanations.file_utils import clean_directory
from explanations.types import ArxivId, Path
from scripts.command import ArxivBatchCommand


class EquationInfo(NamedTuple):
    arxiv_id: ArxivId
    path: str
    i: int
    tex: str


class ExtractEquations(ArxivBatchCommand[EquationInfo, None]):
    """
    This script assumes that the script for colorizing equations in TeX has already been run.
    The output from that step includes the TeX extracted for all equations. This script
    then just has to collate the equations output from that earlier step.
    """

    @staticmethod
    def get_name() -> str:
        return "extract-equations"

    @staticmethod
    def get_description() -> str:
        return "Extract all equations from TeX sources"

    def get_arxiv_ids_dir(self) -> Path:
        return directories.SOURCES_WITH_COLORIZED_EQUATIONS_DIR

    def load(self) -> Iterator[EquationInfo]:

        for arxiv_id in self.arxiv_ids:
            clean_directory(directories.get_data_subdirectory_for_arxiv_id(directories.EQUATIONS_DIR, arxiv_id))

            colorized_equations_base_dir = (
                directories.SOURCES_WITH_COLORIZED_EQUATIONS_DIR
            )
            for iteration in get_iteration_names(
                colorized_equations_base_dir, arxiv_id
            ):
                colorized_sources_dir = get_data_subdirectory_for_iteration(
                    colorized_equations_base_dir, arxiv_id, iteration
                )
                equation_hues_path = os.path.join(
                    colorized_sources_dir, "equation_hues.csv"
                )
                with open(equation_hues_path, encoding="utf-8") as equation_hues_file:
                    reader = csv.reader(equation_hues_file)
                    for row in reader:
                        yield EquationInfo(arxiv_id, row[0], int(row[1]), row[4])

    def process(self, _: EquationInfo) -> Iterator[None]:
        yield None

    def save(self, item: EquationInfo, _: None) -> None:
        results_dir = directories.get_data_subdirectory_for_arxiv_id(directories.EQUATIONS_DIR, item.arxiv_id)
        if not os.path.exists(results_dir):
            os.makedirs(results_dir)
        results_path = os.path.join(results_dir, "equations.csv")
        with open(results_path, "a", encoding="utf-8") as results_file:
            writer = csv.writer(results_file, quoting=csv.QUOTE_ALL)
            writer.writerow([item.path, item.i, item.tex])
