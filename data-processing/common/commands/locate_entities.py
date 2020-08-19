import glob
import logging
import os.path
import shutil
from abc import ABC, abstractmethod
from argparse import ArgumentParser
from collections import deque
from dataclasses import dataclass
from typing import Any, Callable, Deque, Dict, Iterator, List, Optional, Type

from common import directories, file_utils
from common.colorize_tex import ColorizedTex, ColorizeOptions, colorize_entities
from common.commands.base import ArxivBatchCommand
from common.commands.compile_tex import save_compilation_result
from common.commands.raster_pages import raster_pages
from common.compile import compile_tex
from common.diff_images import diff_images_in_raster_dirs
from common.locate_entities import locate_entities
from common.types import (
    ArxivId,
    ColorizationRecord,
    FileContents,
    HueLocationInfo,
    RelativePath,
    SerializableEntity,
)
from common.unpack import unpack


@dataclass(frozen=True)
class LocationTask:
    arxiv_id: ArxivId
    tex_path: RelativePath
    file_contents: FileContents
    entities: List[SerializableEntity]


ColorizeFunc = Callable[[str, List[SerializableEntity], ColorizeOptions], ColorizedTex]


class LocateEntitiesCommand(ArxivBatchCommand[LocationTask, HueLocationInfo], ABC):
    """
    Integrated batch processing for locating entities. Includes adding colorization commands to
    the LaTeX, compiling the document, rastering the pages, differencing the pages, and
    searching for the colorized entities.

    Attempts to be tolerant to colorization faults. The command detects which entity appears
    to cause colorization issues (both compilation issues, and formula layout changes), and
    isolates those entities to be extracted on their own.

    Because of this fault sensitivity, this command merges together many stages of the pipeline
    that could theoretically be separated---adding color commands, compiling, rastering pages,
    and image processing. They are merged to make it easier to loop back to earlier stages
    of the pipeline when errors are detected in later stages.
    """

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super(LocateEntitiesCommand, LocateEntitiesCommand).__init__(
            self, *args, **kwargs
        )
        entity_name = self.get_entity_name()
        self.output_base_dirs = {
            "sources": f"sources-with-colorized-{entity_name}",
            "compiled-sources": f"compiled-sources-with-colorized-{entity_name}",
            "paper-images": f"paper-images-with-colorized-{entity_name}",
            "diffed-images": f"diffed-images-with-colorized-{entity_name}",
            "entity-locations": f"{entity_name}-locations",
        }

    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        super(LocateEntitiesCommand, LocateEntitiesCommand).init_parser(parser)
        parser.add_argument(
            "--batch-size",
            type=int,
            default=30,
            help=(
                "Number of entities to detect at a time. This number is limited by the number "
                + "of distinct hues that OpenCV can detect."
            ),
        )
        parser.add_argument(
            "--skip-visual-validation",
            action="store_true",
            help=(
                "Whether to skip visual validation. When visual validation is enabled, the "
                + "paper diff will be checked for black pixels before hues are located. Black "
                + "pixels indicate that the layout of the page changed based on changes made to "
                + "the TeX. If visual validation fails for a diff for a paper, that diff will "
                + "not be processed. Set this flag to skip visual validation and therefore "
                + "process all diffs of all papers regardless of evidence of layout shift."
            ),
        )

    @staticmethod
    @abstractmethod
    def get_entity_name() -> str:
        """
        Get the name of the type of entity that will be batch processed in these commands.
        This command will be used to determine the names of output directories.
        """

    def get_arxiv_ids_dirkey(self) -> str:
        return f"detected-{self.get_entity_name()}"

    @staticmethod
    def get_detected_entity_type() -> Type[SerializableEntity]:
        """
        Override this method if you need access to entity data that are present on a subclass of
        'SerializableEntity'. For example, if you need colorization to occur only when equations
        have a specific depth, this function should return the 'Equation' type, so that the 'when'
        colorization callback can have access to the 'depth' property.
        """
        return SerializableEntity

    @staticmethod
    @abstractmethod
    def get_colorize_options() -> ColorizeOptions:
        """
        Override this to set a custom options for colorizing entities. One example is that you may
        want to wrap all entities in curly braces before applying colorization commands to them.
        """

    @staticmethod
    @abstractmethod
    def get_colorize_func() -> Optional[ColorizeFunc]:
        """
        Override this when you want to set a custom function for colorizing entities. One example
        of when to set this is for bibliography items, where colorization commands are to be
        inserted at the top of a TeX file, instead of around the citation commands.
        """

    @staticmethod
    @abstractmethod
    def should_sanity_check_images() -> Optional[bool]:
        """
        Force visual validation of images before locating hues, or force skipping of validation.
        """

    def load(self) -> Iterator[LocationTask]:

        entity_name = self.get_entity_name()
        for arxiv_id in self.arxiv_ids:
            for output_base_dir in self.output_base_dirs.values():
                file_utils.clean_directory(
                    directories.arxiv_subdir(output_base_dir, arxiv_id)
                )

            # A directory of entities may contain files for each of multiple types of entities.
            # One example is that the definition detector detects both terms and definitions.
            # In that case, the colorizer colorizes all entities from all of these files.
            # Earlier entity extractor commands should include enough information in the entity IDs
            # so that the type of entities can be inferred from the entity ID in later commands.
            entities_dir = directories.arxiv_subdir(f"detected-{entity_name}", arxiv_id)
            entities: List[SerializableEntity] = []
            for entities_path in glob.glob(os.path.join(entities_dir, "entities*.csv")):
                entities.extend(
                    file_utils.load_from_csv(
                        entities_path, self.get_detected_entity_type()
                    )
                )

            original_sources_path = directories.arxiv_subdir("sources", arxiv_id)
            for tex_path in file_utils.find_files(
                original_sources_path, [".tex"], relative=True
            ):
                file_contents = file_utils.read_file_tolerant(
                    os.path.join(original_sources_path, tex_path)
                )
                entities_for_tex_path = [
                    e for e in entities if e.tex_path == tex_path or e.tex_path == "N/A"
                ]
                if file_contents is not None:
                    yield LocationTask(
                        arxiv_id, tex_path, file_contents, entities_for_tex_path
                    )

    def process(self, item: LocationTask) -> Iterator[HueLocationInfo]:

        entities_by_id = {e.id_: e for e in item.entities}
        to_process = deque([e.id_ for e in item.entities])
        to_process_alone: Deque[str] = deque()

        def next_batch() -> List[str]:
            """
            Get the next batch of entities to process. First tries to sample a batch from
            'to_process', and then attempts to sample individual entities from 'to_process_alone'.
            """
            if len(to_process) > 0:
                return [
                    to_process.popleft()
                    for _ in range(min(self.args.batch_size, len(to_process)))
                ]
            return [to_process_alone.popleft()]

        batch_index = -1
        while len(to_process) > 0 or len(to_process_alone) > 0:

            # Fetch the next batch of entities to process.
            batch_index += 1
            logging.debug(
                "Locating bounding boxes for batch %d of entities of type %s for paper %s.",
                batch_index,
                self.get_entity_name(),
                item.arxiv_id,
            )
            iteration_id = directories.tex_iteration(item.tex_path, str(batch_index))
            batch = next_batch()
            entities: List[SerializableEntity] = [entities_by_id[id_] for id_ in batch]

            # Colorize the TeX for all the entities.
            custom_colorize_func = self.get_colorize_func()
            if custom_colorize_func is not None:
                colorized_tex = custom_colorize_func(
                    item.file_contents.contents, entities, self.get_colorize_options()
                )
            else:
                colorized_tex = colorize_entities(
                    item.file_contents.contents, entities, self.get_colorize_options()
                )

            # Save the colorized TeX to the file system.
            colorized_tex_dir = directories.iteration(
                self.output_base_dirs["sources"], item.arxiv_id, iteration_id
            )
            save_success = save_colorized_tex(
                item.arxiv_id,
                colorized_tex_dir,
                item.tex_path,
                iteration_id,
                colorized_tex.tex,
                item.file_contents.encoding,
                colorized_tex.entity_hues,
            )
            if not save_success:
                logging.error(  # pylint: disable=logging-not-lazy
                    "Failed to save colorized TeX files for arXiv paper %s. "
                    "This paper will be skipped.",
                    item.arxiv_id,
                )

            # Compile the TeX with the colors.
            compiled_tex_dir = directories.iteration(
                self.output_base_dirs["compiled-sources"], item.arxiv_id, iteration_id,
            )
            shutil.copytree(colorized_tex_dir, compiled_tex_dir)
            compilation_result = compile_tex(compiled_tex_dir)
            save_compilation_result(
                "compiled-sources", item.arxiv_id, compiled_tex_dir, compilation_result
            )
            if not compilation_result.success:

                # If colorizing a specific entity caused the failure, remove the entity that caused
                # the problem from the batch and restart with a new batch, minus this entity.
                failed_entity_id = compilation_result.error_cause_entity_id
                if failed_entity_id is not None:
                    logging.warning(  # pylint: disable=logging-not-lazy
                        "Failed to compile paper %s with colorized entities. The culprit is likely "
                        + "the colorization command for entity %s. That entity will now be ignored. Attempting to "
                        + "compile the paper again without colorizing that entity.",
                        item.arxiv_id,
                        failed_entity_id,
                    )
                    del batch[batch.index(failed_entity_id)]
                    to_process.extendleft(reversed(batch))
                    continue

                # If there was some other reason for the error, discard the whole batch.
                logging.error(  # pylint: disable=logging-not-lazy
                    "Failed to compile paper %s with colorized entities. The cause "
                    + "is unknown. The locations for entities with IDs %s will not be detected.",
                    item.arxiv_id,
                    batch,
                )
                continue

            # Raster the pages to images, and compute diffs from the original images.
            output_files = compilation_result.output_files
            raster_output_dir = directories.iteration(
                self.output_base_dirs["paper-images"], item.arxiv_id, iteration_id
            )
            for output_file in output_files:
                raster_success = raster_pages(
                    compiled_tex_dir,
                    os.path.join(raster_output_dir, directories.escape_slashes(output_file.path)),
                    output_file.path,
                    output_file.output_type,
                )
                if not raster_success:
                    logging.error(  # pylint: disable=logging-not-lazy
                        "Failed to rasterize pages %s iteration %d. The locations for entities "
                        + "with IDs %s with not be detected.",
                        item.arxiv_id,
                        iteration_id,
                        batch,
                    )
                    continue

                diffs_output_dir = directories.iteration(
                    self.output_base_dirs["diffed-images"], item.arxiv_id, iteration_id
                )
                diff_success = diff_images_in_raster_dirs(
                    output_files,
                    raster_output_dir,
                    diffs_output_dir,
                    item.arxiv_id,
                )
                if not diff_success:
                    logging.error(  # pylint: disable=logging-not-lazy
                        "Failed to difference images of original and colorized versions of "
                        + "papers %s in batch processing iteration %d. The locations for entities with IDs "
                        + "%s will not be detected.",
                        item.arxiv_id,
                        iteration_id,
                        batch,
                    )
                    continue

            # Locate the entities in the diffed images.
            entity_hues = colorized_tex.entity_hues
            location_result = locate_entities(
                diffs_output_dir, item.arxiv_id, entity_hues
            )
            if location_result is None:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "Error occurred when locating entities by hue in diffed images "
                    + "for paper %s. None of the entities in batch %s will be detected.",
                    item.arxiv_id,
                    batch,
                )
                continue

            if self.should_sanity_check_images() and location_result.black_pixels_found:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "Ignoring bounding boxes found for paper %s in batch %s due to "
                    + "black pixels found in the images. This might indicate that the colorization "
                    + "commands introduced subtle shifts of the text.",
                    item.arxiv_id,
                    batch,
                )
                continue

            # If colorizing entities seemed to cause drift in the document...
            if location_result.first_shifted_entity is not None:
                moved_entity_id = location_result.first_shifted_entity
                moved_entity_index = batch.index(moved_entity_id)

                # Mark that entity to be reprocessed alone, where its position can maybe be
                # discovered without affecting the positions of other element.
                del batch[moved_entity_index]
                to_process_alone.append(moved_entity_id)

                # Mark all entities after that one to be reprocessed in a batch.
                reprocess = batch[moved_entity_index:]
                to_process.extendleft(reversed(reprocess))

                # Continue processing the rest of the batch that occurred before this entity
                # as if nothing had happened.
                batch = batch[:moved_entity_index]

            for entity_id, boxes in location_result.locations.items():
                if entity_id not in location_result.shifted_entities:
                    for box in boxes:
                        yield HueLocationInfo(
                            tex_path=item.tex_path,
                            iteration=iteration_id,
                            hue=entity_hues[entity_id],
                            entity_id=entity_id,
                            page=box.page,
                            left=box.left,
                            top=box.top,
                            width=box.width,
                            height=box.height,
                        )

    def save(self, item: LocationTask, result: HueLocationInfo) -> None:
        logging.debug(
            "Found bounding box for %s entity %s in iteration %s, hue %f",
            item.arxiv_id,
            result.entity_id,
            result.iteration,
            result.hue,
        )

        output_dir = directories.arxiv_subdir(
            self.output_base_dirs["entity-locations"], item.arxiv_id
        )
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        output_path = os.path.join(output_dir, "entity_locations.csv")

        file_utils.append_to_csv(output_path, result)


