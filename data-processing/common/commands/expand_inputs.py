import logging
import os.path
import shutil
from dataclasses import dataclass
from typing import Iterator

from common import directories
from common.commands.base import ArxivBatchCommand
from common.compile import get_compiled_tex_files
from common.expand_tex import expand_tex
from common.types import AbsolutePath, ArxivId, CompiledTexFile, Path, RelativePath

CompilationPath = AbsolutePath


@dataclass(frozen=True)
class ExpansionTask:
    arxiv_id: ArxivId
    expanded_sources_dir: RelativePath
    compiled_tex_file: CompiledTexFile


class ExpandInputs(ArxivBatchCommand[ExpansionTask, None]):
    """
    Expand main TeX files. This allows later stages to infer the
    order of entities from the order they appear in the TeX file.
    """

    @staticmethod
    def get_name() -> str:
        return "expand-inputs"

    @staticmethod
    def get_description() -> str:
        return "Expand TeX sources, inlining inputs into main TeX files."

    def get_arxiv_ids_dirkey(self) -> Path:
        return "compiled-sources"

    def load(self) -> Iterator[ExpansionTask]:
        for arxiv_id in self.arxiv_ids:
            sources_dir = directories.arxiv_subdir("sources", arxiv_id)
            if not os.path.exists(sources_dir):
                logging.warning(  # pylint: disable=logging-not-lazy
                    "No directory of TeX sources could be found for paper %s. The TeX for "
                    + "this paper will not be expanded.",
                    arxiv_id,
                )
                continue

            output_dir = directories.arxiv_subdir("expanded-sources", arxiv_id)
            if os.path.exists(output_dir):
                logging.warning(
                    "Directory for expanded TeX already exists in %s. Deleting.",
                    output_dir,
                )
                shutil.rmtree(output_dir)

            shutil.copytree(directories.arxiv_subdir("sources", arxiv_id), output_dir)

            compiled_tex_dir = directories.arxiv_subdir("compiled-sources", arxiv_id)
            compiled_tex_files = get_compiled_tex_files(compiled_tex_dir)
            if len(compiled_tex_files) == 0:
                logging.warning(  # pylint: disable=logging-not-lazy
                    "Could not find any TeX files that were successfully compiled for paper %s. "
                    + "The pipeline will not be able to process this paper further.",
                    arxiv_id,
                )
                continue

            for tex_file in compiled_tex_files:
                yield ExpansionTask(arxiv_id, output_dir, tex_file)

    def process(self, item: ExpansionTask) -> Iterator[None]:
        if item.compiled_tex_file.path not in os.listdir(item.expanded_sources_dir):
            logging.warning(  # pylint: disable=logging-not-lazy
                "TeX file %s could not be found in sources directory for paper %s. "
                + "This may mean that the TeX file is specified using a relative path (e.g., "
                + "with '../'). To avoid unanticipated side effects on the file system, this "
                + "TeX file will not be expanded.",
                item.compiled_tex_file.path,
                item.arxiv_id,
            )
            yield None

        tex_path = os.path.join(item.expanded_sources_dir, item.compiled_tex_file.path)

        if not os.path.isfile(tex_path):
            logging.warning(  # pylint: disable=logging-not-lazy
                "TeX file at path %s for paper %s is not an actual file (i.e., it might be a "
                + "link). This file will not be expanded, in case there's something fishy "
                + "with this directory of sources that could cause files outside of the TeX "
                + "project to be modified.",
                item.compiled_tex_file.path,
                item.arxiv_id,
            )
            yield None

        expanded = expand_tex(item.expanded_sources_dir, item.compiled_tex_file.path)
        if expanded is None:
            logging.warning(
                "Could not expand TeX file %s for paper %s.",
                item.compiled_tex_file.path,
                item.arxiv_id,
            )
            return

        # Overwrite the original file with the unified file. This is so that as little as
        # possible will be changed in the sources directory, in the hopes that it will
        # cause AutoTeX to process the unified file the same way as the original file.
        with open(tex_path, "w", encoding="utf-8") as tex_file:
            tex_file.write(expanded)

        logging.debug(
            "TeX file %s for paper %s has been expanded.",
            item.compiled_tex_file.path,
            item.arxiv_id,
        )

        yield None

    def save(self, item: ExpansionTask, result: None) -> None:
        pass
