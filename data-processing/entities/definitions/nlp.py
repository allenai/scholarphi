import logging
import os
import urllib.request
import zipfile
from collections import defaultdict
from typing import Any, DefaultDict, Dict, List, Tuple, Union

import spacy
from scispacy.abbreviation import AbbreviationDetector
from spacy.matcher import Matcher
from spacy.util import filter_spans
from transformers import CONFIG_MAPPING, AutoConfig, AutoTokenizer, HfArgumentParser

from .model.configuration import (
    DataTrainingArguments,
    ModelArguments,
    TrainingArguments,
)
from .model.load_data import load_and_cache_example, load_and_cache_example_batch
from .model.model import JointRoberta
from .model.trainer import Trainer
from .model.utils import (
    get_intent_labels,
    get_pos_labels,
    get_slot_labels,
    set_torch_seed,
)

MODEL_CLASSES = {
    "roberta": JointRoberta,
}


class DefinitionDetectionModel:
    def __init__(self, prediction_types: List[str]) -> None:

        # Initialize modules for featurization.
        # To use a smaller model, swap out the parameter with "en_core_sci_sm"
        logging.debug("Loading Spacy models (this may take some time).")
        self.nlp = spacy.load("en_core_sci_md")
        abbreviation_pipe = AbbreviationDetector(self.nlp)
        self.nlp.add_pipe(abbreviation_pipe)

        # Create a detector for verb phrases.
        verb_pattern = [
            {"POS": "VERB", "OP": "?"},
            {"POS": "ADV", "OP": "*"},
            {"POS": "AUX", "OP": "*"},
            {"POS": "VERB", "OP": "+"},
        ]
        self.verb_matcher = Matcher(self.nlp.vocab)
        self.verb_matcher.add("Verb phrase", None, verb_pattern)

        # Initialize modules for transformer-based inference model based on the prediction_type
        self.model_paths = {
            'TERM-DEF' : {'baseURL':"https://scholarphi.s3-us-west-1.amazonaws.com/",'file':"termdef.zip"},
            'ABBR-EXP' : {'baseURL':"https://scholarphi.s3-us-west-1.amazonaws.com/",'file':"abbrexp.zip"},
            'SYM-NICK' : {'baseURL':"https://scholarphi.s3-us-west-1.amazonaws.com/",'file':"symnick.zip"},
        }
        self.prediction_types = prediction_types

        self.data_args = {}
        self.model_args = {}
        self.tokenizer = {}
        self.model = {}
        self.trainer = {}


        for prediction_type in self.prediction_types:
            cache_directory = f"./cache/{prediction_type.replace('-','_')}_model"

            # Make a directory storing model files (./data/)
            if not os.path.exists(cache_directory):
                os.makedirs(cache_directory)
                logging.debug("Created cache directory for models at %s", cache_directory)

                # Download the best model files in ./data/
                MODEL_URL = (
                    self.model_paths[prediction_type]['baseURL'] + self.model_paths[prediction_type]['file']
                )
                logging.debug(
                    "Downloading model from %s. Warning: this will take a long time.",
                    MODEL_URL,
                )
                cache_file = self.model_paths[prediction_type]['file']
                urllib.request.urlretrieve(
                    MODEL_URL, os.path.join("{}/{}".format(cache_directory, cache_file)),
                )

                with zipfile.ZipFile(
                    "{}/{}".format(cache_directory, cache_file), "r"
                ) as zip_ref:
                    zip_ref.extractall(cache_directory)
                logging.debug(
                    "Downloaded and unpacked model data in directory %s", cache_file
                )

            else:
                logging.debug(  # pylint: disable=logging-not-lazy
                    "Cache directory for models already exists at %s. "
                    + "Skipping creation of directory and download of data.",
                    cache_directory,
                )

            parser = HfArgumentParser(
                (ModelArguments, DataTrainingArguments, TrainingArguments)
            )
            model_args, data_args, training_args = parser.parse_args_into_dataclasses(
                [
                    "--model_name_or_path",
                    "roberta-large",
                    "--prediction_type",
                    f"{prediction_type}",
                    "--data_dir",
                    cache_directory,
                    "--output_dir",
                    os.path.join(cache_directory, "roberta-large"),
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
                    "16",
                    "--max_seq_len",
                    "80",
                ]
            )

            # Set seed for model.
            set_torch_seed(training_args.seed, training_args.no_cuda)

            # Log basic debugging information about model and arguments.
            logging.info(  # pylint: disable=logging-not-lazy
                "Arguments for NLP model. Process rank: %s, device: %s, "
                + "n_gpu: %s, distributed training: %s, 16-bits training: %s. Training / evaluation "
                + "parameters: %s",
                training_args.local_rank,
                training_args.device,
                training_args.n_gpu,
                bool(training_args.local_rank != -1),
                training_args.fp16,
                training_args,
            )

            # Set model type from arguments.
            model_args.model_type = model_args.model_name_or_path.split("-")[0].split("_")[
                0
            ]

            # Load model configuration.
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
                logging.warning("You are instantiating a new config instance from scratch.")

            # Load tokenizer.
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
                    "You are instantiating a new tokenizer from scratch. "
                    + "This is not supported, but you can do it from another script, "
                    + "save it, and load it from here, using --tokenizer_name."
                )

            # Rename output directory to reflect model parameters.
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
            logging.info(
                "The output directory for the model has been set to %s",
                training_args.output_dir,
            )

            # Load the model.
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
                logging.info("Model loaded from %s", training_args.output_dir)
            else:
                logging.error(  # pylint: disable=logging-not-lazy
                    "Could not load model from %s. A pre-trained model could "
                    + "not be found in the directory. This can occur if the download of the model was "
                    + "terminated. Try deleting %s and running this script again.",
                    training_args.output_dir,
                    cache_directory,
                )
                raise ValueError(f"Could not load model from {training_args.output_dir}")

            model.resize_token_embeddings(len(tokenizer))

            data_args.ignore_index = training_args.ignore_index
            self.data_args[prediction_type] = data_args
            self.model_args[prediction_type] = model_args

            self.tokenizer[prediction_type] = tokenizer
            self.model[prediction_type] = model
            self.trainer[prediction_type] = Trainer(
                [training_args, self.model_args[prediction_type], self.data_args[prediction_type]], self.model[prediction_type]
            )

    def featurize(self, text: str, limit: bool = False) -> DefaultDict[Any, Any]:

        doc = self.nlp(text)

        # Extract tokens containing...
        # (1) Abbreviations
        abbrev_tokens = []
        for abrv in doc._.abbreviations:
            abbrev_tokens.append(str(abrv._.long_form).split())
        abbrev_tokens_flattened = [t for at in abbrev_tokens for t in at]

        # (2) Entities
        entities = [str(e) for e in doc.ents]
        entity_tokens = [e.split() for e in entities]
        entity_tokens_flattened = [t for et in entity_tokens for t in et]

        # (3) Noun phrases
        np_tokens = []
        for chunk in doc.noun_chunks:
            np_tokens.append(str(chunk.text).split())
        np_tokens_flattened = [t for et in np_tokens for t in et]

        # (4) Verb phrases
        verb_matches = self.verb_matcher(doc)
        spans = [doc[start:end] for _, start, end in verb_matches]
        vp_tokens = filter_spans(spans)
        vp_tokens_flattened = [str(t) for et in vp_tokens for t in et]

        # Limit the samples.
        if limit:
            doc = doc[:limit]

        # Aggregate all features together.
        features: DefaultDict[str, List[Union[int, str]]] = defaultdict(list)
        for token in doc:
            features["tokens"].append(str(token.text))
            features["pos"].append(str(token.tag_))  # previously token.pos_
            features["head"].append(str(token.head))
            # (Note: the following features are binary lists indicating the presence of a
            # feature or not per token, like "[1 0 0 1 1 1 0 0 ...]")
            features["entities"].append(
                1 if token.text in entity_tokens_flattened else 0
            )
            features["np"].append(1 if token.text in np_tokens_flattened else 0)
            features["vp"].append(1 if token.text in vp_tokens_flattened else 0)
            features["abbreviation"].append(
                1 if token.text in abbrev_tokens_flattened else 0
            )

        return features

    def predict_batch(
        self, data: List[Dict[Any, Any]], prediction_type: str
    ) -> Tuple[List[int], List[List[str]], List[List[float]]]:

        # Load data.
        test_dataset = load_and_cache_example_batch(
            self.data_args[prediction_type], self.tokenizer[prediction_type], data,
        )

        # Perform inference.
        intent_pred, slot_preds, slot_pred_confs = self.trainer[prediction_type].evaluate_from_input(test_dataset)

        # Process predictions.
        prediction_replacements = {
            'TERM-DEF' : [('TERM','TERM'),('DEF','DEF')],
            'ABBR-EXP' : [('short','TERM'),('long','DEF')],
            'SYM-NICK' : [('TERM','TERM'),('DEF','DEF')],
        }
        simplified_slot_preds = []
        for slot_pred in slot_preds:
            simplified_slot_pred = []
            for s in slot_pred:
                if s.endswith(prediction_replacements[prediction_type][0][0]):
                    simplified_slot_pred.append(prediction_replacements[prediction_type][0][1])
                elif s.endswith(prediction_replacements[prediction_type][1][0]):
                    simplified_slot_pred.append(prediction_replacements[prediction_type][1][1])
                else:
                    simplified_slot_pred.append("O")
            simplified_slot_preds.append(simplified_slot_pred)

        return intent_pred, simplified_slot_preds, slot_pred_confs
