import dataclasses
import os.path
from typing import Iterator

from command.command import ArxivBatchCommand
from common import directories, file_utils
from common.sanitize_equation import sanitize_equation
from common.types import EquationColorizationRecord


class ExtractEquations(
    ArxivBatchCommand[EquationColorizationRecord, EquationColorizationRecord]
):
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

    def get_arxiv_ids_dirkey(self) -> str:
        return "sources-with-colorized-equations"

    def load(self) -> Iterator[EquationColorizationRecord]:

        for arxiv_id in self.arxiv_ids:
            file_utils.clean_directory(directories.arxiv_subdir("equations", arxiv_id))

            # Load equations found during all colorization iterations
            for iteration in directories.iteration_names(
                "sources-with-colorized-equations", arxiv_id
            ):
                colorized_sources_dir = directories.iteration(
                    "sources-with-colorized-equations", arxiv_id, iteration
                )
                equation_hues_path = os.path.join(
                    colorized_sources_dir, "equation_hues.csv"
                )
                for record in file_utils.load_from_csv(
                    equation_hues_path, EquationColorizationRecord
                ):
                    yield record

    def process(
        self, item: EquationColorizationRecord
    ) -> Iterator[EquationColorizationRecord]:
        # Sanitize equation to an equivalent equation that can be processed by KaTeX
        yield dataclasses.replace(item, content_tex=sanitize_equation(item.content_tex))

    def save(
        self, _: EquationColorizationRecord, result: EquationColorizationRecord
    ) -> None:
        results_dir = directories.arxiv_subdir("equations", result.arxiv_id)
        if not os.path.exists(results_dir):
            os.makedirs(results_dir)
        results_path = os.path.join(results_dir, "equations.csv")
        file_utils.append_to_csv(results_path, result)
