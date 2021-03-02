"""

1) Clone https://github.com/allenai/scienceparseplus
2)
3) For the SSH capabilities...
   sudo docker build -t scienceparseplus .
   sudo docker run -dit scienceparseplus
   sudo docker ps -a
   sudo docker exec -it $NAME /bin/bash

4) For the running stuff capabilities...
   sudo docker run -it scienceparseplus
   cd tools/
   mkdir jsons/

   sudo docker ps -a     >>>   elegant_villani
   DOCKER_CONTAINER_NAME=elegant_villani
   sudo docker cp pdfs/ $DOCKER_CONTAINER_NAME:/usr/local/src/spp/tools/pdfs/

   python inference.py --indir pdfs/ --outdir jsons/

    sudo docker cp  $DOCKER_CONTAINER_NAME:/usr/local/src/spp/tools/jsons/ jsons/

5) For uploading them to DB



# if building scholarphi docker thing w/ zejiang's private repo:
export GITHUB_ACCESS_TOKEN=#something_in_lastpass
sudo docker build -t reader --build-arg GITHUB_ACCESS_TOKEN=$GITHUB_ACCESS_TOKEN .



"""

from typing import *

import json
import os
from tqdm import tqdm
import csv

from collections import defaultdict

import numpy as np
from functools import cmp_to_key

import psycopg2

from argparse import ArgumentParser

import requests

from entities.sentences import upload
from common.types import EntityUploadInfo, BoundingBox, FloatRectangle
from common.models import Paper, Version, setup_database_connections
from common.models import Entity as EntityModel, EntityData as EntityDataModel, BoundingBox as BoundingBoxModel
from common.bounding_box import are_intersecting
from peewee import fn

import spacy
nlp = spacy.load("en_core_sci_md")


def bbox_to_json(bbox: BoundingBox) -> List:
    return [bbox.left, bbox.top, bbox.width, bbox.height, bbox.page]

class SppBbox:
    def __init__(self, left: float, top: float, right: float, bottom: float, page_id: int):
        self.left = left
        self.top = top
        self.right = right
        self.bottom = bottom
        self.page_id = page_id

class TokenWithBBox:
    def __init__(self, text: str, bbox: BoundingBox):
        self.text = text
        self.bbox = bbox

    def __str__(self):
        return f"{self.text}    (left={self.bbox.left:.3f}, top={self.bbox.top:.3f}, width={self.bbox.width:.3f}, height={self.bbox.height:.3f}, page={self.bbox.page})"

    def __repr__(self):
        return self.__str__()

    def to_json(self) -> Dict:
        return {
            'text': self.text,
            'bbox': bbox_to_json(bbox=self.bbox)
        }

class SymbolWithBBoxes:
    def __init__(self, text: str, bboxes: List[BoundingBox]):
        self.text = text
        self.bboxes = bboxes

    def __str__(self):
        s = ''
        for bbox in self.bboxes:
            s += f"    (left={bbox.left:.2f}, top={bbox.top:.2f}, width={bbox.width:.2f}, height={bbox.height:.2f}, page={bbox.page})\n"
        return f"text={self.text}\n{s}"

    def __repr__(self):
        return self.__str__()

    def to_json(self) -> Dict:
        return {
            'text': self.text,
            'bboxes': [bbox_to_json(bbox=bbox) for bbox in self.bboxes]
        }

class SentenceWithBbox:
    def __init__(self, text: str, bboxes: List[BoundingBox]):
        self.text = text
        self.bboxes = bboxes

    def __str__(self):
        s = ''
        for bbox in self.bboxes:
            s += f"    (left={bbox.left:.2f}, top={bbox.top:.2f}, width={bbox.width:.2f}, height={bbox.height:.2f}, page={bbox.page})\n"
        return f"text={self.text}\n{s}"

    def __repr__(self):
        return self.__str__()

    def to_json(self) -> Dict:
        return {
            'text': self.text,
            'bboxes': [bbox_to_json(bbox=bbox) for bbox in self.bboxes]
        }

