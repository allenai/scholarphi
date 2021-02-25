import logging
import os
import shutil
from collections import Counter, defaultdict
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import torch
from torch.utils.data import DataLoader, RandomSampler, SequentialSampler, TensorDataset
from tqdm import tqdm, trange
from transformers import AdamW, get_linear_schedule_with_warmup

from .utils import compute_metrics


class Trainer(object):
    def __init__(
        self,
        args: List[Any],
        model: Any,
        train_dataset: Optional[TensorDataset] = None,
        dev_dataset: Optional[TensorDataset] = None,
        test_dataset: Optional[TensorDataset] = None,
    ) -> None:
        self.args, self.model_args, self.data_args = args
        self.train_dataset = train_dataset
        self.dev_dataset = dev_dataset
        self.test_dataset = test_dataset

        # Use cross entropy ignore index as padding label id so that only real label IDs contribute to the loss later.
        self.pad_token_label_id = self.args.ignore_index
        self.slot_label_dict = getattr(model, "slot_label_dict", None)
        self.intent_label_dict = getattr(model, "intent_label_dict", None)
        self.pos_label_lst = getattr(model, "pos_label_lst", None)
        self.model = model

        # Determine whether to use GPU or CPU.
        self.device = (
            "cuda" if torch.cuda.is_available() and not self.args.no_cuda else "cpu"
        )
        self.model.to(self.device)

    def load_inputs_from_batch(self, batch):

        # inputs = {'input_ids': batch[0],
                  # 'attention_mask': batch[1],
                  # 'intent_label_ids': batch[3],
        #           'slot_labels_ids': batch[4]}
        intent_label_ids = {}
        slot_label_ids = {}

        # [batch x task]
        if len(batch[3].shape) == 1:
            intent_label_ids_tensors = torch.unsqueeze(batch[3],-1).permute(1,0)
        else:
            intent_label_ids_tensors = batch[3].permute(1,0)
        # [batch x length x task]
        if len(batch[4].shape) == 2:
            slot_label_ids_tensors = torch.unsqueeze(batch[4],-1).permute(2,0,1)
        else:
            slot_label_ids_tensors = batch[4].permute(2,0,1)
        for idx, data_type in enumerate(self.data_args.task.split('+')):
            intent_label_ids[data_type] = intent_label_ids_tensors[idx]
            slot_label_ids[data_type] = slot_label_ids_tensors[idx]

        inputs = {'input_ids': batch[0],
                  'attention_mask': batch[1],
                  'intent_label_ids' : intent_label_ids,
                  'slot_label_ids' : slot_label_ids
                }
        if self.model.config.model_type != 'distilbert':
            inputs['token_type_ids'] = batch[2]
        if self.args.use_pos:
            inputs['pos_label_ids'] = batch[5]
        if self.args.use_np:
            inputs['np_label_ids'] = batch[6]
        if self.args.use_vp:
            inputs['vp_label_ids'] = batch[7]
        if self.args.use_entity:
            inputs['entity_label_ids'] = batch[8]
        if self.args.use_acronym:
            inputs['acronym_label_ids'] = batch[9]

        return inputs

    def common_filters(
        self,
        intent_preds: List[int],
        slot_preds: List[List[str]],
        raw: List[List[str]]
    ) -> Tuple[List[int], List[List[str]]]:
        """
        Apply common filters for the predictions
        """
        new_intent_preds, new_slot_preds = [], []

        for intent_pred, slot_pred, in zip(intent_preds, slot_preds):
            new_slot_pred = slot_pred
            new_intent_pred = intent_pred

            # 1. [slot] Filter out term / definition only cases.
            pred_counter = dict(Counter(slot_pred))
            term_exist, def_exist = False, False
            for c in pred_counter:
                if c.endswith("TERM"):
                    term_exist = True
                if c.endswith("DEF"):
                    def_exist = True
            if not (term_exist and def_exist):
                new_slot_pred = ["O" for p in slot_pred]

            # 2. [intent] Change intent label if no term + def detected.
            if not(term_exist and def_exist):
                new_intent_pred = 0

            # 3. [slot] Replace UNK with O.
            new_slot_pred = ["O" if sp == "UNK" else sp for sp in new_slot_pred]

            # 4. Change I-TERM I-DEF starting cases.
            temp_new_slot_pred = new_slot_pred.copy()
            term_start, def_start = False, False
            for sid, sp in enumerate(temp_new_slot_pred):
                if not term_start and sp == "I-TERM":
                    new_slot_pred[sid] = "B-TERM"
                if sp.endswith("TERM"):
                    term_start = True
                else:
                    term_start = False

                if not def_start and sp == "I-DEF":
                    new_slot_pred[sid] = "B-DEF"
                if sp.endswith("DEF"):
                    def_start = True
                else:
                    def_start = False

            new_intent_preds.append(new_intent_pred)
            new_slot_preds.append(new_slot_pred)

        return new_intent_preds, new_slot_preds
    
    def term_def_filters(
        self,
        intent_preds: List[int],
        slot_preds : List[List[str]],
        raw: List[List[str]]
    ) -> Tuple[List[int], List[List[str]]]:
        new_intent_preds, new_slot_preds = [], []

        for intent_pred, slot_pred in zip(intent_preds, slot_preds):
            new_slot_pred = slot_pred
            new_intent_pred = intent_pred
            # [slot] Fill out missing term/def within threshold.
            temp_new_slot_pred = new_slot_pred.copy()
            for sid, sp in enumerate(temp_new_slot_pred):
                if sid < len(new_slot_pred) - 2 and sp.endswith("TERM"):
                    if temp_new_slot_pred[sid + 1] == "O" and temp_new_slot_pred[
                        sid + 2
                    ].endswith("TERM"):
                        new_slot_pred[sid + 1] = "I-TERM"
            temp_new_slot_pred = new_slot_pred.copy()
            for sid, sp in enumerate(temp_new_slot_pred):
                if sid < len(new_slot_pred) - 2 and sp.endswith("DEF"):
                    if temp_new_slot_pred[sid + 1] == "O" and temp_new_slot_pred[
                        sid + 2
                    ].endswith("DEF"):
                        new_slot_pred[sid + 1] = "I-DEF"
            temp_new_slot_pred = new_slot_pred.copy()
            for sid, sp in enumerate(temp_new_slot_pred):
                if sid < len(new_slot_pred) - 3 and sp.endswith("DEF"):
                    if (
                        temp_new_slot_pred[sid + 1] == "O"
                        and temp_new_slot_pred[sid + 2] == "O"
                        and temp_new_slot_pred[sid + 3].endswith("DEF")
                    ):
                        new_slot_pred[sid + 1] = "I-DEF"
                        new_slot_pred[sid + 2] = "I-DEF"
            
            new_intent_preds.append(new_intent_pred)
            new_slot_preds.append(new_slot_pred)
        return new_intent_preds, new_slot_preds

    def sym_nick_filters(
        self,
        intent_preds: List[int],
        slot_preds : List[List[str]],
        raw: List[List[str]]
    ) -> Tuple[List[int], List[List[str]]]:
        new_intent_preds, new_slot_preds = [], []

        for intent_pred, slot_pred, raw_data in zip(intent_preds, slot_preds, raw):
            new_slot_pred = slot_pred
            new_intent_pred = intent_pred
            #1. [slot] Replace mis-labelled non SYMBOL as TERM 
            temp_new_slot_pred = new_slot_pred.copy()
            for sid, sp in enumerate(temp_new_slot_pred):
                if sp.endswith("TERM") and 'SYMBOL' not in raw_data[sid]:
                    new_slot_pred[sid] = 'O'
            
            # 2. Change TERMs in between DEFs.
            temp_new_slot_pred = new_slot_pred.copy()
            term_start, def_start = False, False
            for sid, sp in enumerate(temp_new_slot_pred):
                if sp.endswith("DEF"):
                    def_start = True
                else:
                    def_start = False
                
                if sp.endswith("TERM"):
                    if def_start:
                        new_slot_pred[sid] = 'I-DEF'
                        def_start = True
                    else:
                        term_start = True
                else:
                    term_start = False
                 
            # Remove intent in case a term was removed and there are none left
            pred_counter = dict(Counter(slot_pred))
            term_exist, def_exist = False, False
            for c in pred_counter:
                if c.endswith("TERM"):
                    term_exist = True
                if c.endswith("DEF"):
                    def_exist = True
            if not (term_exist and def_exist):
                new_slot_pred = ["O" for p in slot_pred]

            #[intent] Change intent label if no term + def detected.
            if not(term_exist and def_exist):
                new_intent_pred = 0


            new_intent_preds.append(new_intent_pred)
            new_slot_preds.append(new_slot_pred)
        return new_intent_preds, new_slot_preds

    def abbr_exp_filters(
        self,
        intent_preds: List[int],
        slot_preds : List[List[str]],
        raw: List[List[str]]
    ) -> Tuple[List[int], List[List[str]]]:
        return intent_preds, slot_preds

    def heuristic_filters(
        self,
        intent_preds: Dict[str,List[int]],
        slot_preds: Dict[str,List[List[str]]],
        raw: List[List[str]]
    ) -> Tuple[Dict[str,List[int]], Dict[str,List[List[str]]]]:
        """
        Apply various heuristic filters based on the data type [AI2020(abbr-exp), DocDef2(sym-nick), W00(term-def)]
        """
        
        data_types = self.data_args.task.split('+')
        for data_type in data_types:
            if data_type=='AI2020':
                simplified_slot_preds = []
                for slot_pred in slot_preds[data_type]:
                    simplified_slot_pred = []
                    for s in slot_pred:
                        simplified_slot_pred.append(s.replace('long','DEF').replace('short','TERM'))
                    simplified_slot_preds.append(simplified_slot_pred)            
                slot_preds[data_type] = simplified_slot_preds
            
            intent_preds[data_type], slot_preds[data_type] = self.common_filters(intent_preds[data_type], slot_preds[data_type], raw)

            if data_type == 'AI2020':
                intent_preds[data_type], slot_preds[data_type] = self.abbr_exp_filters(intent_preds[data_type], slot_preds[data_type], raw)
            elif data_type ==' DocDef2':
                intent_preds[data_type], slot_preds[data_type] = self.sym_nick_filters(intent_preds[data_type], slot_preds[data_type], raw)
            elif data_type == 'W00':
                intent_preds[data_type], slot_preds[data_type] = self.term_def_filters(intent_preds[data_type], slot_preds[data_type], raw)

        return intent_preds, slot_preds

    def evaluate_from_input(self, dataset: TensorDataset, raw: List[List[str]]) -> Tuple[Dict[Any, Any], Dict[str, List[List[str]]], Dict[Any, Any]]:
        eval_sampler = SequentialSampler(dataset)
        eval_dataloader = DataLoader(
            dataset, sampler=eval_sampler, batch_size=self.args.eval_batch_size
        )

        # Run evaluation.
        eval_loss = 0.0
        nb_eval_steps = 0
        input_ids_all = None
        pos_ids_all = None
        
        intent_preds = {}
        intent_conf = {}
        slot_preds = {}
        slot_conf = {}
        gold_intent_label_dict = {}
        gold_slot_labels_ids = {}

        self.model.eval()

        for batch in eval_dataloader:
            batch = tuple(t.to(self.device) for t in batch)
            with torch.no_grad():
                inputs = self.load_inputs_from_batch(batch)

                outputs = self.model(**inputs)
                tmp_eval_loss, (intent_logits, slot_logits) = outputs[:2]
                eval_loss += tmp_eval_loss.mean().item()

            nb_eval_steps += 1

            if input_ids_all is None and pos_ids_all is None:
                input_ids_all = inputs["input_ids"].detach().cpu().numpy()
                pos_ids_all = inputs["pos_label_ids"].detach().cpu().numpy()
            else:
                input_ids_all = np.concatenate((input_ids_all,inputs["input_ids"].detach().cpu().numpy()))
                pos_ids_all = np.concatenate((pos_ids_all,inputs["pos_label_ids"].detach().cpu().numpy()))
            # POS

            # Predict intent
            intent_probs = {}
            for data_type, logits in intent_logits.items():
                intent_probs[data_type] = torch.softmax(logits, dim=1).detach().cpu().numpy()
                if data_type not in gold_intent_label_dict and data_type not in intent_preds and data_type not in intent_conf:
                    gold_intent_label_dict[data_type] = inputs["intent_label_ids"][data_type].detach().cpu().numpy()
                    intent_preds[data_type] = logits.detach().cpu().numpy()
                    intent_conf[data_type] = intent_probs[data_type][:,1]
                else:
                    gold_intent_label_dict[data_type] = np.concatenate((gold_intent_label_dict[data_type], inputs["intent_label_ids"][data_type].detach().cpu().numpy()))
                    intent_preds[data_type] = np.concatenate((intent_preds[data_type], logits.detach().cpu().numpy()))
                    intent_conf[data_type] = np.concatenate((intent_conf[data_type], intent_probs[data_type][:,1]))
            # Predict slots.
            slot_probs = {}
            for data_type, logits in slot_logits.items():
                slot_probs[data_type] = torch.softmax(logits,dim=2).detach().cpu().numpy()
                if self.args.use_crf:
                    decode_out = self.model.crfs[data_type].decode(logits)
                    slot_logits_crf = np.array(decode_out)
                    # decode() in `torchcrf` returns list with best index directly
                    if data_type not in slot_preds:
                        slot_preds[data_type] = slot_logits_crf
                    else:
                        slot_preds[data_type] = np.concatenate((slot_preds[data_type], slot_logits_crf))
                    # get confidence from softmax
                    I,J = np.ogrid[:slot_logits_crf.shape[0], :slot_logits_crf.shape[1]]
                    if data_type not in slot_conf:
                        slot_conf[data_type] = slot_probs[data_type][I, J, slot_logits_crf]
                    else:
                        slot_conf[data_type] = np.concatenate((slot_conf[data_type], slot_probs[data_type][I, J, slot_logits_crf]))
                else:
                    if data_type not in slot_preds:
                        slot_preds[data_type] = logits.detach().cpu().numpy()
                    else:
                        slot_preds[data_type] = np.concatenate((slot_preds[data_type], logits.detach().cpu().numpy()))                  

                if data_type not in gold_slot_labels_ids:
                    gold_slot_labels_ids[data_type] = inputs["slot_label_ids"][data_type].detach().cpu().numpy()
                else:
                    gold_slot_labels_ids[data_type] = np.concatenate((gold_slot_labels_ids[data_type], inputs["slot_label_ids"][data_type].detach().cpu().numpy()))

        if nb_eval_steps == 0:
            return [], {}

        eval_loss = eval_loss / nb_eval_steps
        results = {
            "loss": eval_loss
        }

        #Intent Result
        for data_type, logits in intent_preds.items():
            intent_preds[data_type] = np.argmax(intent_preds[data_type], axis=1)

        # Slot result
        for data_type, preds in slot_preds.items():
            if not self.args.use_crf:
                # get confidence from softmax
                I,J = np.ogrid[:preds.shape[0], :preds.shape[1]]
                slot_conf[data_type] = preds[I, J, np.argmax(preds, axis=2)]
                slot_preds[data_type] = np.argmax(preds, axis=2)

        slot_label_map = {}
        slot_label_to_idx_map = {}
        for data_type, slot_labels in self.slot_label_dict.items():
            slot_label_map[data_type] = {i: label for i, label in enumerate(slot_labels)}
            slot_label_to_idx_map[data_type] = {label: i for i, label in enumerate(slot_labels)}
        pos_label_map = {i: label for i, label in enumerate(self.pos_label_lst)}
        pos_label_to_idx_map = {label: i for i, label in enumerate(self.pos_label_lst)}

        gold_slot_num_batch = int(len(gold_slot_labels_ids[list(gold_slot_labels_ids.keys())[0]]))
        gold_slot_num_length = int(len(gold_slot_labels_ids[list(gold_slot_labels_ids.keys())[0]][0]))
        slot_labels_dict = {}
        slot_preds_dict = {}
        slot_conf_dict = {}
        for data_type, _ in self.slot_label_dict.items():
            slot_labels_dict[data_type] = [[] for _ in range(gold_slot_num_batch)]
            slot_preds_dict[data_type] = [[] for _ in range(gold_slot_num_batch)]
            slot_conf_dict[data_type] = [[] for _ in range(gold_slot_num_batch)]
        input_ids_list = [[] for _ in range(gold_slot_num_batch)]
        pos_tags_list = [[] for _ in range(gold_slot_num_batch)]

        id_mapping = defaultdict(list)
        for i in range(gold_slot_num_batch):
            prev_input_ids = []
            for j in range(gold_slot_num_length):
                # labels (ignore subword labels and special tokens)
                first_dataset = list(gold_slot_labels_ids.keys())[0]
                if gold_slot_labels_ids[first_dataset][i, j] != self.pad_token_label_id:
                    pos_tags_list[i].append(pos_label_map[pos_ids_all[i][j]])
                    input_ids_list[i].append([input_ids_all[i][j]])
                else:
                    if j > 0 and input_ids_all[i][j] > 2:
                        input_ids_list[i][-1] = input_ids_list[i][-1] + [input_ids_all[i][j]]
                for data_type, _ in self.slot_label_dict.items():
                    if gold_slot_labels_ids[data_type][i, j] != self.pad_token_label_id:
                        slot_labels_dict[data_type][i].append(slot_label_map[data_type][gold_slot_labels_ids[data_type][i][j]])
                        slot_preds_dict[data_type][i].append(slot_label_map[data_type][slot_preds[data_type][i][j]])
                        slot_conf_dict[data_type][i].append(slot_conf[data_type][i][j])

        # Apply heuristic filters.
        if self.args.use_heuristic:
            intent_preds, slot_preds_dict = self.heuristic_filters(
                intent_preds,
                slot_preds_dict,
                raw
            )

        return intent_preds, slot_preds_dict, slot_conf_dict
