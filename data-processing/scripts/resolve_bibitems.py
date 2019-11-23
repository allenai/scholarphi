import csv
import logging
import os.path
import re
from typing import Iterator, List, NamedTuple, Set

from explanations import directories
from explanations.file_utils import clean_directory
from explanations.types import ArxivId, Author, Bibitem, Path, Reference
from scripts.command import ArxivBatchCommand


class MatchTask(NamedTuple):
    arxiv_id: ArxivId
    bibitems: List[Bibitem]
    references: List[Reference]


class Match(NamedTuple):
    bibitem: Bibitem
    reference: Reference


"""
The title and authors must have at least this much overlap with the bibitem's text using
the similarity metric below to be considered a match.
"""
SIMILARITY_THRESHOLD = 0.5


def extract_ngrams(s: str, n: int = 3) -> Set[str]:
    """
    This and the 'ngram_sim' method below were provided by Kyle Lo.
    """
    s = re.sub(r"\W", "", s.lower())
    ngrams = zip(*[s[i:] for i in range(n)])
    return {"".join(ngram) for ngram in ngrams}


def ngram_sim(s1: str, s2: str) -> float:
    s1_grams = extract_ngrams(s1)
    s2_grams = extract_ngrams(s2)
    if len(s1_grams) == 0 or len(s2_grams) == 0:
        return 0
    return len(s1_grams.intersection(s2_grams)) / min(len(s1_grams), len(s2_grams))


class ResolveBibitems(ArxivBatchCommand[MatchTask, Match]):
    @staticmethod
    def get_name() -> str:
        return "resolve-bibitems"

    @staticmethod
    def get_description() -> str:
        return "Find S2 IDs for bibitems."

    def get_arxiv_ids_dir(self) -> Path:
        return directories.BIBITEMS_DIR

    def load(self) -> Iterator[MatchTask]:
        for arxiv_id in self.arxiv_ids:
            clean_directory(directories.bibitem_resolutions(arxiv_id))
            bibitems_dir = directories.bibitems(arxiv_id)
            metadata_dir = directories.s2_metadata(arxiv_id)

            references = []

            references_path = os.path.join(metadata_dir, "references.csv")
            with open(references_path) as references_file:
                reader = csv.reader(references_file)
                for row in reader:
                    references.append(
                        Reference(
                            s2Id=row[0],
                            arxivId=row[1],
                            doi=row[2],
                            title=row[3],
                            authors=[
                                Author(id=None, name=name)
                                for name in row[4].split(", ")
                            ],
                            venue=row[5],
                            year=int(row[6]) if row[6].isspace() else None,
                        )
                    )

            bibitems = []

            bibitems_path = os.path.join(bibitems_dir, "bibitems.csv")
            with open(bibitems_path) as bibitems_file:
                reader = csv.reader(bibitems_file)
                for row in reader:
                    bibitems.append(Bibitem(key=row[0], text=row[1]))

            yield MatchTask(arxiv_id, bibitems, references)

    def process(self, item: MatchTask) -> Iterator[Match]:
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
                yield Match(bibitem, most_similar_reference)
            else:
                logging.warning(
                    "Could not find a sufficiently similar reference for bibitem %s of paper %s",
                    bibitem.key,
                    item.arxiv_id,
                )

    def save(self, item: MatchTask, result: Match) -> None:
        resolutions_dir = directories.bibitem_resolutions(item.arxiv_id)
        if not os.path.exists(resolutions_dir):
            os.makedirs(resolutions_dir)

        resolutions_path = os.path.join(resolutions_dir, "resolutions.csv")
        with open(resolutions_path, "a") as resolutions_file:
            writer = csv.writer(resolutions_file, quoting=csv.QUOTE_ALL)
            writer.writerow(
                [
                    result.bibitem.key,
                    result.reference.s2Id,
                    result.reference.title,
                    result.bibitem.text,
                ]
            )