class Block:
    def __init__(self, tokens: List[TokenWithBBox],
                 symbol_id_to_symbol: Dict[int, SymbolWithBBoxes],
                 token_to_symbol_alignments: Dict[int, Dict],
                 bbox: BoundingBox,
                 type: str):
        self.tokens = tokens
        self.symbol_id_to_symbol = symbol_id_to_symbol
        self.token_to_symbol_alignments = token_to_symbol_alignments
        self.bbox = bbox
        self.type = type

        # 1) map tokens into char index space
        self.text: str = ' '.join([t.text for t in self.tokens])
        self.token_char_spans: List[Tuple] = self._compute_token_char_spans(tokens=self.tokens)       # O(num_tokens)

        #    cluster tokens into rows
        #       [[0, 1, 2], [3, 4, 5], ...] means the first 3 tokens (0, 1, 2) belong in row 0, next 3 in row 1, etc.
        self.token_row_clusters: List[List[int]] = self._cluster_tokens_by_row()

        # 2) re-compute row clusters with symbols & tokens
        self._token_symbol_ids_by_row: List[List[Dict]] =  self._insert_symbols_into_rows()

        # 3) re-compute tokens, text, token_spans, row clusters in accordance to Union[Token, Symbol] lists.
        self.texified_tokens: List[Union[TokenWithBBox, SymbolWithBBoxes]] = []
        for row in self._token_symbol_ids_by_row:
            for d in row:
                if d['type'] == 'token':
                    self.texified_tokens.append(self.tokens[d['id']])
                elif d['type'] == 'symbol':
                    self.texified_tokens.append(self.symbol_id_to_symbol[d['id']])

        self.texified_text: str = ' '.join([t.text for t in self.texified_tokens])
        self.texified_token_char_spans: List[Tuple] = self._compute_token_char_spans(tokens=self.texified_tokens)  # O(num_tokens)

        self.texified_token_row_clusters: List[List[int]] = []
        i = 0
        for row in self._token_symbol_ids_by_row:
            r = []
            for _ in row:
                r.append(i)
                i += 1
            self.texified_token_row_clusters.append(r)

        # 4) use new text w/ symbols to compute sentences.  represent sentences as char indicies.
        self.symbol_char_spans = self._compute_symbol_char_spans()                  # O(num_symbols);  used to enforce sentences dont split symbol boundaries
        self.sent_char_spans: List[Tuple] = self._compute_sent_char_spans()         # O(num_sents)

        #    use these spans to align tokens to sentences
        #       [[0, 1, 2], [3, 4, 5], ...] means the first 3 tokens (0, 1, 2) belong in sentence 0, next 3 in sentence 1, etc.
        self.texified_token_sent_clusters: List[List[int]] = self._cluster_texified_tokens_by_sents()

        # 5) using the rows, compute bboxes for sentences
        self.sents: List[SentenceWithBbox] = self._build_sentences()

    def __str__(self):
        ss = '\n'.join([str(s) for s in self.sents])
        return f"**type={self.type}**\n\n{ss}"

    def __repr__(self):
        return self.__str__()

    def to_json(self) -> Dict:
        return {
            'text': self.text,
            'type': self.type,
            'tokens': [token.to_json() for token in self.tokens],
            'sents': [sent.to_json() for sent in self.sents],
        }

    #
    #   Methods for step (1)
    #

    def _compute_token_char_spans(self, tokens: List[Union[TokenWithBBox, SymbolWithBBoxes]]) -> List[Tuple]:
        # TODO; this only works because all tokens are whitespace delim  (hence start = end + 1)
        token_char_spans = []
        start = 0
        for t in tokens:
            end = start + len(t.text)
            token_char_spans.append((start, end))
            start = end + 1
        return token_char_spans

    # TODO: ther'es probably a better way to solve this clustering problem as an optim problem.
    #       for example, slide up bboxes into grid points & collapse into a y-coord-wise histogram.
    #       dense regions are rows & sparse regions are sep.  then use dbscan or k-means or mean shift (based on y-coord
    # TODO: also, can consider using symbols instead of tokens to help induce better row bboxes.
    # TODO: alsoo, this processes in sequential reading order.  maybe can make order agnostic?
    def _cluster_tokens_by_row(self) -> List[List[int]]:
        # cluster incrementally O(num_tokens)
        clusters = [[0]]
        for token_idx in range(1, len(self.tokens)):
            current_token = self.tokens[token_idx]
            prev_token = self.tokens[token_idx - 1]
            if _are_same_row(bbox1=prev_token.bbox, bbox2=current_token.bbox):
                clusters[-1].append(token_idx)
            else:
                clusters.append([token_idx])
        return clusters

    #
    #   Methods for step (2)
    #

    def _insert_symbols_into_rows(self) -> List[List[Dict]]:
        """Ok, now we have these rows.  Let's keep the same rows, but replace tokens with symbols."""
        new_rows = []
        for row_token_ids in self.token_row_clusters:
            new_row = []
            for token_id in row_token_ids:
                # check what to do with this token (keep it? replace it for symbol? delete it?)
                code = self.token_to_symbol_alignments[token_id]['code']
                if code == 'no_change':
                    new_row.append({'type': 'token', 'id': token_id})
                elif code == 'deleted':
                    continue
                elif code == 'inserted':
                    for symbol_id in self.token_to_symbol_alignments[token_id]['symbol_ids']:
                        symbol = self.symbol_id_to_symbol[symbol_id]
                        new_row.append({'type': 'symbol', 'id': symbol_id})
            new_rows.append(new_row)
        return new_rows


    #
    #   Methods for step (4)
    #

    def _compute_symbol_char_spans(self) -> List[Tuple]:
         return [span for t, span in zip(self.texified_tokens, self.texified_token_char_spans) if isinstance(t, SymbolWithBBoxes)]

    def _compute_sent_char_spans(self) -> List[Tuple]:
        sent_char_spans = []
        start = 0
        doc = nlp(self.texified_text)
        for i in range(1, len(doc)):
            if doc[i].is_sent_start:
                end = doc[i - 1].idx + len(doc[i - 1].text)
                if self._is_good_sent(sent_start=start, sent_end=end):
                    sent_char_spans.append((start, end))
                    start = doc[i].idx
        # handle ending
        sent_char_spans.append((start, len(self.texified_text)))
        return sent_char_spans

    def _is_good_sent(self, sent_start: int, sent_end: int) -> bool:
        """
            Good:
                [This is a $symbol$.] [This is another $symbol$.]
            Bad:
                [This is a $sym]b[ol$. This is another $symbol$.]
        """
        for symbol_start, symbol_end in self.symbol_char_spans:
            if symbol_start < sent_start < symbol_end:      # its ok if sentence starts AT symbol start.  also ok if sentence starts immediately after symbol ends.
                return False
            if symbol_start < sent_end < symbol_end:        # TODO: double-check these boundary conditions
                return False
        return True

    def _find_sent_idx_for_this_token_char_span(self, token_start: int, token_end: int) -> int:
        # quantifies how much of token "sticks out" of the sentence boundary, for each sentence
        leftovers_per_sent = []
        for sent_start, sent_end in self.sent_char_spans:
            # penalize case where token start is left of sent start
            start_leftover = max(sent_start - token_start, 0)
            # penalize case where token end is right of sent end
            end_leftover = max(token_end - sent_end, 0)
            leftovers_per_sent.append(start_leftover + end_leftover)

        # find best matching sentence for this token
        idx_best_sent = np.argmin(leftovers_per_sent)
        return int(idx_best_sent)

    def _cluster_texified_tokens_by_sents(self) -> List[List[int]]:
        sent_clustered_token_idx = [[] for _ in range(len(self.sent_char_spans))]
        for token_idx, (token_start, token_end) in enumerate(self.texified_token_char_spans):
            sent_idx = self._find_sent_idx_for_this_token_char_span(token_start=token_start, token_end=token_end)
            sent_clustered_token_idx[sent_idx].append(token_idx)
        return sent_clustered_token_idx

    #
    #   Methods for step (5)
    #

    def _compute_sent_bboxes(self, token_sent_cluster: List[int]) -> List[BoundingBox]:
        """
        For input, you provide all the tokens belonging to this sentence.

        In this method, we keep the tokens clustered by rows, but only consider tokens that are in this sentence.
        This allows us to compute a bounding box for this row (or sub-row) to associate w/ this sentence.

        The sentence bboxes overall are then composed of all the disjoint bounding boxes for each row (or sub-row).
        """
        sent_bboxes = []
        for row in self.texified_token_row_clusters:
            tokens_in_this_row_and_this_sent = [token_idx for token_idx in row if token_idx in token_sent_cluster]
            if tokens_in_this_row_and_this_sent:
                bboxes_to_union = []
                for i in tokens_in_this_row_and_this_sent:
                    if isinstance(self.texified_tokens[i], TokenWithBBox):
                        bboxes_to_union.append(self.texified_tokens[i].bbox)
                    elif isinstance(self.texified_tokens[i], SymbolWithBBoxes):
                        for bbox in self.texified_tokens[i].bboxes:
                            bboxes_to_union.append(bbox)
                unioned_bbox = _union_bboxes(bboxes=bboxes_to_union)
                sent_bboxes.append(unioned_bbox)
        return sent_bboxes

    def _build_sentences(self) -> List[SentenceWithBbox]:
        sents = []
        for token_sent_cluster, (sent_start, sent_end) in zip(self.texified_token_sent_clusters, self.sent_char_spans):
            sent_bboxes = self._compute_sent_bboxes(token_sent_cluster=token_sent_cluster)
            sent = SentenceWithBbox(text=self.texified_text[sent_start:sent_end], bboxes=sent_bboxes)
            sents.append(sent)
        return sents

