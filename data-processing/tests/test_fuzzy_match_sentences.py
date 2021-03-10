from typing import *
import json
from tqdm import tqdm


import string

from collections import defaultdict

from common import file_utils
from common.types import EntityLocationInfo
from common.types import BoundingBox, SerializableSymbol, Context, Equation
from entities.sentences.types import Sentence
from entities.sentences.pdf_stuff import SppBBox, TokenWithBBox, SymbolWithBBoxes, SentenceWithBBoxes, \
    RowWithBBox, Block, are_bboxes_intersecting


import numpy as np
from scipy.optimize import linear_sum_assignment


def compute_best_alignments(x: List[str], y: List[str], sim: Callable[[Any, Any], Union[bool, int, float]]) -> Tuple[float, List[Tuple[int, Any]]]:
    """Uses Hungarian algorithm (Kuhn) to compute globally optimal pairwise
    alignments between items in lists `x` and `y`, where `sim` computes
    the score of a pairing `x_i` and `y_i`.
    """

    # similarity matrix
    sim_matrix = np.array([[sim(xi, yj) for yj in y] for xi in x])

    # negative sign here because scipy implementation minimizes sum of weights
    index_x, index_y = linear_sum_assignment(-1.0 * sim_matrix)

    # results
    best_alignment_indices = [(i, j) for i, j in zip(index_x, index_y)]
    score_best_alignment = sim_matrix[index_x, index_y].sum()

    return score_best_alignment, best_alignment_indices

def compute_best_alignments_with_threshold(x: List[str], y: List[str], sim: Callable, threshold: float) -> Tuple[float, List[Tuple[int, int]]]:
    """Wrapper around `compute_best_alignments` that removes any alignment
    whose similarity score falls below a threshold"""
    _, raw_alignments = compute_best_alignments(x=x, y=y, sim=sim)

    clean_alignments = []
    score = 0
    for i, j in raw_alignments:
        sim_ij = sim(x[i], y[j])
        if sim_ij > threshold:
            score += sim_ij
            clean_alignments.append((i, j))

    return score, clean_alignments

def tokenized_sentence_similarity(x: List[str], y: List[str]) -> float:
    sx = {xi for xi in x if xi not in string.punctuation}
    sy = {yi for yi in y if yi not in string.punctuation}
    if len(sx) == 0 or len(sy) == 0:
        return 0.0
    jaccard = len(sx.intersection(sy)) / len(sx.union(sy))
    contain_jaccard = len(sx.intersection(sy)) / min(len(sx), len(sy))
    if jaccard + contain_jaccard == 0.0:
        return 0.0
    else:
        return 2 * jaccard * contain_jaccard / (jaccard + contain_jaccard)

def compute_ngrams(s: str, n: int = 5, k: int = 3) -> List[str]:
    # lower
    s = s.lower().strip()
    # remove punctuation and spaces
    s = ''.join([si for si in s if si.strip() not in string.punctuation or si.strip() != ''])
    # ngrams
    ngrams = [s[i:i + n] for i in range(len(s) - n + 1) if i % k == 0]
    return ngrams


PIPELINE_DIRPATH: str = '/data-processing/data'
ARXIV_ID: str = '1601.00978'
SPP_JSONPATH: str = '/data-processing/scienceparseplus/jsons/1601.00978.json'

NGRAM_WIDTH: int = 5
NGRAM_STRIDE: int = 1
ROW_MATCH_THRESHOLD: float = 20.0


def load_locations(arxiv_id: str, dirname: str) -> Optional[Dict[str, List[BoundingBox]]]:
    import os
    """
    Load bounding boxes for each entity. Entities can have multiple bounding boxes (as will
    be the case if they are split over multiple lines).
    """
    entity_id_to_bboxes: Dict[str, List[BoundingBox]] = defaultdict(list)
    bounding_boxes_path = os.path.join(dirname, arxiv_id, "entity_locations.csv")
    for hue_info in file_utils.load_from_csv(bounding_boxes_path, EntityLocationInfo):
        box = BoundingBox(
            page=hue_info.page,
            left=hue_info.left,
            top=hue_info.top,
            width=hue_info.width,
            height=hue_info.height,
        )
        entity_id_to_bboxes[hue_info.entity_id].append(box)

    return entity_id_to_bboxes



