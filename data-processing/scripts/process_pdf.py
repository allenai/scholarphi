# TODO: CONSIDER REMOVING ENTIRE FILE, doesn't look like it's even being used anymore.
#  the import upload_citations from entities.citations.util has been deleted in July 2020.

import logging
import subprocess
import sys
import time
from tempfile import TemporaryDirectory
from typing import Dict, List

import requests
from common.models import BoundingBox as BoundingBoxModel
from common.models import setup_database_connections
from common.types import (
    BoundingBox,
    CitationData,
    CitationLocation,
    Match,
    Matches,
    SerializableReference,
    Symbol,
)
from entities.citations.utils import extract_ngrams, ngram_sim, upload_citations
from entities.symbols.types import SymbolData, SymbolId, SymbolWithId
from entities.symbols.utils import upload_symbols

import pdf.grobid_client


class PdfStructureParser:
    def __init__(self, pdf_hash, structure_map):
        self.pdf_hash = pdf_hash
        self.structure_map = structure_map
        self.pages = structure_map["tokens"]["pages"]
        self.page_sizes = dict((p["page"]["pageNumber"], p["page"]) for p in self.pages)
        self.page_indices = dict(
            (p["page"]["pageNumber"], i) for i, p in enumerate(self.pages)
        )
        self.elements = structure_map["elements"]["elementTypes"]
        self.references = None

    def find_token(self, index):
        for p in self.pages:
            if index < len(p["tokens"]):
                return p["page"], p["tokens"][index]
            else:
                index -= len(p["tokens"])
        return None

    def get_text(self, spans):
        text = []
        for s in spans:
            direct = s.get("dehyphenizedText")
            if direct:
                text += direct
            else:
                for i in range(s["left"], s["right"]):
                    page, token = self.find_token(i)
                    text.append(token["text"])
        return " ".join(text)

    def union(self, bbox1: BoundingBoxModel, bbox2: BoundingBoxModel):
        if not bbox1:
            return bbox2
        if not bbox2:
            return bbox1
        x1 = min(bbox1.left, bbox2.left)
        y1 = min(bbox1.top, bbox2.top)
        x2 = max(bbox1.left + bbox1.width, bbox2.left + bbox2.width)
        y2 = max(bbox1.top + bbox1.height, bbox2.top + bbox2.height)
        return BoundingBoxModel(
            page=bbox1.page, left=x1, top=y1, width=x2 - x1, height=y2 - y1
        )

    @staticmethod
    def should_combine(bbox1: BoundingBoxModel, bbox2: BoundingBoxModel):
        return (
            bbox1.page == bbox2.page
            and (abs(bbox1.top - bbox2.top) < 4)  # Same y-coordinate
            and (abs(bbox2.left - bbox1.left - bbox1.width) < 15)  # To the right
        )

    def get_bounding_boxes(self, spans):
        bboxes = []
        for s in spans:
            bbox = None
            for i in range(s["left"], s["right"]):
                page, token = self.find_token(i)
                page_index = self.page_indices[page["pageNumber"]]
                token_bbox = BoundingBoxModel(
                    page=page_index,
                    left=token["x"],
                    top=token["y"],
                    width=token["width"],
                    height=token["height"],
                )
                if not bbox:
                    bbox = token_bbox
                elif self.should_combine(bbox, token_bbox):
                    bbox = self.union(bbox, token_bbox)
                else:
                    bboxes.append(bbox)
                    bbox = token_bbox
            if bbox:
                bboxes.append(bbox)
        return bboxes

    def find_cited_paper(self, bib_item_title):
        if self.references is None:
            resp = requests.get(
                f"https://api.semanticscholar.org/v1/paper/{self.pdf_hash}"
            )
            if resp.ok:
                self.references = resp.json()["references"]
            else:
                logging.warning(
                    "Got status %s for paper %s", resp.status_code, pdf_hash
                )
                self.references = []

        max_similarity = 0.0
        best_matching_paper = None
        for reference_data in self.references:
            reference_title = reference_data["title"]
            similarity = ngram_sim(reference_title, bib_item_title)
            if similarity > 0.5 and similarity > max_similarity:
                max_similarity = similarity
                best_matching_paper = reference_data

        return best_matching_paper

    def get_symbols(self) -> SymbolData:
        symbols_with_ids: List[SymbolWithId] = []
        boxes: Dict[SymbolId, BoundingBox] = {}
        matches: Matches = {}
        symbol_index = 0
        for sym in self.elements["<symbol>"]:
            id = sym["tags"].get("id")
            if id:
                spans = sym["spans"]
                bboxes = self.get_bounding_boxes(spans)
                mock_math_ml = "<pdf_symbol>{}</pdf_symbol>".format(id)
                symbol = Symbol([], mock_math_ml, [])
                symbol_id = SymbolId(id, None, symbol_index)
                symbols_with_ids.append(SymbolWithId(symbol_id, symbol))
                if bboxes:
                    box = bboxes[0]
                    page = self.page_sizes[box.page]
                    box.page = self.page_indices[box.page]
                    box.left /= page["width"]
                    box.top /= page["height"]
                    box.width /= page["width"]
                    box.height /= page["height"]
                    boxes[symbol_id] = box
                match = Match(mock_math_ml, mock_math_ml, 1)
                matches.setdefault(mock_math_ml, []).append(match)
                symbol_index += 1
        return SymbolData(
            arxiv_id=None,
            s2_id=pdf_hash,
            symbols_with_ids=symbols_with_ids,
            boxes=boxes,
            symbol_sentence_model_ids={},
            matches=matches,
        )

    def get_citations(self) -> CitationData:
        locations = {}
        s2_ids_of_citations = {}
        s2_data = {}

        bib_item_titles = {}
        for ref in self.elements.get("<bibItem_title>", []):
            id = ref["tags"].get("id")
            if id:
                bib_item_titles[id] = self.get_text(ref["spans"])

        citation_index = 0
        for cit in self.elements.get("<citation_marker>", []):
            ref = cit["tags"].get("ref")
            spans = cit["spans"]
            if ref:
                bib_item_title = bib_item_titles.get(ref)
                if bib_item_title:
                    cited_paper = self.find_cited_paper(bib_item_title)
                    if cited_paper:
                        cited_paper_id = cited_paper["paperId"]
                        s2_ids_of_citations[ref] = cited_paper_id
                        if cited_paper_id not in s2_data:
                            authors = ",".join(
                                a["name"] for a in cited_paper["authors"]
                            )
                            s2_data[cited_paper_id] = SerializableReference(
                                s2_id=cited_paper_id,
                                arxivId=cited_paper.get("arxivId"),
                                doi=cited_paper.get("doi"),
                                title=cited_paper.get("title"),
                                authors=authors,
                                venue=cited_paper.get("venue"),
                                year=cited_paper.get("year"),
                            )

                citation_locations = set()
                for box in self.get_bounding_boxes(spans):
                    page = self.page_sizes[box.page]
                    loc = CitationLocation(
                        key=ref,
                        cluster_index=citation_index,
                        page=self.page_indices[box.page],
                        left=box.left / page["width"],
                        top=box.top / page["height"],
                        width=box.width / page["width"],
                        height=box.height / page["height"],
                    )
                    citation_locations.add(loc)
                locations.setdefault(ref, {})[citation_index] = citation_locations

            citation_index += 1

        return CitationData(
            arxiv_id=None,
            s2_id=pdf_hash,
            citation_locations=locations,
            key_s2_ids=s2_ids_of_citations,
            s2_data=s2_data,
        )

    def upload(self):
        citations = self.get_citations()
        upload_citations(citations, "pdf-pipeline")
        symbols = self.get_symbols()
        upload_symbols(symbols, "pdf-pipeline")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    pdf_hashes = ["8c53cd64e46cf382bf81ce2c4e0087ef31351919"]
    if sys.argv[1:]:
        pdf_hashes = [s.strip() for s in open(sys.argv[1]).readlines()]

    setup_database_connections("public")
    with TemporaryDirectory() as tempdir:
        for pdf_hash in pdf_hashes:
            start_time = time.time()
            logging.info("Processing PDF %s", pdf_hash)
            try:
                pdf_file = "{}/{}.pdf".format(tempdir, pdf_hash)
                try:
                    subprocess.check_call(
                        [
                            "aws",
                            "s3",
                            "cp",
                            "s3://ai2-s2-pdfs/{}/{}.pdf".format(
                                pdf_hash[:4], pdf_hash[4:]
                            ),
                            pdf_file,
                        ]
                    )
                except:
                    subprocess.check_call(
                        [
                            "aws",
                            "s3",
                            "cp",
                            "s3://ai2-s2-pdfs-private/{}/{}.pdf".format(
                                pdf_hash[:4], pdf_hash[4:]
                            ),
                            pdf_file,
                        ]
                    )
                s = pdf.grobid_client.get_pdf_structure(pdf_file)
                PdfStructureParser(pdf_hash, s).upload()
                logging.info("Finished in %s second", time.time() - start_time)
            except Exception:
                logging.exception("Error processing {}".format(pdf_hash))
