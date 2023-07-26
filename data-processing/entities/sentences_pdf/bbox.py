"""

This is where all the functions that are used in command imported by ../__init__.py

"""

from typing import *

import json
import os
from tqdm import tqdm
import csv

from collections import defaultdict

from common.types import BoundingBox, SerializableSymbol, Context, Equation
from entities.sentences.types import Sentence
from common.bounding_box import are_intersecting

import numpy as np
import pysbd


def _bbox_to_json(bbox: BoundingBox) -> List:
    return [bbox.left, bbox.top, bbox.width, bbox.height, bbox.page]


class SppBBox:
    def __init__(self, left: float, top: float, right: float, bottom: float, page_id: int):
        self.left = left
        self.top = top
        self.right = right
        self.bottom = bottom
        self.page_id = page_id

    @staticmethod
    def normalize_spp_bbox_json(spp_bbox_json: Dict,
                                page_id: int,
                                spp_page_height: float,
                                spp_page_width: float) -> BoundingBox:
        """Simply converts a scienceparseplus JSON box into the boxes we need for scholarphi"""
        left, top, right, bottom = spp_bbox_json
        spp_bbox = SppBBox(left=left, top=top, right=right, bottom=bottom, page_id=page_id)
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
            'bbox': _bbox_to_json(bbox=self.bbox)
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
            'bboxes': [_bbox_to_json(bbox=bbox) for bbox in self.bboxes]
        }

class SentenceWithBBoxes:
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
            'bboxes': [_bbox_to_json(bbox=bbox) for bbox in self.bboxes]
        }

class RowWithBBox:
    def __init__(self, tokens: List[TokenWithBBox]):
        self.tokens = tokens
        self.text = ' '.join([t.text for t in self.tokens])
        self.bbox = self._compute_union_bbox_from_tokens()

    def __str__(self):
        return f"{self.text}    (left={self.bbox.left:.3f}, top={self.bbox.top:.3f}, width={self.bbox.width:.3f}, height={self.bbox.height:.3f}, page={self.bbox.page})"

    def __repr__(self):
        return self.__str__()

    def to_json(self) -> Dict:
        return {
            'text': self.text,
            'bbox': _bbox_to_json(bbox=self.bbox)
        }

    def _compute_union_bbox_from_tokens(self) -> BoundingBox:
        return _union_bboxes(bboxes=[token.bbox for token in self.tokens])


class Block:

    SEGMENTER = pysbd.Segmenter(language="en", clean=False, char_span=True)

    def __init__(self, tokens: List[TokenWithBBox], bbox: BoundingBox, type: str):
        self.tokens = tokens
        self.bbox = bbox
        self.type = type

        # map tokens into char index space
        self.text: str = ' '.join([t.text for t in self.tokens])
        self.token_char_spans: List[Tuple] = self._compute_token_char_spans(tokens=self.tokens)       # O(num_tokens)

        # cluster tokens into rows
        #     [[0, 1, 2], [3, 4, 5], ...] means the first 3 tokens (0, 1, 2) belong in row 0, next 3 in row 1, etc.
        self.token_row_clusters: List[List[int]] = self._cluster_tokens_by_row()

        # form rows
        self.rows = [RowWithBBox(tokens=[self.tokens[id] for id in row_token_ids]) for row_token_ids in self.token_row_clusters]

        # map sentences into char index space
        self.sent_char_spans: List[Tuple] = self._compute_sent_char_spans()         # O(num_sents)

        # cluster tokens into sentences
        #     [[0, 1, 2], [3, 4, 5], ...] means the first 3 tokens (0, 1, 2) belong in sentence 0, next 3 in sentence 1, etc.
        self.token_sent_clusters: List[List[int]] = self._cluster_tokens_by_sent()

        # form sentences
        self.sents: List[SentenceWithBBoxes] = self._build_sentences()



    def __str__(self):
        ss = '\n'.join([str(s) for s in self.rows])
        return f"**type={self.type}**\n\n{ss}"

    def __repr__(self):
        return self.__str__()

    def to_json(self) -> Dict:
        return {
            'text': self.text,
            'type': self.type,
            'tokens': [token.to_json() for token in self.tokens],
            'rows': [row.to_json() for row in self.rows],
        }

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

    def _compute_sent_char_spans(self) -> List[Tuple]:
        sent_char_spans = []
        for span in Block.SEGMENTER.segment(self.text):
            start, end, text = span.start, span.end, span.sent
            sent_char_spans.append((start, end))
        return sent_char_spans

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

    def _cluster_tokens_by_sent(self) -> List[List[int]]:
        sent_clustered_token_idx = [[] for _ in range(len(self.sent_char_spans))]
        for token_idx, (token_start, token_end) in enumerate(self.token_char_spans):
            sent_idx = self._find_sent_idx_for_this_token_char_span(token_start=token_start, token_end=token_end)
            sent_clustered_token_idx[sent_idx].append(token_idx)
        return sent_clustered_token_idx

    def _compute_sent_bboxes(self, token_sent_cluster: List[int]) -> List[BoundingBox]:
        """
        For input, you provide all the tokens belonging to this sentence.

        In this method, we keep the tokens clustered by rows, but only consider tokens that are in this sentence.
        This allows us to compute a bounding box for this row (or sub-row) to associate w/ this sentence.

        The sentence bboxes overall are then composed of all the disjoint bounding boxes for each row (or sub-row).
        """
        sent_bboxes = []
        for row in self.token_row_clusters:
            tokens_in_this_row_and_this_sent = [token_idx for token_idx in row if token_idx in token_sent_cluster]
            if tokens_in_this_row_and_this_sent:
                bboxes_to_union = []
                for i in tokens_in_this_row_and_this_sent:
                    bboxes_to_union.append(self.tokens[i].bbox)
                unioned_bbox = _union_bboxes(bboxes=bboxes_to_union)
                sent_bboxes.append(unioned_bbox)
        return sent_bboxes

    def _build_sentences(self) -> List[SentenceWithBBoxes]:
        sents = []
        for token_sent_cluster, (sent_start, sent_end) in zip(self.token_sent_clusters, self.sent_char_spans):
            sent_bboxes = self._compute_sent_bboxes(token_sent_cluster=token_sent_cluster)
            sent = SentenceWithBBoxes(text=self.text[sent_start:sent_end], bboxes=sent_bboxes)
            sents.append(sent)
        return sents

    @staticmethod
    def build_blocks_from_spp_json(infile: str) -> List['Block']:
        with open(infile) as f_in:
            page_dicts = json.load(f_in)
            blocks = []
            for page_dict in tqdm(page_dicts['layout']):
                page_height = page_dict['height']
                page_width = page_dict['width']
                page_id = page_dict['index']
                block_dicts = page_dict['layout']['bundles']
                for block_dict in block_dicts:
                    block_bbox: BoundingBox = SppBBox.normalize_spp_bbox_json(spp_bbox_json=block_dict['bbox'],
                                                                              page_id=page_id,
                                                                              spp_page_height=page_height,
                                                                              spp_page_width=page_width)
                    block_tokens: List[TokenWithBBox] = [
                        TokenWithBBox(text=token_dict['text'],
                                      bbox=SppBBox.normalize_spp_bbox_json(spp_bbox_json=token_dict['bbox'],
                                                                           page_id=page_id,
                                                                           spp_page_height=page_height,
                                                                           spp_page_width=page_width))
                        for token_dict in block_dict['tokens']
                    ]
                    block = Block(tokens=block_tokens, bbox=block_bbox, type=block_dict['type'])
                    blocks.append(block)
        return blocks


