import os
import sys
import json
import logging
import argparse
import urllib.request

import zipfile
from collections import defaultdict
from typing import DefaultDict,List,Any,Tuple
import scispacy
import spacy
from spacy.matcher import Matcher
from spacy.util import filter_spans
from scispacy.abbreviation import AbbreviationDetector
from transformers import HfArgumentParser, AutoConfig, AutoTokenizer, CONFIG_MAPPING

from .nlp_model.model import JointRoberta
from .nlp_model.trainer import Trainer
from .nlp_model.utils import (
    init_logger,
    read_prediction_text,
    set_seed,
    get_intent_labels,
    get_slot_labels,
    get_pos_labels,
    highlight,
    info,
)
from .nlp_model.data_loader import load_and_cache_examples, load_and_cache_examples_one, load_and_cache_examples_batch
from .nlp_model.configuration import (
    ModelArguments,
    DataTrainingArguments,
    TrainingArguments,
)

logger = logging.getLogger(__name__)


MODEL_CLASSES = {
    "roberta": JointRoberta,
}


class DefinitionModel:
    def __init__(self) -> None:
        # (1) initialize modules for featurization
        self.nlp = spacy.load("en_core_sci_md")  # sm")
        abbreviation_pipe = AbbreviationDetector(self.nlp)
        self.nlp.add_pipe(abbreviation_pipe)

        # a Matcher instance for detecting verb phrases
        verb_pattern = [
            {"POS": "VERB", "OP": "?"},
            {"POS": "ADV", "OP": "*"},
            {"POS": "AUX", "OP": "*"},
            {"POS": "VERB", "OP": "+"},
        ]
        self.matcher = Matcher(self.nlp.vocab)
        self.matcher.add("Verb phrase", None, verb_pattern)

        # (2) initialize modules for transformer-based definition inference
        self.cache_directory = "./cache/nlp_model/"
        self.cache_file = "model_v1.0_best.zip"
        # make a directory storing model files (./data/)
        if not os.path.exists(self.cache_directory):
            os.makedirs(self.cache_directory)
            logger.info(highlight("Created directory {}".format(self.cache_directory)))

            # donwload the best model files in ./data/
            urllib.request.urlretrieve(
                "http://dongtae.lti.cs.cmu.edu/data/joint_bert/model_v1.0_best.zip",
                os.path.join("{}/{}".format(self.cache_directory, self.cache_file)),
            )
            with zipfile.ZipFile(
                "{}/{}".format(self.cache_directory, self.cache_file), "r"
            ) as zip_ref:
                zip_ref.extractall(self.cache_directory)
            logger.info(highlight("Model downloaded in {}".format(self.cache_file)))
        else:
            logger.info(
                highlight("Model directory exists {}".format(self.cache_directory))
            )

        parser = HfArgumentParser(
            (ModelArguments, DataTrainingArguments, TrainingArguments)
        )
        model_args, data_args, training_args = parser.parse_args_into_dataclasses(
            [
                "--model_name_or_path",
                "roberta-large",
                "--data_dir",
                self.cache_directory,
                "--output_dir",
                "{}/roberta-large".format(self.cache_directory),
                "--do_eval",
                "--overwrite_cache",
                "--use_crf",
                "--use_heuristic",
                "--use_pos",
                "--use_np",
                "--use_vp",
                "--use_entity",
                "--use_acronym",
                "--per_device_eval_batch_size",
                "4",
                "--max_seq_len",
                "80",
            ]
        )

        # set seed
        set_seed(training_args)

        # logging information
        info(logger, training_args)

        # set model_type
        model_args.model_type = model_args.model_name_or_path.split("-")[0].split("_")[
            0
        ]

        # Load config
        if model_args.config_name:
            config = AutoConfig.from_pretrained(
                model_args.config_name, cache_dir=model_args.cache_dir
            )
        elif model_args.model_name_or_path:
            config = AutoConfig.from_pretrained(
                model_args.model_name_or_path, cache_dir=model_args.cache_dir
            )
        else:
            config = CONFIG_MAPPING[model_args.model_type]()
            logger.warning("You are instantiating a new config instance from scratch.")

        # Load tokenizer
        if model_args.tokenizer_name:
            tokenizer = AutoTokenizer.from_pretrained(
                model_args.tokenizer_name, cache_dir=model_args.cache_dir
            )
        elif model_args.model_name_or_path:
            tokenizer = AutoTokenizer.from_pretrained(
                model_args.model_name_or_path, cache_dir=model_args.cache_dir
            )
        else:
            raise ValueError(
                "You are instantiating a new tokenizer from scratch. This is not supported, but you can do it from another script, save it, and load it from here, using --tokenizer_name"
            )

        # renaming output_dir with conditions
        training_args.output_dir = "{}{}{}{}{}{}".format(
            training_args.output_dir,
            "_pos={}".format(training_args.use_pos) if training_args.use_pos else "",
            "_np={}".format(training_args.use_np) if training_args.use_np else "",
            "_vp={}".format(training_args.use_vp) if training_args.use_vp else "",
            "_entity={}".format(training_args.use_entity)
            if training_args.use_entity
            else "",
            "_acronym={}".format(training_args.use_acronym)
            if training_args.use_acronym
            else "",
        )
        logger.info(highlight(" Output_dir {}".format(training_args.output_dir)))

        # Load model
        model_class = MODEL_CLASSES[model_args.model_type]
        if (
            os.path.exists(training_args.output_dir)
            and not training_args.overwrite_output_dir
        ):
            model = model_class.from_pretrained(
                training_args.output_dir,
                args=training_args,
                intent_label_lst=get_intent_labels(data_args),
                slot_label_lst=get_slot_labels(data_args),
                pos_label_lst=get_pos_labels(data_args),
            )
            logger.info(
                highlight(
                    " ***** Model loaded **** {}".format(training_args.output_dir)
                )
            )
        else:
            logger.info(highlight("Model not exist"))
            raise ValueError(
                "The pre-trained model should be ready in the directory {}".format(
                    training_args.output_dir
                )
            )
        model.resize_token_embeddings(len(tokenizer))

        data_args.ignore_index = training_args.ignore_index
        self.training_args = training_args
        self.data_args = data_args
        self.model_args = model_args

        self.tokenizer = tokenizer
        self.model = model
        self.trainer = Trainer(
            [self.training_args, self.model_args, self.data_args], self.model
        )

    def featurize(self, text: str, limit: bool=False) -> DefaultDict[Any,Any]:
        doc = self.nlp(text)

        # (1) add acronym  [1 0 0 0 0 0 1 1 ..]
        abbrevs_tokens = []
        for abrv in doc._.abbreviations:
            # print(f"{abrv} \t ({abrv.start}, {abrv.end}) {abrv._.long_form}")
            abbrevs_tokens.append(str(abrv._.long_form).split())
        abbrevs_tokens_flattened = [t for et in abbrevs_tokens for t in et]

        # (2) add entities [1 0 0 1 1 1 0 0 ..]
        entities = [str(e) for e in doc.ents]
        entities_tokens = [e.split() for e in entities]
        entities_tokens_flattened = [t for et in entities_tokens for t in et]
        # print(entities)

        # (3) NPs [ 1 1 1 0 0 0 ...]
        np_tokens = []
        for chunk in doc.noun_chunks:
            np_tokens.append(str(chunk.text).split())
        np_tokens_flattened = [t for et in np_tokens for t in et]

        # (3) VPs [ 1 1 1 0 0 0 ...]
        matches = self.matcher(doc)
        spans = [doc[start:end] for _, start, end in matches]
        vp_tokens = filter_spans(spans)
        vp_tokens_flattened = [str(t) for et in vp_tokens for t in et]

        # limite samples
        if limit:
            doc = doc[:limit]

        # aggregate
        data = defaultdict(list)
        for token in doc:
            data["tokens"].append(str(token.text))
            data["pos"].append(str(token.tag_))  # previously token.pos_
            data["head"].append(str(token.head))
            data["entities"].append(1 if token.text in entities_tokens_flattened else 0)
            data["np"].append(1 if token.text in np_tokens_flattened else 0)
            data["vp"].append(1 if token.text in vp_tokens_flattened else 0)
            data["acronym"].append(1 if token.text in abbrevs_tokens_flattened else 0)
        return data


    def predict_one(self, data: DefaultDict[Any,Any]) -> Tuple[List[int], List[List[str]]]:
        # get dataset
        test_dataset = load_and_cache_examples_one(
            self.data_args,
            self.tokenizer,
            data,
            model_name=self.model_args.model_name_or_path,
        )

        # inference
        intent_pred, slot_preds = self.trainer.evaluate_one(test_dataset)

        # simplify prediction tokens for slot_preds
        simplified_slot_preds = []
        for slot_pred in slot_preds:
            simplified_slot_pred = []
            for s in slot_pred:
                if s.endswith("TERM"):
                    simplified_slot_pred.append("TERM")
                elif s.endswith("DEF"):
                    simplified_slot_pred.append("DEF")
                else:
                    simplified_slot_pred.append("O")
            simplified_slot_preds.append(simplified_slot_pred)

        return intent_pred, simplified_slot_preds


    def predict_batch(self, data: List[DefaultDict[Any,Any]]) -> Tuple[List[int], List[List[str]]]:
        # get dataset
        test_dataset = load_and_cache_examples_batch(
            self.data_args,
            self.tokenizer,
            data,
            model_name=self.model_args.model_name_or_path,
        )

        # inference
        intent_pred, slot_preds = self.trainer.evaluate_one(test_dataset)

        # simplify prediction tokens for slot_preds
        simplified_slot_preds = []
        for slot_pred in slot_preds:
            simplified_slot_pred = []
            for s in slot_pred:
                if s.endswith("TERM"):
                    simplified_slot_pred.append("TERM")
                elif s.endswith("DEF"):
                    simplified_slot_pred.append("DEF")
                else:
                    simplified_slot_pred.append("O")
            simplified_slot_preds.append(simplified_slot_pred)

        return intent_pred, simplified_slot_preds