def normalize_spp_bbox_json(spp_bbox_json: Dict, page_id: int, spp_page_height: float, spp_page_width: float) -> BoundingBox:
    """Simply converts a scienceparseplus JSON box into the boxes we need for scholarphi"""
    left, top, right, bottom = spp_bbox_json
    spp_bbox = SppBbox(left=left, top=top, right=right, bottom=bottom, page_id=page_id)
    return BoundingBox(left=spp_bbox.left / spp_page_width,
                       top=spp_bbox.top / spp_page_height,
                       width=(spp_bbox.right - spp_bbox.left) / spp_page_width,
                       height=(spp_bbox.bottom - spp_bbox.top) / spp_page_height,
                       page=spp_bbox.page_id)

def _are_same_row(bbox1: BoundingBox, bbox2: BoundingBox) -> bool:
    """Taken from https://github.com/allenai/scholarphi/blob/381eea6cf540fdc130fc10f032b883fa0ef64af4/data-processing/pdf/process_pdf.py#L61"""
    return bbox1.page == bbox2.page and (
        abs(bbox1.top - bbox2.top) < 0.01  # Same y-coordinate
    ) #and (
        # abs(bbox2.left - bbox1.left - bbox1.width) < 0.05     # To the right
    # )

def _union_bboxes(bboxes: List[BoundingBox]) -> BoundingBox:
    """Taken from https://github.com/allenai/scholarphi/blob/381eea6cf540fdc130fc10f032b883fa0ef64af4/data-processing/pdf/process_pdf.py#L48"""
    assert len({bbox.page for bbox in bboxes}) == 1
    x1 = min([bbox.left for bbox in bboxes])
    y1 = min([bbox.top for bbox in bboxes])
    x2 = max([bbox.left + bbox.width for bbox in bboxes])
    y2 = max([bbox.top + bbox.height for bbox in bboxes])
    return BoundingBox(page=bboxes[0].page, left=x1, top=y1, width=x2 - x1, height=y2 - y1)