if __name__ == '__main__':

    #
    #
    #           LOAD STUFF
    #
    #

    sentences = list(file_utils.load_from_csv(f'{PIPELINE_DIRPATH}/19-detected-sentences/{ARXIV_ID}/entities.csv', Sentence))

    _symbol_id_to_symbol_bboxes = dict(load_locations(ARXIV_ID, f'{PIPELINE_DIRPATH}/40-symbols-locations'))
    pipeline_symbols =  list(file_utils.load_from_csv(f'{PIPELINE_DIRPATH}/26-detected-symbols/{ARXIV_ID}/entities.csv', SerializableSymbol))
    symbol_id_to_symbol = {
        f'{symbol.tex_path}-{symbol.id_}': SymbolWithBBoxes(text=f'${symbol.tex}$',  bboxes=_symbol_id_to_symbol_bboxes[symbol.id_])
        for symbol in pipeline_symbols
    }

    _equation_id_to_equation_bboxes = dict(load_locations(ARXIV_ID, f'{PIPELINE_DIRPATH}/55-equations-locations'))
    pipeline_equations = list(file_utils.load_from_csv(f'{PIPELINE_DIRPATH}/50-detected-equations/{ARXIV_ID}/entities.csv', Equation))
    equation_id_to_equation = {
        equation.id_: SymbolWithBBoxes(text=equation.tex, bboxes=_equation_id_to_equation_bboxes[equation.id_])
        for equation in pipeline_equations
    }

    # TODO - out of date. path resolves to `data/15-sentences-locations/1601.00978/entity_locations.csv` instead of `24-sentences-locations/1601.00978/entity_locations.csv`
    # sentence_boxes = dict(file_utils.load_locations(arxiv_id, 'sentences'))

    contexts = list(file_utils.load_from_csv(f'{PIPELINE_DIRPATH}/28-contexts-for-symbols/{ARXIV_ID}/contexts.csv', Context))

    blocks = Block.build_blocks_from_spp_json(infile=SPP_JSONPATH)


    # 1) Symbol <-- --> Equation
    symbol_id_to_equation_id = {}
    equation_id_to_symbol_ids = defaultdict(list)
    for s_tex in pipeline_symbols:
        symbol_id = f'{s_tex.tex_path}-{s_tex.id_}'
        equation_id = str(s_tex.equation_index)
        symbol_id_to_equation_id[symbol_id] = equation_id
        equation_id_to_symbol_ids[equation_id].append(symbol_id)

    # 2) Sentence's text
    sentence_id_to_text = {}
    for sentence in sentences:
        sentence_id = f'{sentence.tex_path}-{sentence.id_}'
        sentence_id_to_text[sentence_id] = sentence.tex

    # 3) Symbol <-- --> Sentence
    symbol_id_to_sentence_id = {}
    sentence_id_to_symbol_ids = defaultdict(list)
    for context in contexts:
        symbol_id = f'{context.tex_path}-{context.entity_id}'
        sentence_id = f'{context.tex_path}-{context.sentence_id}'
        symbol_id_to_sentence_id[symbol_id] = sentence_id
        sentence_id_to_symbol_ids[sentence_id].append(symbol_id)

    # 4) Using Symbol <----> Equation, and Symbol <----> Sentence, THEREFORE we now have Equation <----> Sentence
    equation_id_to_sentence_id = {}
    sentence_id_to_equation_ids = defaultdict(list)
    for equation_id, symbol_ids in equation_id_to_symbol_ids.items():
        sentence_id = {symbol_id_to_sentence_id[symbol_id] for symbol_id in symbol_ids}.pop()
        equation_id_to_sentence_id[equation_id] = sentence_id
        sentence_id_to_equation_ids[sentence_id].append(equation_id)

    # 5) Various matching strategies
    sentence_id_to_bboxes = defaultdict(list)
    for sentence_id, equation_ids in sentence_id_to_equation_ids.items():

        # get the text
        sentence_tex = sentence_id_to_text[sentence_id]
        print(f'Sent {sentence_id}\n\t"{sentence_tex}\n')

        # get the equations
        equation_bboxes = []
        equation_tex = []
        for equation_id in equation_ids:
            e = equation_id_to_equation[equation_id]
            equation_tex.append(e.text)
            for bbox in e.bboxes:
                equation_bboxes.append(bbox)

        # find matching block via bbox overlap
        matched_blocks = [block for block in blocks if are_bboxes_intersecting(bboxes1=equation_bboxes, bboxes2=[block.bbox])]

        for matched_block in matched_blocks:

            # find matching rows via equation bbox overlap
            bbox_matched_rows = [row for row in matched_block.rows if are_bboxes_intersecting(bboxes1=equation_bboxes, bboxes2=[row.bbox])]
            bbox_matched_sents = [sent for sent in matched_block.sents if are_bboxes_intersecting(bboxes1=equation_bboxes, bboxes2=sent.bboxes)]

            print(f'Equation BBoxes overlap with {len(bbox_matched_rows)} Rows: \n\t"{" ".join([r.text for r in bbox_matched_rows])}"')
            print(f'Equation BBoxes overlap with {len(bbox_matched_sents)} Sents: \n\t"{" ".join([s.text for s in bbox_matched_sents])}"')

            # fuzzy matching text via char ngrams
            s_tex = sentence_tex
            for e in equation_tex:
                s_tex = s_tex.replace(e, '')                # remove equations from sentence text
            s_tex = compute_ngrams(s=s_tex, n=NGRAM_WIDTH, k=NGRAM_STRIDE)

            ngram_matched_rows = []
            overall_score = 0.0
            for i, row in enumerate(matched_block.rows):
                r = compute_ngrams(s=row.text, n=NGRAM_WIDTH, k=NGRAM_STRIDE)
                score, alignments = compute_best_alignments_with_threshold(x=s_tex, y=r, sim=tokenized_sentence_similarity, threshold=0.8)
                if score > ROW_MATCH_THRESHOLD:
                    ngram_matched_rows.append(row)
                    overall_score += score
            avg_score = overall_score / len(ngram_matched_rows) if ngram_matched_rows else 0.0

            # TODO: postprocessing to ensure contiguity of rows
            print(f'Ngrams overlap with {len(ngram_matched_rows)} Rows with Avg Score {avg_score:.2f}: \n\t"{" ".join([r.text for r in ngram_matched_rows])}"')

            sent_idx_to_score = {}
            for i, sent in enumerate(matched_block.sents):
                s_pdf = compute_ngrams(s=sent.text, n=NGRAM_WIDTH, k=NGRAM_STRIDE)
                score, alignments = compute_best_alignments_with_threshold(x=s_tex, y=s_pdf, sim=tokenized_sentence_similarity, threshold=0.8)
                sent_idx_to_score[i] = score
            idx_best = sorted(sent_idx_to_score.items(), key=lambda tup: tup[-1])[-1][0]        # -1 for score, -1 for 'max', 0 for sent_idx

            best_ngram_matched_sent = matched_block.sents[idx_best]
            best_ngram_matched_score = sent_idx_to_score[idx_best]

            print(f'Ngrams overlap with Sent with Score {best_ngram_matched_score:.2f}: \n\t"{best_ngram_matched_sent.text}"')

            # TODO: post processing to catch cases where sentence ngram match != equation ngram match

            print('=' * 40 + '\n')

            # SAVE BEST RESULTS
            sentence_id_to_bboxes[sentence_id].extend(best_ngram_matched_sent.bboxes)

    # write results so they can be uploaded



def test_regular_tex_sentence_match():
    # tex0 is a regular sentence (wout macros or symbols)
    pass

def test_two_tex_sentences_same_block():
    # tex0 and tex1 are in block0
    pass