def save_colorized_tex(
    arxiv_id: ArxivId,
    output_sources_path: RelativePath,
    tex_path: RelativePath,
    iteration: str,
    tex: str,
    encoding: str,
    entity_hues: Dict[str, float],
) -> bool:
    logging.debug("Outputting colorized TeX to %s.", output_sources_path)

    # Each colorization batch gets a new sources directory.
    unpack_path = unpack(arxiv_id, output_sources_path)
    sources_unpacked = unpack_path is not None
    if unpack_path is None:
        logging.warning("Could not unpack sources into %s.", output_sources_path)
        return False

    if sources_unpacked:
        # Rewrite the TeX with the colorized TeX.
        tex_path = os.path.join(output_sources_path, tex_path)
        with open(tex_path, "w", encoding=encoding) as tex_file:
            tex_file.write(tex)

        # Save a log of which hues were assigned to which entities.
        hues_path = os.path.join(output_sources_path, "entity_hues.csv")
        for entity_id, hue in entity_hues.items():
            file_utils.append_to_csv(
                hues_path,
                ColorizationRecord(
                    tex_path=tex_path,
                    iteration=str(iteration),
                    hue=hue,
                    entity_id=entity_id,
                ),
            )

    return True


def make_locate_entities_command(
    entity_name: str,
    DetectedEntityType: Optional[Type[SerializableEntity]] = None,
    colorize_options: ColorizeOptions = ColorizeOptions(),
    colorize_func: Optional[ColorizeFunc] = None,
    sanity_check_images: Optional[bool] = None,
) -> Type[LocateEntitiesCommand]:
    """
    Create a command for locating the bounding boxes for entities. Help the command cast
    the entities loaded into the right data type by providing a 'DetectedEntityType'.
    Colorization of entities can be customized, either by providing a unique 'colorize_func',
    or by providing a set of 'colorize_options'. Specify 'sanity_check_images' to force
    visual validation of image differences. Bounding boxes will be omitted for entities
    when unexpected visual artifacts are found in image differences.
    """

    class C(LocateEntitiesCommand):
        @staticmethod
        def get_name() -> str:
            return f"locate-bounding-boxes-for-{entity_name}"

        @staticmethod
        def get_description() -> str:
            return f"Find bounding boxes of {entity_name}."

        @staticmethod
        def get_entity_name() -> str:
            return entity_name

        @staticmethod
        def get_detected_entity_type() -> Type[SerializableEntity]:
            if DetectedEntityType is None:
                return super(C, C).get_detected_entity_type()
            return DetectedEntityType

        @staticmethod
        def get_colorize_options() -> ColorizeOptions:
            return colorize_options

        @staticmethod
        def get_colorize_func() -> Optional[ColorizeFunc]:
            return colorize_func

        @staticmethod
        def should_sanity_check_images() -> Optional[bool]:
            return sanity_check_images

    return C