def are_bboxes_intersecting(bboxes1: List[BoundingBox], bboxes2: List[BoundingBox]) -> bool:
    """Useful for checking overlap between things that have collections of bounding boxes"""
    bools = []
    for bbox1 in bboxes1:
        for bbox2 in bboxes2:
            check_boxes = are_intersecting(rect1=bbox1, rect2=bbox2)
            check_page = bbox1.page == bbox2.page
            bools.append(check_boxes and check_page)
    return any(bools)

# def sort_blocks(blocks: List[Block]) -> List[Block]:
#     sorted_blocks = sorted(
#         blocks, key=cmp_to_key(lambda x, y: 1 if block.bbox.page < block.bbox.page else (
#             1 if block.bbox.left < block.bbox.left else (
#                 1 if block.bbox.
#             )
#         ))
#     )

def get_max_version(arxiv_id: str, schema: str) -> int:
    setup_database_connections(schema)
    version_number = (
        Version.select(fn.Max(Version.index))
        .join(Paper)
        .where(Paper.arxiv_id == arxiv_id)
        .scalar()
    )
    if version_number is None:
        raise Exception(f"There are no entities for paper {arxiv_id} in database schema {schema}")
    else:
        return int(version_number)

class S2DBIterator(object):
    def __init__(self, query_text: str, db_config: dict):
        self.query_text = query_text
        self.db_config = db_config

    def __iter__(self):
        try:
            with psycopg2.connect(**self.db_config) as conn:
                with conn.cursor() as cursor:
                    cursor.execute(self.query_text)
                    while True:
                        records = cursor.fetchmany(1000)
                        if not records:
                            break
                        for row in records:
                            yield row

        except psycopg2.DatabaseError as e:
            print('Database error!')
            raise e

