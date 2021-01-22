"""


"""

from typing import *

import json
import os
from tqdm import tqdm

from common.bounding_box import BoundingBox
from collections import defaultdict

import numpy as np

import spacy
nlp = spacy.load("en_core_sci_md")


with open('paper_arxiv_v4.json') as f_in:
    page_dicts = json.load(f_in)

# unique block types:
# {'paragraph', 'figure', 'table', 'reference', 'section', 'title', 'abstract', 'caption', 'equation', 'list', 'author', 'footer'}



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
        return f"{self.text}\t(left={self.bbox.left:.3f}, top={self.bbox.top:.3f}, width={self.bbox.width:.3f}, height={self.bbox.height:.3f}, page={self.bbox.page})"

    def __repr__(self):
        return self.__str__()


class BlockWithBbox:
    def __init__(self, tokens: List[TokenWithBBox], bbox: BoundingBox, type: str):
        self.tokens = tokens
        self.bbox = bbox
        self.type = type

        self.text = ' '.join([t.text for t in self.tokens])
        self.token_char_spans = self.compute_token_char_spans()
        self.sent_char_spans = self.compute_sent_char_spans()
        self.sents = [self.text[start:end] for start, end in self.sent_char_spans]

        # [[0, 1, 2], [3, 4, 5], [6, 7, 8]] means the first 3 tokens (0, 1, 2) belong in sentence 0, next 3 in sentence 1, etc.
        self.token_sent_clusters = self.cluster_tokens_by_sents()

        

    def compute_sent_char_spans(self) -> List[Tuple]:
        sent_char_spans = []
        start = 0
        doc = nlp(self.text)
        for i in range(1, len(doc)):
            if doc[i].is_sent_start:
                end = doc[i - 1].idx + len(doc[i - 1].text)
                sent_char_spans.append((start, end))
                start = doc[i].idx
        return sent_char_spans

    def compute_token_char_spans(self) -> List[Tuple]:
        # TODO; this only works because all tokens are whitespace delim  (hence only +1)
        token_char_spans = []
        start = 0
        for t in self.tokens:
            end = start + len(t.text)
            token_char_spans.append((start, end))
            start = end + 1
        return token_char_spans

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

    def cluster_tokens_by_sents(self) -> List[List[int]]:
        sent_clustered_token_idx = [[] for _ in range(len(self.sents))]
        for token_idx, (token_start, token_end) in enumerate(self.token_char_spans):
            sent_idx = self._find_sent_idx_for_this_token_char_span(token_start=token_start, token_end=token_end)
            sent_clustered_token_idx[sent_idx].append(token_idx)
        return sent_clustered_token_idx


def normalize_spp_bbox_json(spp_bbox_json: Dict, page_id: int, spp_page_height: float, spp_page_width: float) -> BoundingBox:
    left, top, right, bottom = spp_bbox_json
    spp_bbox = SppBbox(left=left, top=top, right=right, bottom=bottom, page_id=page_id)
    return BoundingBox(left=spp_bbox.left / spp_page_width,
                       top=spp_bbox.top / spp_page_height,
                       width=(spp_bbox.right - spp_bbox.left) / spp_page_width,
                       height=(spp_bbox.bottom - spp_bbox.top) / spp_page_height,
                       page=spp_bbox.page_id)



def process_page(page_dict: dict) -> dict:
    page_height = page_dict['height']
    page_width = page_dict['width']
    page_id = page_dict['index']
    block_dicts = page_dict['layout']['bundles']  # wtf are remaining_tokens?

    for block_dict in block_dicts:
        # TODO: not used for anything right now... but maybe later (block ordering is currently out of order)
        block_bbox: BoundingBox = normalize_spp_bbox_json(spp_bbox_json=block_dict['bbox'],
                                                          page_id=page_id,
                                                          spp_page_height=page_height,
                                                          spp_page_width=page_width)
        block_type = block_dict['type']
        block_tokens: List[TokenWithBBox] = [
            TokenWithBBox(
                text=token_dict['text'],
                bbox=normalize_spp_bbox_json(spp_bbox_json=token_dict['bbox'],
                                             page_id=page_id,
                                             spp_page_height=page_height,
                                             spp_page_width=page_width)
            )
            for token_dict in block_dict['tokens']
        ]


        block = BlockWithBbox(tokens=block_tokens, bbox=block_bbox, type=block_type)

        # TODO: stopped here -- double-checking that the token clusters form proper sentences
        for sent_idx, token_sent_cluster in enumerate(block.token_sent_clusters):
            print(f"\tSent {sent_idx}\t{' '.join([block.tokens[token_idx].text for token_idx in token_sent_cluster])}")

        # TODO; to get proper bbox clusters for sents, need to group token bboxes into rows



for page_dict in tqdm(page_dicts):
    page_text = process_page(page_dict=page_dict)
    if page_text['sections']:
        print('******' + str(page_text['sections']) + '**********\n')
    print('-------------')
    print('\n'.join(page_text['paragraphs']))
    print('-------------')


for paragraph in paragraphs:
    print(paragraph)
