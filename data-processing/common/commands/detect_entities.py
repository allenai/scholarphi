import os.path
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Iterator, Type

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.compile import get_compiled_tex_files
from common.parse_tex import EntityExtractor
from common.types import ArxivId, FileContents, RelativePath, SerializableEntity


@dataclass(frozen=True)
class DetectionTask:
    arxiv_id: ArxivId
    tex_path: RelativePath
    file_contents: FileContents


class DetectEntitiesCommand(ArxivBatchCommand[DetectionTask, SerializableEntity], ABC):
    """
    A command for detecting entities in a set of TeX files. Entities are extracted in
    preparation for later colorization steps. All entities will be saved with the path to
    the TeX file it was found in, its character positions, and an ID which, together with the name
    of the TeX file, can be considered a unique identifier for the entity.
    """

    @abstractmethod
    def get_output_base_dirkey(self) -> str:
        """
        Key for the data directory where extracted entities should be written.
        """

    @abstractmethod
    def get_extractor_type(self) -> Type[EntityExtractor]:
        """
        Extractor class that will be instantiated for finding entities in the TeX. You will likely
        have to define a new extractor class for every entity type you want to colorize.
        """

    @staticmethod
    def get_arxiv_ids_dirkey() -> str:
        return "compiled-normalized-sources"

    def load(self) -> Iterator[DetectionTask]:
        for arxiv_id in self.arxiv_ids:
            output_root = directories.arxiv_subdir(
                self.get_output_base_dirkey(), arxiv_id
            )
            file_utils.clean_directory(output_root)

            for main_tex_file in get_compiled_tex_files(
                directories.arxiv_subdir("compiled-normalized-sources", arxiv_id)
            ):
                # While the directory of compiled sources is inspected to find out which TeX
                # files were compiled, entities should be detected in the un-compiled sources,
                # because AutoTeX sometimes modifies the TeX files during compilation, meaning
                # that character offsets found in compiled TeX files won't match the character
                # offsets of the same text in the original TeX files downloaded from arXiv.
                file_contents = file_utils.read_file_tolerant(
                    os.path.join(
                        directories.arxiv_subdir("normalized-sources", arxiv_id),
                        main_tex_file.path,
                    )
                )
                if file_contents is not None:
                    yield DetectionTask(arxiv_id, main_tex_file.path, file_contents)

    def process(self, item: DetectionTask) -> Iterator[SerializableEntity]:
        ExtractorClass = self.get_extractor_type()
        extractor = ExtractorClass()
        for entity in extractor.parse(item.tex_path, item.file_contents.contents):
            yield entity

    def save(self, item: DetectionTask, result: SerializableEntity) -> None:
        results_dir = directories.arxiv_subdir(
            self.get_output_base_dirkey(), item.arxiv_id
        )
        if not os.path.exists(results_dir):
            os.makedirs(results_dir)
        entities_path = os.path.join(results_dir, "entities.csv")
        file_utils.append_to_csv(entities_path, result)


def make_detect_entities_command(
    entity_name: str, ExtractorType: Type[EntityExtractor]
) -> Type[DetectEntitiesCommand]:
    class C(DetectEntitiesCommand):
        @staticmethod
        def get_name() -> str:
            return f"detect-{entity_name}"

        @staticmethod
        def get_description() -> str:
            return f"Detect locations of {entity_name} in TeX."

        def get_output_base_dirkey(self) -> str:
            return f"detected-{entity_name}"

        def get_extractor_type(self) -> Type[EntityExtractor]:
            return ExtractorType

    return C
