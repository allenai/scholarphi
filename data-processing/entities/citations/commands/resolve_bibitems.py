import ast
import logging
import os.path
from dataclasses import dataclass
from typing import Iterator, List

from sklearn.feature_extraction.text import CountVectorizer
import numpy as np
import re

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId, SerializableReference

from ..types import Bibitem, BibitemMatch


@dataclass(frozen=True)
class MatchTask:
    arxiv_id: ArxivId
    bibitems: List[Bibitem]
    references: List[SerializableReference]


"""
The title and authors must have at least this much overlap with the bibitem's text using
the similarity metric below to be considered a match.
"""
SIMILARITY_THRESHOLD = 0.0


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
            bibitems_dir = directories.arxiv_subdir("detected-citations", arxiv_id)
            metadata_dir = directories.arxiv_subdir("s2-metadata", arxiv_id)

            references_path = os.path.join(metadata_dir, "references.csv")
            if not os.path.exists(references_path):
                logging.warning(
                    "Could not find %s, skipping reference resolution for paper %s",
                    references_path,
                    arxiv_id,
                )
                continue
            references = list(
                file_utils.load_from_csv(references_path, SerializableReference)
            )

            bibitems_path = os.path.join(bibitems_dir, "entities.csv")
            if not os.path.exists(bibitems_path):
                logging.warning(
                    "Could not find %s, skipping reference resolution for paper %s",
                    bibitems_path,
                    arxiv_id,
                )
                continue
            bibitems = list(file_utils.load_from_csv(bibitems_path, Bibitem))

            yield MatchTask(arxiv_id, bibitems, references)

    def process(self, item: MatchTask) -> Iterator[BibitemMatch]:
        ref_match_count = 0
        n_authors = 5
        for bibitem in item.bibitems:
            max_similarity = 0.0
            most_similar_reference = None
            bibitem_concat = ' '.join([bibitem.text, ResolveBibitems.split_key(bibitem.id_)])
            for reference in item.references:
                list_of_authors = [entry['name'] for entry in ast.literal_eval(reference.authors)[:n_authors]]
                reference_concat = ' '.join([reference.title,
                                             ' '.join(list_of_authors),
                                             reference.venue, str(reference.year),
                                             reference.arxivId])
                similarity = ResolveBibitems.similarity_count_vectorizer(reference_concat, bibitem_concat)
                if similarity > SIMILARITY_THRESHOLD and similarity > max_similarity:
                    max_similarity = similarity
                    most_similar_reference = reference

            if most_similar_reference is not None:
                ref_match_count += 1
                yield BibitemMatch(
                    bibitem.id_,
                    bibitem.text,
                    most_similar_reference.s2_id,
                    most_similar_reference.title,
                    max_similarity,
                )
            else:
                logging.warning(
                    "Could not find a sufficiently similar reference for bibitem %s of paper %s",
                    bibitem.id_,
                    item.arxiv_id,
                )

        if item.bibitems:
            if ref_match_count == 0:
                logging.warning(
                    f"Paper {item.arxiv_id} has {len(item.bibitems)} reference(s), " +
                    f"but could not match any to S2 reference data."
                )
            else:
                logging.info(
                    f"Paper has {len(item.bibitems)} references, " +
                    f"able to match {ref_match_count} reference(s) to S2 data."
                )
        else:
            logging.warning(
                f"Could not extract any reference for paper {item.arxiv_id}."
            )

    def save(self, item: MatchTask, result: BibitemMatch) -> None:
        resolutions_dir = directories.arxiv_subdir("bibitem-resolutions", item.arxiv_id)
        if not os.path.exists(resolutions_dir):
            os.makedirs(resolutions_dir)

        resolutions_path = os.path.join(resolutions_dir, "resolutions.csv")
        file_utils.append_to_csv(resolutions_path, result)

    @staticmethod
    def similarity_count_vectorizer(s2_return: str, bibliography_reference: str) -> float:
        """
        Similarity measure based on CountVectorizer
        https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text
        .CountVectorizer.html#sklearn.feature_extraction.text.CountVectorizer.fit_transform
        Implementation is using n_gram in range of 1-5. vectorizer is trained on the first parameter
        which is the concatenated API return.
        transform call returns a binary vector, each value corresponds to the dictionary entries in the
        extracted_text_key
        @param s2_return: Concatenated s2 return
        @param bibliography_reference: Bibliography reference trying to match
        @return:
        """
        if not s2_return or not bibliography_reference:
            return 0.0

        vectorizer = CountVectorizer(binary=True, ngram_range=(1, 5), stop_words='english')
        try:
            vectorizer.fit([s2_return])
        except ValueError as e:
            logging.error(e)
            return 0.0

        if len(vectorizer.get_feature_names()) > 3:
            return float(np.average(vectorizer.transform([bibliography_reference]).toarray(), axis=1))

        return 0.0

    @staticmethod
    def split_key(key: str) -> str:
        """
        Attempt to split the bibliography key in 3 parts
        Canonical way of creating keys is to have 3 parts example: kanatani2011hyper first word corresponds to the first
        author last name, year and the first word of the publication.
        @param key: Key to be split in 3 parts
        """
        if key:
            return (
                re.sub(r"(\w)([A-Z])", r"\1 \2", re.sub(r"(?i)([a-z]*)(\d*)([a-z]*)", r"\1 \2 \3", str(key)))).strip()
        return key
