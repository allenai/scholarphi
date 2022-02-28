import logging, coloredlogs
import os.path
from dataclasses import dataclass
from typing import Iterator, List

from common import directories, file_utils
from common.commands.base import ArxivBatchCommand
from common.types import ArxivId, SerializableReference

from ..types import Bibitem, BibitemMatch
from ..utils import ngram_sim
import requests
import json
import time

coloredlogs.install()


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
        citation_matching_url = "http://pipeline-api.prod.s2.allenai.org/citation/match"
        # bib_titles = annotated_doc.new_annotations.get("bib_title")
        # bib_entries = annotated_doc.new_annotations.get("biblStruct")
        # bib_dois = deque(annotated_doc.new_annotations.pop("bib_idno", []))

        ref_match_count = 0
        headers = {"Content-Type": "application/json"}

        payload = [{"title": bibitem.title} for bibitem in item.bibitems]

        try:
            response = requests.post(
                citation_matching_url, headers=headers, json=payload
            )

            if response.status_code == 200:
                # matching_ids = deque(response.json())
                # logging.info(json.dumps(item.bibitems[0].text, indent = 4))
                logging.info(
                    str(sum([item > 0 for item in response.json()]))
                    + "/"
                    + str(len(response.json()))
                )

            else:
                logging.error(response.status_code)
                response.raise_for_status()
        except Exception as e:
            logging.warning(
                "Exception encountered while trying to retrieve citation matchings for title "
                + bibitem.text,
                e,
            )
            raise e

        for bibitem_id in range(len(item.bibitems)):
            bibitem = item.bibitems[bibitem_id]
            paper_id = bibitem_id
            max_similarity = 0.0
            most_similar_reference = None
            # is bibitem.text the title element

            print("\n[EXTRACTED-TITLE]" + payload[paper_id]["title"])
            for reference in item.references:
                similarity = ngram_sim(reference.title, bibitem.text)
                if similarity > SIMILARITY_THRESHOLD and similarity > max_similarity:
                    max_similarity = similarity
                    most_similar_reference = reference

            if response.json()[paper_id] < 0:
                print("[CORPUS-TITLE] " + "No Match!!!")
            else:
                time.sleep(1)
                corpus_id = response.json()[paper_id]
                base_url = "api.semanticscholar.org"
                corpus_response = requests.get(
                    f"https://{base_url}/v1/paper/CorpusID:{corpus_id}"
                )
                print("[CORPUS-TITLE] " + corpus_response.json()["title"])
            
            if most_similar_reference is not None:
                ref_match_count += 1
                print("[OLD-MATCH-TITLE] " + most_similar_reference.title)
                yield BibitemMatch(
                    bibitem.id_,
                    bibitem.text,
                    most_similar_reference.s2_id,
                    most_similar_reference.title,
                )
            else:
                print("[OLD-MATCH-TITLE] " + "No Match!!!")
                logging.warning(
                    "Could not find a sufficiently similar reference for bibitem %s of paper %s",
                    bibitem.id_,
                    item.arxiv_id,
                )

        if item.bibitems:
            if ref_match_count == 0:
                logging.warning(
                    f"Paper {item.arxiv_id} has {len(item.bibitems)} reference(s), "
                    + f"but could not match any to S2 reference data."
                )
            else:
                logging.info(
                    f"Paper has {len(item.bibitems)} references, "
                    + f"able to match {ref_match_count} reference(s) to S2 data."
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
