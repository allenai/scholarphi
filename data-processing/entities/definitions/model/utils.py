import os
import random
import json
from typing import Any, Dict, List, Union

import numpy as np
import torch
from colorama import Fore, Style
from sklearn.metrics import f1_score
from sklearn.metrics import precision_recall_fscore_support as score
from sklearn.metrics import precision_score, recall_score


def highlight(input_: Any) -> str:
    input_ = str(input_)
    return str(Fore.YELLOW + str(input_) + Style.RESET_ALL)


def get_intent_labels(args: Any) -> List[str]:
    return [
        label.strip()
        for label in open(
            os.path.join(args.data_dir, args.intent_label_file), "r", encoding="utf-8"
        )
    ]


def get_slot_labels(args: Any) -> List[str]:
    return [
        label.strip()
        for label in open(
            os.path.join(args.data_dir, args.slot_label_file), "r", encoding="utf-8"
        )
    ]


def get_pos_labels(args: Any) -> List[str]:
    return [
        label.strip()
        for label in open(
            os.path.join(args.data_dir, args.pos_label_file), "r", encoding="utf-8"
        )
    ]


def set_torch_seed(seed: Any, no_cuda: bool) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)  # type: ignore
    if not no_cuda and torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)  # type: ignore


def compute_metrics(
    intent_preds: List[str],
    intent_labels: List[str],
    slot_preds: List[List[str]],
    slot_labels: List[List[str]],
) -> Dict[Any, Any]:
    assert (
        len(intent_preds) == len(intent_labels) == len(slot_preds) == len(slot_labels)
    )
    results: Dict[Any, Any] = {}
    intent_result = get_intent_acc(intent_preds, intent_labels)
    slot_result = get_slot_metrics(slot_preds, slot_labels)
    sementic_result = get_sentence_frame_acc(
        intent_preds, intent_labels, slot_preds, slot_labels
    )

    # New metrics added following Dan's request.
    slot_simple_result = get_slot_simple_metrics(slot_preds, slot_labels)
    partial_match_result = get_partial_match_metrics(slot_preds, slot_labels)

    results.update(intent_result)
    results.update(slot_result)
    results.update(sementic_result)
    results.update(slot_simple_result)
    results.update(partial_match_result)
    return results


def simplify_tokens(preds: List[str]) -> List[str]:
    simple_preds = []
    for p in preds:
        if p.endswith("TERM"):
            simple_preds.append("TERM")
        elif p.endswith("DEF"):
            simple_preds.append("DEF")
        else:
            simple_preds.append(p)
    return simple_preds


def get_partial_match_metrics(
    preds: List[List[str]], labels: List[List[str]]
) -> Dict[Any, Any]:
    """
    Suppose there are N such pairs in the gold data and the system predicts M such pairs. Say a ‘partial match’ happens when the system predicts a pair <term,defn> and there is some overlap (at least one token) between the predicted and gold term spans AND there is some overlap between the predicted and gold definition spans. Let X be the number of partial matches. What are
    Partial match precision = P/M
    Partial match recall = P/N
    """
    assert len(preds) == len(labels)

    both_in_preds, both_in_labels = [], []
    partial_matches, exact_matches = [], []
    for pred_sent, label_sent in zip(preds, labels):
        simple_pred_sent = simplify_tokens(pred_sent)
        simple_label_sent = simplify_tokens(label_sent)

        # check whether term/def exist together
        both_in_pred = "TERM" in simple_pred_sent and "DEF" in simple_pred_sent
        both_in_label = "TERM" in simple_label_sent and "DEF" in simple_label_sent

        both_in_preds.append(both_in_pred)
        both_in_labels.append(both_in_label)

        partial_match = False
        exact_match = False
        match: List[Union[str, bool]] = []
        if both_in_pred and both_in_label:
            for p, l in zip(simple_pred_sent, simple_label_sent):
                if p == l:
                    match.append(p)
                else:
                    match.append(False)
            if "TERM" in match and "DEF" in match:
                partial_match = True
            if False not in match:
                exact_match = True

        partial_matches.append(partial_match)
        exact_matches.append(exact_match)

    count_both_in_preds = sum(both_in_preds)  # N
    count_both_in_labels = sum(both_in_labels)  # M
    count_partial_matches = sum(partial_matches)  # P
    count_exact_matches = sum(exact_matches)  # E

    partial_precision = count_partial_matches / count_both_in_preds
    partial_recall = count_partial_matches / count_both_in_labels
    partial_fscore = (
        2 * partial_precision * partial_recall / (partial_precision + partial_recall)
    )

    exact_precision = count_exact_matches / count_both_in_preds
    exact_recall = count_exact_matches / count_both_in_labels
    exact_fscore = 2 * exact_precision * exact_recall / (exact_precision + exact_recall)

    return {
        "partial_match_precision": partial_precision,
        "partial_match_recall": partial_recall,
        "partial_match_f1": partial_fscore,
        "exact_match_precision": exact_precision,
        "excat_match_recall": exact_recall,
        "excat_match_f1": exact_fscore,
    }


