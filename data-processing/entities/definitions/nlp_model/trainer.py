import os
import shutil
import coloredlogs, logging
from colorama import Fore, Style
from tqdm import tqdm, trange
from collections import Counter
from typing import Any, List, Dict, Tuple, Optional
import numpy as np
import torch
from torch.utils.data import DataLoader, RandomSampler, SequentialSampler, TensorDataset
from transformers import BertConfig, AdamW, get_linear_schedule_with_warmup
from .utils import compute_metrics, highlight

logger = logging.getLogger(__name__)


class Trainer(object):
    def __init__(
        self,
        args: List[Any],
        model: Any,
        train_dataset: Optional[TensorDataset] = None,
        dev_dataset: Optional[TensorDataset] = None,
        test_dataset: Optional[TensorDataset] = None,
        slot_label_lst: Optional[Dict[Any,Any]] = None,
    ) -> None:
        self.args, self.model_args, self.data_args = args
        self.train_dataset = train_dataset
        self.dev_dataset = dev_dataset
        self.test_dataset = test_dataset
        # Use cross entropy ignore index as padding label id so that only real label ids contribute to the loss later
        self.pad_token_label_id = self.args.ignore_index  # 0 #tokenizer.pad_token_id #

        self.slot_label_lst = model.slot_label_lst

        self.model = model

        # GPU or CPU
        self.device = (
            "cuda" if torch.cuda.is_available() and not self.args.no_cuda else "cpu"
        )
        self.model.to(self.device)

    def train(self) -> Tuple[int, float]:
        train_sampler = RandomSampler(self.train_dataset)
        train_dataloader = DataLoader(
            self.train_dataset,
            sampler=train_sampler,
            batch_size=self.args.train_batch_size,
        )

        if self.args.max_steps > 0:
            t_total = self.args.max_steps
            self.args.num_train_epochs = (
                self.args.max_steps
                // (len(train_dataloader) // self.args.gradient_accumulation_steps)
                + 1
            )
        else:
            t_total = (
                len(train_dataloader)
                // self.args.gradient_accumulation_steps
                * self.args.num_train_epochs
            )

        # Prepare optimizer and schedule (linear warmup and decay)
        no_decay = ["bias", "LayerNorm.weight"]
        optimizer_grouped_parameters = [
            {
                "params": [
                    p
                    for n, p in self.model.named_parameters()
                    if not any(nd in n for nd in no_decay)
                ],
                "weight_decay": self.args.weight_decay,
            },
            {
                "params": [
                    p
                    for n, p in self.model.named_parameters()
                    if any(nd in n for nd in no_decay)
                ],
                "weight_decay": 0.0,
            },
        ]
        optimizer = AdamW(
            optimizer_grouped_parameters,
            lr=self.args.learning_rate,
            eps=self.args.adam_epsilon,
        )
        scheduler = get_linear_schedule_with_warmup(
            optimizer,
            num_warmup_steps=self.args.warmup_steps,
            num_training_steps=t_total,
        )

        # Train!
        logger.info("***** Running training *****")
        logger.info("  Num examples = {}".format(highlight(len(self.train_dataset))))
        logger.info("  Num Epochs = {}".format(highlight(self.args.num_train_epochs)))
        logger.info(
            "  Total train batch size = {}".format(
                highlight(self.args.train_batch_size)
            )
        )
        logger.info(
            "  Gradient Accumulation steps = {}".format(
                highlight(self.args.gradient_accumulation_steps)
            )
        )
        logger.info("  Total optimization steps = {}".format(highlight(t_total)))
        logger.info("  Logging steps = {}".format(highlight(self.args.logging_steps)))
        logger.info("  Save steps = {}".format(highlight(self.args.save_steps)))

        global_step = 0
        tr_loss = 0.0
        dev_score_history, dev_step_history = List[float], List[float]
        self.model.zero_grad()

        train_iterator = trange(int(self.args.num_train_epochs), desc="Epoch")

        for _ in train_iterator:
            epoch_iterator = tqdm(train_dataloader, desc="Iteration")
            for step, batch in enumerate(epoch_iterator):
                self.model.train()
                batch = tuple(t.to(self.device) for t in batch)  # GPU or CPU

                inputs = {
                    "input_ids": batch[0],
                    "attention_mask": batch[1],
                    "intent_label_ids": batch[3],
                    "slot_labels_ids": batch[4],
                }

                if self.model.config.model_type != "distilbert":
                    inputs["token_type_ids"] = batch[2]

                if self.args.use_pos:
                    inputs["pos_label_ids"] = batch[5]

                if self.args.use_np:
                    inputs["np_label_ids"] = batch[6]
                if self.args.use_vp:
                    inputs["vp_label_ids"] = batch[7]
                if self.args.use_entity:
                    inputs["entity_label_ids"] = batch[8]
                if self.args.use_acronym:
                    inputs["acronym_label_ids"] = batch[9]

                outputs = self.model(**inputs)
                loss = outputs[0]

                if self.args.gradient_accumulation_steps > 1:
                    loss = loss / self.args.gradient_accumulation_steps

                loss.backward()

                epoch_iterator.set_description(
                    "step {}/{} loss={:.2f}".format(
                        step, global_step, tr_loss / (global_step + 1)
                    )
                )

                tr_loss += loss.item()
                if (step + 1) % self.args.gradient_accumulation_steps == 0:
                    torch.nn.utils.clip_grad_norm_(
                        self.model.parameters(), self.args.max_grad_norm
                    )

                    optimizer.step()
                    scheduler.step()  # Update learning rate schedule
                    self.model.zero_grad()
                    global_step += 1

                    if (
                        self.args.logging_steps > 0
                        and global_step % self.args.logging_steps == 0
                    ):
                        results = self.evaluate("dev")

                        result_dict = {
                            "model": self.model_args.model_name_or_path,
                            "use_pos": self.args.use_pos,
                            "use_np": self.args.use_np,
                            "use_vp": self.args.use_vp,
                            "use_entity": self.args.use_entity,
                            "use_acronym": self.args.use_acronym,
                            "global_step": global_step,
                        }
                        for k, v in results.items():
                            if type(v) == list:
                                for lidx, vone in enumerate(v):
                                    result_dict["{}_{}".format(k, lidx)] = vone
                            else:
                                result_dict[k] = v

                        # save model
                        dev_score = result_dict["slot_f1_macro"]

                        if global_step == self.args.logging_steps or float(dev_score) > max(
                            dev_score_history
                        ):
                            self.save_model()
                            # self.copy_best_model()
                            logger.info(
                                " ******* new best model saved at step {}: {}".format(
                                    highlight(global_step), highlight(dev_score)
                                )
                            )

                        dev_score_history += [dev_score]
                        dev_step_history += [global_step]
                        result_dict["best_slot_f1_macro"] = max(dev_score_history)
                        result_dict["best_global_step"] = dev_step_history[
                            dev_score_history.index(result_dict["best_slot_f1_macro"])
                        ]

                        # save log
                        filename = "logs/logs_train_{}_{}.txt".format(
                            self.data_args.kfold, self.model_args.model_name_or_path
                        )
                        if not os.path.exists(os.path.dirname(filename)):
                            os.makedirs(os.path.dirname(filename))
                        with open(filename, "a") as f:
                            if self.data_args.kfold == 0:
                                f.write("{}\n".format("\t".join(result_dict.keys())))
                            f.write(
                                "{}\n".format(
                                    "\t".join([str(v) for v in result_dict.values()])
                                )
                            )

                    # if not (self.args.save_steps > 0 and global_step % self.args.save_steps == 0):
                    #     self.save_model()

                if 0 < self.args.max_steps < global_step:
                    epoch_iterator.close()
                    break

            if 0 < self.args.max_steps < global_step:
                train_iterator.close()
                break

        return global_step, tr_loss / global_step

    def heuristic_filters(
        self, intent_preds: List[int], intent_labels: List[int], slot_preds: List[List[str]], slot_labels: List[List[str]], verbose: bool=False
    ) -> Tuple[List[int], List[List[str]]]:
        """
        filter out term/definition only cases
        filter out multi-term/definition cases
        threshold inclusion
        """
        new_intent_preds, new_slot_preds = [], []

        # never use {intent,slot}_label in heuristic filtering, but they are only used for sanity checking
        for intent_pred, intent_label, slot_pred, slot_label in zip(
            intent_preds, intent_labels, slot_preds, slot_labels
        ):
            new_slot_pred = slot_pred
            new_intent_pred = intent_pred

            # (1) [slot] filter out term/definition only cases
            pred_counter = dict(Counter(slot_pred))
            term_exist, def_exist = False, False
            for c in pred_counter:
                if c.endswith("TERM"):
                    term_exist = True
                if c.endswith("DEF"):
                    def_exist = True
            if not term_exist and def_exist:
                new_slot_pred = ["O" for p in slot_pred]

            # (2) [intent] change intent label if no term+def detected
            if (not term_exist and not def_exist) or (term_exist and not def_exist):
                new_intent_pred = 0

            # (3) [slot] replace UNK to O
            new_slot_pred = ["O" if sp == "UNK" else sp for sp in new_slot_pred]

            # (4) [slot] fill out missing term/def within threshold
            # threshold_missing_term = 1
            # threshold_missing_def = 1
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

            # (5) change I-TERM I-DEF starting cases
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

            if verbose:
                print(intent_pred, "->", new_intent_pred, intent_label)

                print(" ".join(slot_pred))
                print("-> ", " ".join(new_slot_pred))
                print("-> ", " ".join(slot_label))

            new_intent_preds.append(new_intent_pred)
            new_slot_preds.append(new_slot_pred)

        return new_intent_preds, new_slot_preds

    def evaluate_one(self, dataset: TensorDataset) -> Tuple[List[int], List[List[str]]]:
        eval_sampler = SequentialSampler(dataset)
        eval_dataloader = DataLoader(
            dataset, sampler=eval_sampler, batch_size=self.args.eval_batch_size
        )

        # Eval!
        eval_loss = 0.0
        nb_eval_steps = 0
        intent_preds = None
        slot_preds = None
        gold_intent_label_ids = []
        gold_slot_labels_ids = []

        self.model.eval()

        for batch in eval_dataloader:
            batch = tuple(t.to(self.device) for t in batch)
            with torch.no_grad():
                inputs = {
                    "input_ids": batch[0],
                    "attention_mask": batch[1],
                    "intent_label_ids": batch[3],
                    "slot_labels_ids": batch[4],
                }
                if self.model.config.model_type != "distilbert":
                    inputs["token_type_ids"] = batch[2]

                if self.args.use_pos:
                    inputs["pos_label_ids"] = batch[5]
                if self.args.use_np:
                    inputs["np_label_ids"] = batch[6]
                if self.args.use_vp:
                    inputs["vp_label_ids"] = batch[7]
                if self.args.use_entity:
                    inputs["entity_label_ids"] = batch[8]
                if self.args.use_acronym:
                    inputs["acronym_label_ids"] = batch[9]

                outputs = self.model(**inputs)
                tmp_eval_loss, (intent_logits, slot_logits) = outputs[:2]

                eval_loss += tmp_eval_loss.mean().item()
            nb_eval_steps += 1

            # Intent prediction
            if intent_preds is None:
                intent_preds = intent_logits.detach().cpu().numpy()
                gold_intent_label_ids = (
                    inputs["intent_label_ids"].detach().cpu().numpy()
                )
            else:
                intent_preds = np.append(
                    intent_preds, intent_logits.detach().cpu().numpy(), axis=0
                )
                gold_intent_label_ids = np.append(
                    gold_intent_label_ids,
                    inputs["intent_label_ids"].detach().cpu().numpy(),
                    axis=0,
                )

            # Slot prediction
            if slot_preds is None:
                if self.args.use_crf:
                    # decode() in `torchcrf` returns list with best index directly
                    slot_preds = np.array(self.model.crf.decode(slot_logits))
                else:
                    slot_preds = slot_logits.detach().cpu().numpy()

                gold_slot_labels_ids = inputs["slot_labels_ids"].detach().cpu().numpy()
            else:
                if self.args.use_crf:
                    slot_preds = np.append(
                        slot_preds, np.array(self.model.crf.decode(slot_logits)), axis=0
                    )
                else:
                    slot_preds = np.append(
                        slot_preds, slot_logits.detach().cpu().numpy(), axis=0
                    )

                gold_slot_labels_ids = np.append(
                    gold_slot_labels_ids,
                    inputs["slot_labels_ids"].detach().cpu().numpy(),
                    axis=0,
                )

        eval_loss = eval_loss / nb_eval_steps
        results = {"loss": eval_loss}

        # Intent result
        intent_preds = np.argmax(intent_preds, axis=1)

        # Slot result
        if not self.args.use_crf:
            slot_preds = np.argmax(slot_preds, axis=2)

        slot_label_map = {i: label for i, label in enumerate(self.slot_label_lst)}
        gold_slot_num_batch = int(len(gold_slot_labels_ids))
        gold_slot_num_length = int(len(gold_slot_labels_ids[0]))
        gold_slot_label_list = [[] for _ in range(gold_slot_num_batch)]
        slot_preds_list = [[] for _ in range(gold_slot_num_batch)]

        for i in range(gold_slot_num_batch):
            for j in range(gold_slot_num_length):
                if gold_slot_labels_ids[i, j] != self.pad_token_label_id:
                    gold_slot_label_list[i].append(
                        slot_label_map[gold_slot_labels_ids[i][j]]
                    )
                    slot_preds_list[i].append(slot_label_map[slot_preds[i][j]])
            #     gold_slot_label_list[i].append(gold_slot_labels_ids[i][j])
            #     slot_preds_list[i].append(slot_preds[i][j])

        # heuristics
        if self.args.use_heuristic:
            intent_preds, slot_preds_list = self.heuristic_filters(
                intent_preds,
                gold_intent_label_ids,
                slot_preds_list,
                gold_slot_label_list,
            )

        return intent_preds, slot_preds_list

        # total_result = compute_metrics(intent_preds, gold_intent_label_ids, slot_preds_list, gold_slot_label_list)
        # results.update(total_result)

        # logger.info("***** Eval results *****")
        # for key in sorted(results.keys()):
        #     logger.info("  %s = %s", key, str(highlight(results[key])))

        # return results

    def evaluate(self, mode: str) -> Dict[Any, Any]:
        if mode == "test":
            dataset = self.test_dataset
        elif mode == "dev":
            dataset = self.dev_dataset
        elif type(mode) != str:
            dataset = mode
        else:
            raise Exception("Only dev and test dataset available")

        eval_sampler = SequentialSampler(dataset)
        eval_dataloader = DataLoader(
            dataset, sampler=eval_sampler, batch_size=self.args.eval_batch_size
        )

        # Eval!
        logger.info("***** Running evaluation on %s dataset *****", mode)
        logger.info("  Num examples = {}".format(highlight(len(dataset))))
        logger.info("  Batch size = {}".format(highlight(self.args.eval_batch_size)))
        eval_loss = 0.0
        nb_eval_steps = 0
        intent_preds = None
        slot_preds = None
        gold_intent_label_ids = []
        gold_slot_labels_ids = []

        self.model.eval()

        for batch in tqdm(eval_dataloader, desc="Evaluating"):
            batch = tuple(t.to(self.device) for t in batch)
            with torch.no_grad():
                inputs = {
                    "input_ids": batch[0],
                    "attention_mask": batch[1],
                    "intent_label_ids": batch[3],
                    "slot_labels_ids": batch[4],
                }
                if self.model.config.model_type != "distilbert":
                    inputs["token_type_ids"] = batch[2]

                if self.args.use_pos:
                    inputs["pos_label_ids"] = batch[5]
                if self.args.use_np:
                    inputs["np_label_ids"] = batch[6]
                if self.args.use_vp:
                    inputs["vp_label_ids"] = batch[7]
                if self.args.use_entity:
                    inputs["entity_label_ids"] = batch[8]
                if self.args.use_acronym:
                    inputs["acronym_label_ids"] = batch[9]

                outputs = self.model(**inputs)
                tmp_eval_loss, (intent_logits, slot_logits) = outputs[:2]

                eval_loss += tmp_eval_loss.mean().item()
            nb_eval_steps += 1

            # Intent prediction
            if intent_preds is None:
                intent_preds = intent_logits.detach().cpu().numpy()
                gold_intent_label_ids = (
                    inputs["intent_label_ids"].detach().cpu().numpy()
                )
            else:
                intent_preds = np.append(
                    intent_preds, intent_logits.detach().cpu().numpy(), axis=0
                )
                gold_intent_label_ids = np.append(
                    gold_intent_label_ids,
                    inputs["intent_label_ids"].detach().cpu().numpy(),
                    axis=0,
                )

            # Slot prediction
            if slot_preds is None:
                if self.args.use_crf:
                    # decode() in `torchcrf` returns list with best index directly
                    slot_preds = np.array(self.model.crf.decode(slot_logits))
                else:
                    slot_preds = slot_logits.detach().cpu().numpy()

                gold_slot_labels_ids = inputs["slot_labels_ids"].detach().cpu().numpy()
            else:
                if self.args.use_crf:
                    slot_preds = np.append(
                        slot_preds, np.array(self.model.crf.decode(slot_logits)), axis=0
                    )
                else:
                    slot_preds = np.append(
                        slot_preds, slot_logits.detach().cpu().numpy(), axis=0
                    )

                gold_slot_labels_ids = np.append(
                    gold_slot_labels_ids,
                    inputs["slot_labels_ids"].detach().cpu().numpy(),
                    axis=0,
                )

        eval_loss = eval_loss / nb_eval_steps
        results = {"loss": eval_loss}

        # Intent result
        intent_preds = np.argmax(intent_preds, axis=1)

        # Slot result
        if not self.args.use_crf:
            slot_preds = np.argmax(slot_preds, axis=2)

        slot_label_map = {i: label for i, label in enumerate(self.slot_label_lst)}
        gold_slot_num_batch = int(len(gold_slot_labels_ids))
        gold_slot_num_length = int(len(gold_slot_labels_ids[0]))
        gold_slot_label_list = [[] for _ in range(gold_slot_num_batch)]
        slot_preds_list = [[] for _ in range(gold_slot_num_batch)]

        for i in range(gold_slot_num_batch):
            for j in range(gold_slot_num_length):
                if gold_slot_labels_ids[i, j] != self.pad_token_label_id:
                    gold_slot_label_list[i].append(
                        slot_label_map[gold_slot_labels_ids[i][j]]
                    )
                    slot_preds_list[i].append(slot_label_map[slot_preds[i][j]])
            #     gold_slot_label_list[i].append(gold_slot_labels_ids[i][j])
            #     slot_preds_list[i].append(slot_preds[i][j])

        # heuristics
        if self.args.use_heuristic:
            intent_preds, slot_preds_list = self.heuristic_filters(
                intent_preds,
                gold_intent_label_ids,
                slot_preds_list,
                gold_slot_label_list,
            )

        total_result = compute_metrics(
            intent_preds, gold_intent_label_ids, slot_preds_list, gold_slot_label_list
        )
        results.update(total_result)

        logger.info("***** Eval results *****")
        for key in sorted(results.keys()):
            logger.info("  %s = %s", key, str(highlight(results[key])))

        return results

    def save_model(self) -> None:
        # Save model checkpoint (Overwrite)
        output_dir = self.args.output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        model_to_save = (
            self.model.module if hasattr(self.model, "module") else self.model
        )
        model_to_save.save_pretrained(output_dir)

        # Save training arguments together with the trained model
        torch.save(self.args, os.path.join(output_dir, "training_args.bin"))
        logger.info("Saving model checkpoint to %s", highlight(output_dir))

    def copy_best_model(self, best_dir_name: str="checkpoint_best") -> None:
        output_dir = self.args.output_dir
        best_dir = os.path.join(self.args.output_dir, best_dir_name)
        if os.path.exists(best_dir):
            shutil.rmtree(best_dir)
        os.makedirs(best_dir)

        files = (
            file
            for file in os.listdir(output_dir)
            if os.path.isfile(os.path.join(output_dir, file))
        )
        for file in files:
            shutil.copy(os.path.join(output_dir, file), best_dir)
