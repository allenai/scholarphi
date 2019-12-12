import csv
import logging
import os.path
from typing import Iterator, List, NamedTuple

from explanations import directories
from explanations.colorize_tex import ColorizedEntity, colorize_equations
from explanations.directories import (
    get_data_subdirectory_for_arxiv_id,
    get_data_subdirectory_for_iteration,
    get_iteration_id,
)
from explanations.file_utils import clean_directory, find_files, read_file_tolerant
from explanations.types import ArxivId, FileContents, Path, RelativePath
from explanations.unpack import unpack
from scripts.command import ArxivBatchCommand


class ColorizationTask(NamedTuple):
    arxiv_id: ArxivId
    tex_path: RelativePath
    file_contents: FileContents


class ColorizationResult(NamedTuple):
    iteration: int
    tex: str
    colorized_equations: List[ColorizedEntity]


class ColorizeEquations(ArxivBatchCommand[ColorizationTask, ColorizationResult]):
    @staticmethod
    def get_name() -> str:
        return "colorize-equations"

    @staticmethod
    def get_description() -> str:
        return "Instrument TeX to colorize equations."

    def get_arxiv_ids_dir(self) -> Path:
        return directories.SOURCES_DIR

    def get_sources_with_colorized_equations_dir(self) -> str:
        return directories.SOURCES_WITH_COLORIZED_EQUATIONS_DIR

    def load(self) -> Iterator[ColorizationTask]:
        for arxiv_id in self.arxiv_ids:

            output_root = get_data_subdirectory_for_arxiv_id(
                self.get_sources_with_colorized_equations_dir(), arxiv_id
            )
            clean_directory(output_root)

            original_sources_path = directories.get_data_subdirectory_for_arxiv_id(directories.SOURCES_DIR, arxiv_id)
            for tex_path in find_files(original_sources_path, [".tex"], relative=True):
                file_contents = read_file_tolerant(
                    os.path.join(original_sources_path, tex_path)
                )
                if file_contents is not None:
                    yield ColorizationTask(arxiv_id, tex_path, file_contents)

    def process(self, item: ColorizationTask) -> Iterator[ColorizationResult]:
        for i, batch in enumerate(colorize_equations(item.file_contents.contents)):
            yield ColorizationResult(i, batch.tex, batch.entities)

    def save(self, item: ColorizationTask, result: ColorizationResult) -> None:
        iteration = result.iteration
        colorized_tex = result.tex
        colorized_equations = result.colorized_equations

        iteration_id = get_iteration_id(item.tex_path, iteration)
        output_sources_path = get_data_subdirectory_for_iteration(
            self.get_sources_with_colorized_equations_dir(),
            item.arxiv_id,
            iteration_id,
        )
        logging.debug("Outputting to %s", output_sources_path)

        # Create new directory for each colorization iteration for each TeX file.
        unpack_path = unpack(item.arxiv_id, output_sources_path)
        sources_unpacked = unpack_path is not None
        if unpack_path is None:
            logging.warning("Could not unpack sources into %s", output_sources_path)

        if sources_unpacked:
            tex_path = os.path.join(output_sources_path, item.tex_path)
            with open(tex_path, "w", encoding=item.file_contents.encoding) as tex_file:
                tex_file.write(colorized_tex)

            hues_path = os.path.join(output_sources_path, "equation_hues.csv")
            with open(hues_path, "a", encoding="utf-8") as hues_file:
                writer = csv.writer(hues_file, quoting=csv.QUOTE_ALL)
                for colorized_equation in colorized_equations:
                    try:
                        writer.writerow(
                            [
                                item.tex_path,
                                colorized_equation.identifier["index"],
                                iteration_id,
                                colorized_equation.hue,
                                colorized_equation.tex,
                                colorized_equation.data["content_start"],
                                colorized_equation.data["content_end"],
                                colorized_equation.data["content_tex"],
                                colorized_equation.data["depth"],
                                colorized_equation.data["start"],
                                colorized_equation.data["end"],
                            ]
                        )
                    except Exception:  # pylint: disable=broad-except
                        logging.warning(
                            "Couldn't write row for equation for arXiv %s: can't be converted to utf-8",
                            item.arxiv_id,
                        )


class VisualValidateColorizeEquations(ColorizeEquations):
    @staticmethod
    def get_name() -> str:
        return "visual-validate-colorize-equations"

    @staticmethod
    def get_description() -> str:
        return "Instrument TeX to colorize equations with preset hue"

    def get_sources_with_colorized_equations_dir(self) -> str:
        return directories.VISUAL_VALIDATE_SOURCES_WITH_COLORIZED_EQUATIONS_DIR

    def process(self, item: ColorizationTask) -> Iterator[ColorizationResult]:
        # gold_rgb = (255, 215, 0)
        # gold_hsv = colorsys.rgb_to_hsv(*gold_rgb)
        # >> (0.14052287581699346, 1.0, 255)
        for i, batch in enumerate(colorize_equations(item.file_contents.contents, preset_hue=0.14052287581699346)):
            yield ColorizationResult(i, batch.tex, batch.entities)
