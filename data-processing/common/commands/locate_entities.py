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
from common.colorize_tex import ColorizedTex, colorize_entities
from common.commands.base import ArxivBatchCommand
from common.commands.compile_tex import save_compilation_result
from common.commands.raster_pages import raster_pages
from common.compile import (compile_tex, get_compiled_tex_files,
                            get_last_autotex_compiler,
                            get_last_colorized_entity_id)
from common.diff_images import diff_images_in_raster_dirs
from common.locate_entities import locate_entities
from common.types import (ArxivId, ColorizationRecord, ColorizeOptions,
                          FileContents, HueLocationInfo, RelativePath,
                          SerializableEntity)


@dataclass(frozen=True)
class LocationTask:
    arxiv_id: ArxivId
    tex_path: RelativePath
    file_contents: FileContents
    entities: List[SerializableEntity]
    group: int


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
        parser.add_argument(
            "--keep-intermediate-files",
            action="store_true",
            help=(
                "Whether to keep intermediate files (sources, compilation results, page rasters) "
                + "generated for each batch of entities processed. The default is to delete "
                + "these files. See the argument documentation in 'run_pipeline' for more context."
            ),
        )

    @staticmethod
    @abstractmethod
    def get_entity_name() -> str:
        """
        Get the name of the type of entity that will be batch processed in this command.
        This name will be used to determine the names of output directories.
        """

    def get_arxiv_ids_dirkey(self) -> str:
        return self.get_input_dirkey()

    @staticmethod
    @abstractmethod
    def get_input_dirkey() -> str:
        " Get the key for the directory that contains data about entities to be localized. "

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
            entities_dir = directories.arxiv_subdir(self.get_input_dirkey(), arxiv_id)
            entities: List[SerializableEntity] = []
            for entities_path in glob.glob(os.path.join(entities_dir, "entities*.csv")):
                entities.extend(
                    file_utils.load_from_csv(
                        entities_path, self.get_detected_entity_type()
                    )
                )

            main_tex_files = get_compiled_tex_files(
                directories.arxiv_subdir("compiled-normalized-sources", arxiv_id)
            )
            normalized_sources_path = directories.arxiv_subdir(
                "normalized-sources", arxiv_id
            )
            for tex_file in main_tex_files:
                file_contents = file_utils.read_file_tolerant(
                    os.path.join(normalized_sources_path, tex_file.path)
                )
                options = self.get_colorize_options()
                entities_for_tex_path = [
                    e
                    for e in entities
                    if e.tex_path == tex_file.path or e.tex_path == "N/A"
                ]
                if options.when is not None:
                    entities_for_tex_path = list(
                        filter(options.when, entities_for_tex_path)
                    )
                if file_contents is not None:
                    group_func = options.group or (lambda entities: [entities])
                    for group_index, entity_group in enumerate(
                        group_func(entities_for_tex_path)
                    ):
                        yield LocationTask(
                            arxiv_id,
                            tex_file.path,
                            file_contents,
                            entity_group,
                            group_index,
                        )

    def process(self, item: LocationTask) -> Iterator[HueLocationInfo]:

        # Filter out entities that are empty (i.e., have nothing to color)
        # A '-1' in the 'start' or 'end' field indicates that the entity does not occur in a
        # specific place in the TeX, but rather a custom coloring technique based on other
        # entity properties will be used. So entities that have a '-1' for their start and
        # end should still be processed even though they appear to be zero-length.
        entities_filtered = [
            e for e in item.entities if e.start == -1 or e.end == -1 or e.start != e.end
        ]

        # Sort entities by the order in which they appear in the TeX. This allows the pipeline
        # to keep track of which ones appear first, when trying to recover from errors (i.e., when
        # trying to detect which entity in a batch may have shifted to cause many others to move.)
        entities_ordered = sorted(entities_filtered, key=lambda e: e.start)

        # Construct a queue of entities to detect.
        entities_by_id = {e.id_: e for e in entities_ordered}
        to_process = deque([e.id_ for e in entities_ordered])
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
                "Locating bounding boxes for batch %d-%d of entities of type %s for paper %s.",
                item.group,
                batch_index,
                self.get_entity_name(),
                item.arxiv_id,
            )
            iteration_id = directories.tex_iteration(
                item.tex_path, f"{item.group}-{batch_index}"
            )
            batch = next_batch()
            entities: List[SerializableEntity] = [entities_by_id[id_] for id_ in batch]

            # Colorize the TeX for all the entities.
            custom_colorize_func = self.get_colorize_func()
            logging.debug(
                "Attempting to colorize entities in TeX for entity batch %d-%d of paper %s.",
                item.group,
                batch_index,
                item.arxiv_id,
            )
            if custom_colorize_func is not None:
                colorized_tex = custom_colorize_func(
                    item.file_contents.contents, entities, self.get_colorize_options()
                )
                if len(colorized_tex.entity_hues) == 0:
                    logging.info(  # pylint: disable=logging-not-lazy
                        "Custom colorization function colored nothing for entity batch %d-%d of "
                        + "paper %s when coloring file %s. The function probably decide there was "
                        + "nothing to do for this file, and will hopefullly colorize these "
                        + "entities in another file. Skipping this batch for this file.",
                        item.group,
                        batch_index,
                        item.arxiv_id,
                        item.file_contents.path,
                    )
                    continue
            else:
                colorized_tex = colorize_entities(
                    item.file_contents.contents, entities, self.get_colorize_options()
                )

            # If some entities were skipped during colorization, perhaps because they
            # overlapped with each other, add them back to the work queue.
            if colorized_tex.skipped is not None and len(colorized_tex.skipped) > 0:
                logging.info(  # pylint: disable=logging-not-lazy
                    "Entities %s were skipped during colorization batch %d-%d for paper "
                    + "%s. They will be processed in a later batch.",
                    [e.id_ for e in colorized_tex.skipped],
                    item.group,
                    batch_index,
                    item.arxiv_id,
                )
                # Queue skipped entities in the order that they initially appeared in the batch.
                reprocess_ids = {e.id_ for e in colorized_tex.skipped}
                reprocess_sorted = [id_ for id_ in batch if id_ in reprocess_ids]
                to_process.extendleft(reversed(reprocess_sorted))

                # Remove skipped entities from the current batch.
                for skip in colorized_tex.skipped:
                    del batch[batch.index(skip.id_)]

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
            logging.debug(
                "Finished attempting to colorize entities for entity batch %d-%d of paper %s.",
                item.group,
                batch_index,
                item.arxiv_id,
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
                last_colorized_entity_id = get_last_colorized_entity(
                    item.arxiv_id, compiled_tex_dir
                )
                if last_colorized_entity_id is not None:
                    problem_ids = [last_colorized_entity_id]
                    if batch.index(last_colorized_entity_id) < len(batch) - 1:
                        problem_ids += [
                            batch[batch.index(last_colorized_entity_id) + 1]
                        ]

                    if len(batch) == 1:
                        logging.warning(  # pylint: disable=logging-not-lazy
                            "Failed to compile paper %s with colorized entity %s, even when it was "
                            + "colorized in isolation. The location of this entity will not be detected.",
                            item.arxiv_id,
                            batch[0],
                        )
                        continue

                    logging.warning(  # pylint: disable=logging-not-lazy
                        "Failed to compile paper %s with colorized entities. The culprit may be "
                        + "the colorization command for entity %s. The problematic entities will be "
                        + "colorized on their own, and the rest of the entities will be colorized "
                        + "together in the next batch.",
                        item.arxiv_id,
                        " or ".join(problem_ids),
                    )

                    for id_ in problem_ids:
                        to_process_alone.append(id_)
                        del batch[batch.index(id_)]

                    to_process.extendleft(reversed(batch))
                    continue

                # If there was some other reason for the error, remove just the first entity from the batch.
                logging.error(  # pylint: disable=logging-not-lazy
                    "Failed to compile paper %s with colorized entities %s. The cause "
                    + "is assumed to be in the first colorized entity. The location for the "
                    + "first entity %s will not be detected. The remainder of the entities in "
                    + "this batch will be processed in another batch.",
                    item.arxiv_id,
                    batch,
                    batch[0],
                )
                del [batch[0]]
                to_process.extendleft(reversed(batch))
                continue

            # Raster the pages to images, and compute diffs from the original images.
            output_files = compilation_result.output_files
            raster_output_dir = directories.iteration(
                self.output_base_dirs["paper-images"], item.arxiv_id, iteration_id
            )
            diffs_output_dir = directories.iteration(
                self.output_base_dirs["diffed-images"], item.arxiv_id, iteration_id
            )
            for output_file in output_files:
                raster_success = raster_pages(
                    compiled_tex_dir,
                    os.path.join(
                        raster_output_dir, directories.escape_slashes(output_file.path)
                    ),
                    output_file.path,
                    output_file.output_type,
                )
                if not raster_success:
                    logging.error(  # pylint: disable=logging-not-lazy
                        "Failed to rasterize pages for %s iteration %s. The locations for entities "
                        + "with IDs %s with not be detected.",
                        item.arxiv_id,
                        iteration_id,
                        batch,
                    )
                    continue

                logging.debug(
                    "Attempting to diff rastered pages for paper %s iteration %s.",
                    item.arxiv_id,
                    iteration_id,
                )
                diff_success = diff_images_in_raster_dirs(
                    output_files, raster_output_dir, diffs_output_dir, item.arxiv_id,
                )
                logging.debug(
                    "Finished diffing attempt for paper %s iteration %s. Success? %s.",
                    item.arxiv_id,
                    iteration_id,
                    diff_success,
                )
                if not diff_success:
                    logging.error(  # pylint: disable=logging-not-lazy
                        "Failed to difference images of original and colorized versions of "
                        + "papers %s in batch processing iteration %s. The locations for entities with IDs "
                        + "%s will not be detected.",
                        item.arxiv_id,
                        iteration_id,
                        batch,
                    )
                    continue

            # Locate the entities in the diffed images.
            logging.debug(
                "Attempting to locate entities using image differences for paper %s iteration %s.",
                item.arxiv_id,
                iteration_id,
            )
            entity_hues = colorized_tex.entity_hues
            location_result = locate_entities(
                item.arxiv_id, raster_output_dir, diffs_output_dir, entity_hues
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
            if len(location_result.shifted_entities) > 0:

                logging.warning(  # pylint: disable=logging-not-lazy
                    "Some entities shifted position in the colorized TeX for paper %s batch %s: "
                    + "%s. Attempting to remove the first shifted entity from the batch.",
                    item.arxiv_id,
                    batch,
                    location_result.shifted_entities,
                )

                first_shifted_entity_id = None
                for entity_id in batch:
                    if entity_id in location_result.shifted_entities:
                        first_shifted_entity_id = entity_id
                        break

                if first_shifted_entity_id is not None:
                    if len(batch) > 1:
                        logging.info(  # pylint: disable=logging-not-lazy
                            "Entity %s has been marked as being the potential cause of shifting in "
                            + "the colorized document for paper %s batch %d-%d. It will be processed "
                            + "later on its own. The other shifted entities in %s will be queued to "
                            + "process as a group in an upcoming batch.",
                            first_shifted_entity_id,
                            item.arxiv_id,
                            item.group,
                            batch_index,
                            location_result.shifted_entities,
                        )

                        # Get the index of the first entity for which the location has shifted
                        # during colorization.
                        moved_entity_index = batch.index(first_shifted_entity_id)

                        # Mark all other entities that have shifted after the first one one to be processed
                        # in a later batch (instead of on their own). It could be that they won't shift
                        # once the first shifted entity is removed.
                        for i in range(len(batch) - 1, moved_entity_index, -1):
                            if batch[i] in location_result.shifted_entities:
                                to_process.appendleft(batch[i])
                                del batch[i]

                        # Mark the first entity that shifted to be reprocessed alone, where its position
                        # might be discoverable, without affecting the positions of other element.
                        del batch[moved_entity_index]
                        to_process_alone.append(first_shifted_entity_id)

                    elif len(batch) == 1 and self.should_sanity_check_images():
                        logging.info(  # pylint: disable=logging-not-lazy
                            "Skipping entity %s for paper %s as it caused "
                            + "colorization errors even when colorized in isolation.",
                            first_shifted_entity_id,
                            item.arxiv_id,
                        )
                        continue
                    elif len(batch) == 1:
                        logging.info(  # pylint: disable=logging-not-lazy
                            "Entity %s has been marked as the cause of shifting in "
                            + "the colorized document for paper %s. Its location will "
                            + "still be saved (if one was found), though this location should be "
                            + "considered potentially inaccurate.",
                            first_shifted_entity_id,
                            item.arxiv_id,
                        )

                else:
                    logging.warning(  # pylint: disable=logging-not-lazy
                        "Could not find a single entity that was likely responsible for shifting in "
                        + "the colorized version of paper %s batch %d-%d. All entities in batch %s will "
                        + "be processed on their own.",
                        item.arxiv_id,
                        item.group,
                        batch_index,
                        batch,
                    )
                    to_process_alone.extend(batch)

            logging.debug(
                "Finished attempt at locating entities with image diffs for paper %s iteration %s.",
                item.arxiv_id,
                iteration_id,
            )

            if not self.args.keep_intermediate_files:
                logging.debug(  # pylint: disable=logging-not-lazy
                    "Deleting intermediate files used to locate entities (i.e., colorized "
                    + "sources, compilation results, and rasters) for paper %s iteration %s",
                    item.arxiv_id,
                    iteration_id,
                )
                intermediate_files_dirs = [
                    colorized_tex_dir,
                    compiled_tex_dir,
                    raster_output_dir,
                    diffs_output_dir,
                ]
                for dir_ in intermediate_files_dirs:
                    file_utils.clean_directory(dir_)
                    os.rmdir(dir_)

            # The code above is responsible for filter 'batch' to ensure that it doesn't include
            # any entity IDs that shouldn't be save to file, for example if the client has asked that
            # entity IDs that cause colorization errors be omitted from the results.
            for entity_id in batch:
                for box in location_result.locations[entity_id]:
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


EntityId = str


def get_last_colorized_entity(
    arxiv_id: ArxivId, compilation_path: RelativePath
) -> Optional[EntityId]:

    original_compilation_path = directories.arxiv_subdir(
        "compiled-normalized-sources", arxiv_id
    )
    original_autogen_log_path = os.path.join(
        original_compilation_path, "auto_gen_ps.log"
    )

    error_message = None
    if not os.path.exists(original_autogen_log_path):
        error_message = (
            f"Could not find auto_gen_ps.log output from AutoTeX at {original_autogen_log_path}. "
            + "Has the original TeX for paper {arxiv_id} been compiled?"
        )

    new_autogen_log_path = os.path.join(compilation_path, "auto_gen_ps.log")
    if not os.path.exists(new_autogen_log_path):
        error_message = (
            f"Could not find auto_gen_ps.log output from AutoTeX at {original_autogen_log_path}. "
            + f"There may have been an error running AutoTeX on a colorized copy of paper {arxiv_id}."
        )

    if error_message is not None:
        logging.warning(  # pylint: disable=logging-not-lazy
            error_message
            + "It will not be possible to determine what compiler succeeded at compiling the "
            + "original paper, and therefore to determine which entities may have been "
            + "responsible for compilation failure. Entity batching may be less efficient.",
        )
        return None

    # If TeX can process data that is not utf-8, then that non-utf-8 data can also be printed
    # out to the AutoTeX log. Therefore, when reading the AutoTeX log, the files need to be opened
    # in a way that is permissive of non-utf-8 data.
    with open(original_autogen_log_path, errors="surrogateescape") as file_:
        original_autogen_log = file_.read()
    with open(new_autogen_log_path, errors="surrogateescape") as file_:
        new_autogen_log = file_.read()

    # Get the name of the TeX compiler that successfully compiled the original TeX.
    compiler_name = get_last_autotex_compiler(original_autogen_log)
    if compiler_name is None:
        logging.warning(  # pylint: disable=logging-not-lazy
            "Could not find the name of the TeX compiler that compiled the original TeX by "
            + "scanning the logs at %s. It will not be possible to determine what was the last "
            + "entity colorized before the compilation failure. Entity batching may be less efficient.",
            original_autogen_log_path,
        )
        return None

    # Get the ID of the last entity that was colorized before compilation failure
    last_colorized_entity_id = get_last_colorized_entity_id(
        new_autogen_log, compiler_name
    )
    if last_colorized_entity_id is not None:
        logging.debug(  # pylint: disable=logging-not-lazy
            "Entity '%s' was the last entity colorized before compilation failure in "
            + "directory %s. The colorization of this entity may be responsible for the "
            + "compilation error.",
            last_colorized_entity_id,
            original_autogen_log_path,
        )
    else:
        logging.warning(  # pylint: disable=logging-not-lazy
            "Unable to determine what was the last entity colorized before compilation failure "
            + "in source directory %s from log %s for compiler '%s'. Entity batching may be less efficient.",
            compilation_path,
            new_autogen_log_path,
            compiler_name,
        )
    return last_colorized_entity_id


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
    shutil.copytree(
        directories.arxiv_subdir("normalized-sources", arxiv_id), output_sources_path,
    )

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
    input_entity_name: Optional[str] = None,
    DetectedEntityType: Optional[Type[SerializableEntity]] = None,
    colorize_options: ColorizeOptions = ColorizeOptions(),
    colorize_func: Optional[ColorizeFunc] = None,
    sanity_check_images: Optional[bool] = None,
) -> Type[LocateEntitiesCommand]:
    """
    Create a command for locating the bounding boxes for entities. Help the command cast
    the entities loaded into the right data type by providing a 'DetectedEntityType'.

    In order to know what entities to locate, the command will first try to read data from a
    data directory called '{##}-detected-{input_entity_name}' if the 'input_entity_name' command
    is defined. Otherwise, it will read from '{##}-detected-{entity_name}'.

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
        def get_input_dirkey() -> str:
            return f"detected-{input_entity_name or entity_name}"

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