def fetch_paper_id_mappings(schema: str, db_config) -> Dict[str, str]:
    query = f"""
    set search_path to {schema};

    select arxiv_id, s2_id
    from paper;
    """
    iterator = S2DBIterator(query_text=query, db_config=db_config)
    arxiv_id_to_s2_id = {}
    for arxiv_id, s2_id in iterator:
        arxiv_id_to_s2_id[arxiv_id] = s2_id
    return arxiv_id_to_s2_id

def fetch_symbols_from_reader(arxiv_id: str, schema: str, version: int, db_config) -> Dict[int, SymbolWithBBoxes]:
    query = f"""
    set search_path to {schema};
    
    select e.id, e.type, b.left, b.top, b.width, b.height, b.page, ed.key, ed.value
    from entity e
    join paper on e.paper_id = paper.s2_id
    join boundingbox b on e.id = b.entity_id
    join entitydata ed on e.id = ed.entity_id
    where paper.arxiv_id = '{arxiv_id}' and e.type in ('symbol') and ed.key = 'tex' and e.version = {version};
    """
    iterator = S2DBIterator(query_text=query, db_config=db_config)
    entity_id_to_tex_bboxes = defaultdict(list)
    for row in iterator:
        entity_id, _, bl, bt, bw, bh, page, _, tex = row
        entity_id_to_tex_bboxes[entity_id].append((tex, BoundingBox(left=bl, top=bt, width=bw, height=bh, page=page)))
    entity_id_to_symbol = {}
    for entity_id, tex_bboxes in entity_id_to_tex_bboxes.items():
        if len({tex for tex, bbox in tex_bboxes}) > 1:  # just a verification, but the TeX should be the same across all bboxes of same entity
            raise Exception
        entity_id_to_symbol[entity_id] = SymbolWithBBoxes(text=tex_bboxes[0][0], bboxes=[bbox for tex, bbox in tex_bboxes])
    return entity_id_to_symbol

def fetch_children_from_reader(arxiv_id: str, schema: str, version: int, db_config) -> Dict[int, List[int]]:
    query = f"""
    set search_path to {schema};

    select e.id, e.type, ed.key, ed.value
    from entity e
    join paper on e.paper_id = paper.s2_id
    join entitydata ed on e.id = ed.entity_id
    where paper.arxiv_id = '{arxiv_id}' and e.type in ('symbol') and ed.key = 'children' and e.version = {version};
    """
    iterator = S2DBIterator(query_text=query, db_config=db_config)
    entity_id_to_children_ids = defaultdict(list)
    for row in iterator:
        entity_id, _, _, child_id = row
        entity_id_to_children_ids[entity_id].append(int(child_id))      # for some reason, they come out as strings
    return entity_id_to_children_ids

