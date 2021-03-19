from typing import *

import string
import numpy as np
from collections import defaultdict

from common.types import BoundingBox, SerializableSymbol, Context, Equation
from entities.sentences.types import Sentence
from entities.sentences_pdf.bbox import SymbolWithBBoxes, Block, are_bboxes_intersecting

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


NGRAM_WIDTH: int = 5
NGRAM_STRIDE: int = 1
NGRAM_SIM_THRESHOLD: float = 0.8


def featurize_tex_sentence(sentence_tex: str, equation_tex: List[str]) -> List[str]:
    # actually, dont do this anymore.  there are some sentences that are entirely an equation.
    s_tex = sentence_tex
    # for e in equation_tex:
    #     s_tex = s_tex.replace(e, '')  # remove equations from sentence text
    s_tex = compute_ngrams(s=s_tex, n=NGRAM_WIDTH, k=NGRAM_STRIDE)
    return s_tex


def featurize_pdf_sentence(sentence_pdf: str):
    return compute_ngrams(s=sentence_pdf, n=NGRAM_WIDTH, k=NGRAM_STRIDE)


def locate_sentences_fuzzy_ngram(pipeline_symbols: List[SerializableSymbol],
                                 pipeline_equations: List[Equation],
                                 pipeline_sentences: List[Sentence],
                                 pipeline_contexts: List[Context],
                                 symbol_id_to_symbol: Dict[str, SymbolWithBBoxes],
                                 equation_id_to_equation: Dict[str, SymbolWithBBoxes],
                                 blocks: List[Block]) -> Dict[str, List[BoundingBox]]:

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
    for sentence in pipeline_sentences:
        sentence_id = f'{sentence.tex_path}-{sentence.id_}'
        sentence_id_to_text[sentence_id] = sentence.tex

    # 3) Symbol <-- --> Sentence
    symbol_id_to_sentence_id = {}
    sentence_id_to_symbol_ids = defaultdict(list)
    for context in pipeline_contexts:
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

        # get the equations
        equation_bboxes = []
        equation_tex = []
        for equation_id in equation_ids:
            e = equation_id_to_equation[equation_id]
            equation_tex.append(e.text)
            for bbox in e.bboxes:
                equation_bboxes.append(bbox)

        # TODO: special handling for when there's multipel matching boxes
        # find matching block via pdf block bbox overlap with equations
        matched_blocks = [block for block in blocks if
                          are_bboxes_intersecting(bboxes1=equation_bboxes, bboxes2=[block.bbox])]

        for matched_block in matched_blocks:

            # featurize the tex sentence
            s_tex = featurize_tex_sentence(sentence_tex=sentence_tex, equation_tex=equation_tex)

            # compute sim(tex, pdf) for each pdf sentence
            sent_idx_to_score = {}
            for i, sent in enumerate(matched_block.sents):
                # featurize the sentence from PDF tokens
                s_pdf = featurize_pdf_sentence(sentence_pdf=sent.text)
                score, alignments = compute_best_alignments_with_threshold(x=s_tex, y=s_pdf,
                                                                           sim=tokenized_sentence_similarity,
                                                                           threshold=NGRAM_SIM_THRESHOLD)
                sent_idx_to_score[i] = score

            # find closest matching pdf sentence
            idx_best = sorted(sent_idx_to_score.items(), key=lambda tup: tup[-1])[-1][0]  # -1 for score, -1 for 'max', 0 for sent_idx

            best_ngram_matched_sent = matched_block.sents[idx_best]
            best_ngram_matched_score = sent_idx_to_score[idx_best]

            # TODO: post processing to catch cases where sentence ngram match != equation ngram match

            # save bboxes
            sentence_id_to_bboxes[sentence_id].extend(best_ngram_matched_sent.bboxes)

    return sentence_id_to_bboxes