def get_slot_simple_metrics(
    preds: List[List[str]], labels: List[List[str]]
) -> Dict[Any, Any]:
    """
    Conceptually, define the following new types of ‘virtual tags’
    TERM = B-term OR I-Term (ie the union of those two tags)
    DEF = B-Def OR I-Def
    Now, what are the P,R & F1 numbers for TERM and DEF?  (I think these matter because users may
    just care about accuracy of term and defn matching and the macro averaged scores conflate
    other things like recall on these metrics and precision on O. Likewise the current macro
    average treats missing the first word in a definition differently from skipping the last word.
    """
    assert len(preds) == len(labels)

    # flatten
    preds_flattened = [p for ps in preds for p in ps]
    labels_flattened = [l for ls in labels for l in ls]

    # simplify by replacing {B,I}-TERM to TERM and {B,I}-DEF to DEF
    simple_preds = simplify_tokens(preds_flattened)
    simple_labels = simplify_tokens(labels_flattened)
    assert len(simple_preds) == len(simple_labels)

    label_names = ["O", "TERM", "DEF"]
    p, r, f, s = score(simple_labels, simple_preds, average=None, labels=label_names)
    s = [int(si) for si in s]
    p = [round(float(pi), 3) for pi in p]
    r = [round(float(pi), 3) for pi in r]
    f = [round(float(pi), 3) for pi in f]
    per_class = {"p": list(p), "r": list(r), "f": list(f), "s": list(s)}
    # pprint(per_class)

    return {
        "slot_merged_TERM_precision": per_class["p"][1],
        "slot_merged_TERM_recall": per_class["r"][1],
        "slot_merged_TERM_f1": per_class["f"][1],
        "slot_merged_DEFINITION_precision": per_class["p"][2],
        "slot_merged_DEFINITION_recall": per_class["r"][2],
        "slot_merged_DEFINITION_f1": per_class["f"][2],
    }


def get_slot_metrics(preds: List[List[str]], labels: List[List[str]]) -> Dict[Any, Any]:
    assert len(preds) == len(labels)

    # flatten
    preds_flattened = [p for ps in preds for p in ps]
    labels_flattened = [l for ls in labels for l in ls]

    macro_f1 = f1_score(labels_flattened, preds_flattened, average="macro")
    micro_f1 = f1_score(labels_flattened, preds_flattened, average="micro")
    macro_p = precision_score(labels_flattened, preds_flattened, average="macro")
    micro_p = precision_score(labels_flattened, preds_flattened, average="micro")
    macro_r = recall_score(labels_flattened, preds_flattened, average="macro")
    micro_r = recall_score(labels_flattened, preds_flattened, average="micro")

    label_names = ["O", "B-TERM", "I-TERM", "B-DEF", "I-DEF"]
    p, r, f, s = score(
        labels_flattened, preds_flattened, average=None, labels=label_names
    )
    s = [int(si) for si in s]
    p = [round(float(pi), 3) for pi in p]
    r = [round(float(pi), 3) for pi in r]
    f = [round(float(pi), 3) for pi in f]
    per_class = {"p": list(p), "r": list(r), "f": list(f), "s": list(s)}
    # print(per_class)

    return {
        "slot_precision_macro": macro_p,
        "slot_recall_macro": macro_r,
        "slot_f1_macro": macro_f1,
        "slot_precision_micro": micro_p,
        "slot_recall_micro": micro_r,
        "slot_f1_micro": micro_f1,
        "slot_precision_per_label": per_class["p"],
        "slot_recal_per_label": per_class["r"],
        "slot_f1_per_label": per_class["f"],
        "slot_num_per_label": per_class["s"],
    }


def get_intent_acc(preds: List[str], labels: List[str]) -> Dict[Any, Any]:
    acc = (preds == labels).mean()
    return {"intent_acc": acc}


def read_prediction_text(args: Any) -> List[str]:
    return [
        text.strip()
        for text in open(
            os.path.join(args.pred_dir, args.pred_input_file), "r", encoding="utf-8"
        )
    ]


def get_sentence_frame_acc(
    intent_preds: List[str],
    intent_labels: List[str],
    slot_preds: List[List[str]],
    slot_labels: List[List[str]],
) -> Dict[Any, Any]:
    """For the cases that intent and all the slots are correct (in one sentence)"""
    # Get the intent comparison result
    intent_result = intent_preds == intent_labels

    # Get the slot comparision result
    slot_result = []
    for preds, labels in zip(slot_preds, slot_labels):
        assert len(preds) == len(labels)
        one_sent_result = True
        for p, l in zip(preds, labels):
            if p != l:
                one_sent_result = False
                break
        slot_result.append(one_sent_result)
    slot_result = np.array(slot_result)

    sementic_acc = np.multiply(intent_result, slot_result).mean()
    return {"sementic_frame_acc": sementic_acc}

def get_joint_labels(args, key):
    with open(
            os.path.join(args.data_dir, args.dataconfig_file),
            "r",
            encoding="utf-8",
        ) as f:
        data_config = json.load(f)
    return data_config[key]

def get_intent_labels_dict(args):
    intent_hybrid = {}
    for task in args.task.split("+"):
        intent_hybrid[task] = [
            label.strip()
            for label in open(
                os.path.join(args.data_dir, args.intent_label_file),
                "r",
                encoding="utf-8",
            )
        ]
    return intent_hybrid


def get_slot_labels_dict(args):
    slot_hybrid = {}
    for task in args.task.split("+"):
        slot_hybrid[task] = [
            label.strip()
            for label in open(
                os.path.join(args.data_dir, args.slot_label_file), "r", encoding="utf-8"
            )
        ]
    return slot_hybrid
