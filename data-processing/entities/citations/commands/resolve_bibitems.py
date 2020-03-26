import logging
import os.path
import re
from dataclasses import dataclass
from typing import Iterator, List, Set

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId, Bibitem, BibitemMatch, SerializableReference
from ..utils import extract_ngrams, ngram_sim


@dataclass(frozen=True)
class MatchTask:
    arxiv_id: ArxivId
    bibitems: List[Bibitem]
    references: List[SerializableReference]


"""
The title and authors must have at least this much overlap with the bibitem's text using
the similarity metric below to be considered a match.
"""
SIMILARITY_THRESHOLD = 0.5


class ResolveBibitems(ArxivBatchCommand[MatchTask, BibitemMatch]):
    @staticmethod
    def get_name() -> str:
        return "resolve-bibitems"

    @staticmethod
    def get_description() -> str:
        return "Find S2 IDs for bibitems."

    def get_arxiv_ids_dirkey(self) -> str:
        return "bibitems"

    def load(self) -> Iterator[MatchTask]:
        for arxiv_id in self.arxiv_ids:
            file_utils.clean_directory(
                directories.arxiv_subdir("bibitem-resolutions", arxiv_id)
            )
            bibitems_dir = directories.arxiv_subdir("bibitems", arxiv_id)
            metadata_dir = directories.arxiv_subdir("s2-metadata", arxiv_id)

            references_path = os.path.join(metadata_dir, "references.csv")
            if not os.path.exists(references_path):
                logging.warning(
                    "Could not find %s, skipping reference resolution for paper %s",
                    references_path,
                    arxiv_id,
                )
                return
            references = list(
                file_utils.load_from_csv(references_path, SerializableReference)
            )

            bibitems_path = os.path.join(bibitems_dir, "bibitems.csv")
            if not os.path.exists(bibitems_path):
                logging.warning(
                    "Could not find %s, skipping reference resolution for paper %s",
                    bibitems_path,
                    arxiv_id,
                )
                return
            bibitems = list(file_utils.load_from_csv(bibitems_path, Bibitem))

            yield MatchTask(arxiv_id, bibitems, references)

    def process(self, item: MatchTask) -> Iterator[BibitemMatch]:
        for bibitem in item.bibitems:
            max_similarity = 0.0
            most_similar_reference = None
            for reference in item.references:
                similarity = ngram_sim(reference.title, bibitem.text)
                logging.debug(
                    "Computed similarity of %f between reference '%s' and bibitem text '%s'",
                    similarity,
                    reference.title,
                    bibitem.text,
                )
                if similarity > SIMILARITY_THRESHOLD and similarity > max_similarity:
                    max_similarity = similarity
                    most_similar_reference = reference

            if most_similar_reference is not None:
                yield BibitemMatch(
                    bibitem.key,
                    bibitem.text,
                    most_similar_reference.s2_id,
                    most_similar_reference.title,
                )
            else:
                logging.warning(
                    "Could not find a sufficiently similar reference for bibitem %s of paper %s",
                    bibitem.key,
                    item.arxiv_id,
                )

    def save(self, item: MatchTask, result: BibitemMatch) -> None:
        resolutions_dir = directories.arxiv_subdir("bibitem-resolutions", item.arxiv_id)
        if not os.path.exists(resolutions_dir):
            os.makedirs(resolutions_dir)

        resolutions_path = os.path.join(resolutions_dir, "resolutions.csv")
        file_utils.append_to_csv(resolutions_path, result)