def align_tokens_to_symbols(tokens: List[TokenWithBBox], symbol_id_to_symbol: Dict[int, SymbolWithBBoxes]) -> Dict[int, Dict]:
    """
    # Case A:   1 token aligns w/ 1 symbol exactly  -->  Simple case.  Identify token.  Replace with symbol.
    # Case B:   1 token aligns w/ 2+ symbols        -->  Identify token.  Keep memory of ALL symbols for inserting.
    # Case C:   2+ tokens align w/ 1 symbol         -->  Identify all tokens for removal.  But also use list of already-staged symbols to insert ONCE.
    # Case D:   2+ tokens align w/ 2+ symbols


    Output:
        token --> <inserted> [symbol 1, symbol 2, ..]
        token --> <deleted>
        token --> <no change>

    also returns unaligned symbol IDs
    """
    already_inserted_symbol_ids = set()
    token_to_symbol_alignments = {}
    for i, token in enumerate(tokens):
        symbol_ids = []
        for symbol_id, symbol in symbol_id_to_symbol.items():
            if are_bboxes_intersecting(bboxes1=symbol.bboxes, bboxes2=[token.bbox]):
                if symbol_id in already_inserted_symbol_ids:
                    symbol_ids.append(None)      # used as placeholder to mean that this token overlaps w/ a symbol, but that symbol was already used
                else:
                    symbol_ids.append(symbol_id)
                    already_inserted_symbol_ids.add(symbol_id)
        # no matches
        if len(symbol_ids) == 0:
            token_to_symbol_alignments[i] = {'code': 'no_change'}
        else:
            symbol_ids = [s for s in symbol_ids if s is not None]
            if len(symbol_ids) == 0:
                token_to_symbol_alignments[i] = {'code': 'deleted'}
            else:
                token_to_symbol_alignments[i] = {'code': 'inserted', 'symbol_ids': symbol_ids}
    return token_to_symbol_alignments

