import csv
import os.path
from dataclasses import dataclass
from typing import Iterator, List

from common.directories import get_data_subdirectory_for_iteration, get_iteration_names
from common.file_utils import clean_directory
from common.sanitize_equation import sanitize_equation
from common.types import ArxivId, Path
from common import directories
from command.command import ArxivBatchCommand


@dataclass(frozen=True)
class EquationData:
    arxiv_id: ArxivId
    csv_row: List[str]


class ExtractEquations(ArxivBatchCommand[EquationData, None]):
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
        return (
            "Extract equations from TeX sources for processing by KaTeX. Extracted equations may "
            + "different than they appeared in the original TeX, as they may have been sanitized "
            + "so that KaTeX can parse them without failure. If equations have been modified, "
            + "they will still have the same length so that the positions of entities found in the "
            + "equations will still correspond to the right character locations in the original TeX."
        )

    @staticmethod
    def get_entity_type() -> str:
        return "symbols"

    def get_arxiv_ids_dir(self) -> Path:
        return directories.SOURCES_WITH_COLORIZED_EQUATIONS_DIR

    def load(self) -> Iterator[EquationData]:

        for arxiv_id in self.arxiv_ids:
            clean_directory(directories.equations(arxiv_id))

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
                        equation = row[7]
                        sanitized = sanitize_equation(equation)
                        updated_row = row + [sanitized]
                        yield EquationData(arxiv_id=arxiv_id, csv_row=updated_row)

    def process(self, _: EquationData) -> Iterator[None]:
        yield None

    def save(self, item: EquationData, _: None) -> None:
        results_dir = directories.equations(item.arxiv_id)
        if not os.path.exists(results_dir):
            os.makedirs(results_dir)
        results_path = os.path.join(results_dir, "equations.csv")
        with open(results_path, "a", encoding="utf-8") as results_file:
            writer = csv.writer(results_file, quoting=csv.QUOTE_ALL)
            writer.writerow(item.csv_row)