def process_page_for_blocks(page_dict: Dict, symbol_id_to_symbol: Dict[int, SymbolWithBBoxes]) -> List[Block]:
    page_height = page_dict['height']
    page_width = page_dict['width']
    page_id = page_dict['index']
    block_dicts = page_dict['layout']['bundles']  # wtf are remaining_tokens?

    blocks: List[Block] = []
    for block_dict in block_dicts:
        block_bbox: BoundingBox = normalize_spp_bbox_json(spp_bbox_json=block_dict['bbox'],
                                                          page_id=page_id,
                                                          spp_page_height=page_height,
                                                          spp_page_width=page_width)
        block_tokens: List[TokenWithBBox] = [
            TokenWithBBox(text=token_dict['text'],
                          bbox=normalize_spp_bbox_json(spp_bbox_json=token_dict['bbox'],
                                                       page_id=page_id,
                                                       spp_page_height=page_height,
                                                       spp_page_width=page_width))
            for token_dict in block_dict['tokens']
        ]
        token_to_symbol_alignments = align_tokens_to_symbols(tokens=block_tokens,
                                                             symbol_id_to_symbol=symbol_id_to_symbol)

        block = Block(tokens=block_tokens,
                      symbol_id_to_symbol=symbol_id_to_symbol,
                      token_to_symbol_alignments=token_to_symbol_alignments,
                      bbox=block_bbox,
                      type=block_dict['type'])
        blocks.append(block)

    # TODO: blocks are currently out of reading order.  maybe do some processing here.

    return blocks


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("--indir", help="Path to input Scienceparse+ JSONs", required=True, type=str)
    parser.add_argument("--outdir", help="Path to output JSON files", required=True, type=str)
    parser.add_argument("--upload", help="Flag to upload", action="store_true")
    args = parser.parse_args()

    class Args:
        pass
    args = Args()
    args.indir = '/data-processing/scienceparseplus/jsons/'
    args.upload = False



    # get paper info
    arxiv_id_to_s2_id = fetch_paper_id_mappings(schema='gold', db_config=DB_CONFIG_READER)

    # for each paper
    arxiv_id_to_pages = defaultdict(list)
    for fname in os.listdir(args.indir):

        arxiv_id = fname.replace('.json', '')
        s2_id = arxiv_id_to_s2_id.get(arxiv_id)
        if not s2_id:
            print(f'{arxiv_id} has a SPP JSON, but does not have {s2_id} in `gold` schema. Skipping...')
            continue

        # get gold symbol info
        max_version = get_max_version(arxiv_id=arxiv_id, schema='gold')
        symbol_id_to_symbol = fetch_symbols_from_reader(arxiv_id=arxiv_id, schema='gold', version=max_version, db_config=DB_CONFIG_READER)
        parent_id_to_children_ids = fetch_children_from_reader(arxiv_id=arxiv_id, schema='gold', version=max_version, db_config=DB_CONFIG_READER)

        # [Optional Sanity Check]  can we verify that every parent/child ID exists in the larger symbol ID collection?  (e.g. previously saw entity 46841 in 1805.08092 version 0 had no bbox)
        symbol_ids_without_bboxes = set()
        for parent_id, children_ids in parent_id_to_children_ids.items():
            if parent_id not in symbol_id_to_symbol:
                symbol_ids_without_bboxes.add(parent_id)
            for child_id in children_ids:
                if child_id not in symbol_id_to_symbol:
                    symbol_ids_without_bboxes.add(child_id)
        for symbol_id in symbol_ids_without_bboxes:
            print(f'Symbol {symbol_id} missing bbox for {arxiv_id} version {max_version}...')

        # for now, remove any children wout bboxes
        for parent_id, children_ids in parent_id_to_children_ids.items():
            parent_id_to_children_ids[parent_id] = [child_id for child_id in children_ids if child_id not in symbol_ids_without_bboxes]

        # [Optional Sanity Check]  can we verify that each children's bbox is within the parent's bbox?
        for parent_id, parent_symbol in symbol_id_to_symbol.items():
            for child_id in parent_id_to_children_ids.get(parent_id, []):
                child_symbol = symbol_id_to_symbol[child_id]
                if not are_bboxes_intersecting(bboxes1=parent_symbol.bboxes, bboxes2=child_symbol.bboxes):
                    print(f'{parent_symbol} and {child_symbol} do not intersect...')

        # [Optional Sanity Check]  can a symbol have bboxes spanning multiple pages?  not an error, but just unfortunate because then it'd be assigned multiple blocks...
        for symbol_id, symbol in symbol_id_to_symbol.items():
            if len({bbox.page for bbox in symbol.bboxes}) > 1:
                print(f'{symbol} spans multiple pages...')

        # TODO:
        #       here, we're considering parent symbols.  but this means dealing w/ multiple bboxes per symbol cuz some will span rows.
        #       Alternatively, we can try children only.  this means we can PROBABLY work w/ union of bboxes for all child symbols, and not have to deal w/ multipel bboxes per symbol
        #       but could run risk of not overlapping token stream comprehensively.  Need to test both.

        # cleanup:   (1) filter all symbols to only parent symbols
        #            (2) ??
        children_ids = {child_id for parent_id, children_ids in parent_id_to_children_ids.items() for child_id in children_ids}
        symbol_id_to_symbol = {symbol_id: symbol for symbol_id, symbol in symbol_id_to_symbol.items() if symbol_id not in children_ids}

        # TODO: need to remember to add children assoc to sentences after all this
        # read Spp JSON output from parser & organize into pages & blocks
        infile = os.path.join(args.indir, fname)
        with open(infile) as f_in:
            page_dicts = json.load(f_in)
            pages: List[List[Block]] = []
            for page_dict in tqdm(page_dicts['layout']):
                page = process_page_for_blocks(page_dict=page_dict, symbol_id_to_symbol=symbol_id_to_symbol)
                pages.append(page)

        # TODO:  can we sanity check for symbols that span multiple blocks? multiple cols? multiple pages?

        # [optional] upload sentence entitites
        if args.upload:
            setup_database_connections(schema_name='kyle_spp', create_tables=False)  # first time run this, set create to True
            entity_infos = []
            for page_idx, page in enumerate(pages):
                for block_idx, block in enumerate(page):
                    for sent_idx, sent in enumerate(block.sents):
                        entity_info = EntityUploadInfo(id_=f"{page_idx}-{block_idx}-{sent_idx}",
                                                       type_="sentence",
                                                       bounding_boxes=sent.bboxes,
                                                       data={"text": sent.text, "tex": sent.text, "tex_start": -1, "tex_end": -1})
                        entity_infos.append(entity_info)
            upload.upload_entities(s2_id=s2_id,
                                   arxiv_id=arxiv_id,
                                   entities=entity_infos,
                                   data_version=None)  # uploads to next version
