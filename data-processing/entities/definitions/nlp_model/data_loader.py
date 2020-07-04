import os
import copy
import json
import logging
import torch
from typing import DefaultDict, List, Any, Dict
from torch.utils.data import TensorDataset
from transformers import AutoTokenizer
from .utils import get_intent_labels, get_slot_labels, get_pos_labels


logger = logging.getLogger(__name__)


class InputExample(object):
    """
    A single training/test example
    Args:
        guid: Unique id for the example.
        words: list. The words of the sequence.
        intent_label: string. The intent label of the example.
        slot_labels: list. The slot labels of the example.
    """

    def __init__(
        self,
        guid: str,
        words: List[str],
        intent_label: int,
        slot_labels: List[int],
        pos_labels: List[int],
        np_labels: List[int],
        vp_labels: List[int],
        entity_labels: List[int],
        acronym_labels: List[int],
    ) -> None:
        self.guid = guid
        self.words = words
        self.intent_label = intent_label
        self.slot_labels = slot_labels
        self.pos_labels = pos_labels
        self.np_labels = np_labels
        self.vp_labels = vp_labels
        self.entity_labels = entity_labels
        self.acronym_labels = acronym_labels

    def __repr__(self) -> str:
        return str(self.to_json_string())

    def to_dict(self) -> Dict[Any,Any]:
        """Serializes this instance to a Python dictionary."""
        output = copy.deepcopy(self.__dict__)
        return output

    def to_json_string(self) -> Any:
        """Serializes this instance to a JSON string."""
        return json.dumps(self.to_dict(), indent=2, sort_keys=True) + "\n"


class InputFeatures(object):
    """A single set of features of data."""

    def __init__(
        self,
        input_ids: List[int],
        attention_mask: List[int],
        token_type_ids: List[int],
        intent_label_id: int,
        slot_labels_ids: List[int],
        pos_labels_ids: List[int],
        np_labels_ids: List[int],
        vp_labels_ids: List[int],
        entity_labels_ids: List[int],
        acronym_labels_ids: List[int],
    ):
        self.input_ids = input_ids
        self.attention_mask = attention_mask
        self.token_type_ids = token_type_ids
        self.intent_label_id = intent_label_id
        self.slot_labels_ids = slot_labels_ids
        self.pos_labels_ids = pos_labels_ids
        self.np_labels_ids = np_labels_ids
        self.vp_labels_ids = vp_labels_ids
        self.entity_labels_ids = entity_labels_ids
        self.acronym_labels_ids = acronym_labels_ids

    def __repr__(self) -> str:
        return str(self.to_json_string())

    def to_dict(self) -> Dict[Any,Any]:
        """Serializes this instance to a Python dictionary."""
        output = copy.deepcopy(self.__dict__)
        return output

    def to_json_string(self) -> Any:
        """Serializes this instance to a JSON string."""
        return json.dumps(self.to_dict(), indent=2, sort_keys=True) + "\n"



class DefProcessor(object):
    """Processor for the DefMiner data set """

    def __init__(self, args: Any) -> None:
        self.args = args
        self.intent_labels = get_intent_labels(args)
        self.slot_labels = get_slot_labels(args)
        self.pos_labels = get_pos_labels(args)

    # @classmethod
    def _read_file(self, input_file: str) -> Any:
        """Reads a tab separated value file."""
        with open(input_file, encoding="utf-8") as infile:
            data = json.load(infile)
        return data

    def _create_examples(self, data: Any, set_type:str) -> List[InputExample]:  # intents, slots,
        """Creates examples for the training and dev sets."""
        examples = []
        for i, d in enumerate(data):
            guid = "%s-%s" % (set_type, i)
            # 1. input_text
            words = d["tokens"]  # text.split()  # Some are spaced twice
            # 2. intent
            intent_label = (
                self.intent_labels.index(d["label"])
                if d["label"] in self.intent_labels
                else self.intent_labels.index("UNK")
            )
            # 3. slot
            slot_labels = []
            for s in d["labels"]:
                assert s in self.slot_labels
                slot_labels.append(self.slot_labels.index(s))

            assert len(words) == len(slot_labels)

            pos_labels = []
            for s in d["pos"]:
                assert s in self.pos_labels
                pos_labels.append(self.pos_labels.index(s))

            np_labels = d["np"]
            vp_labels = d["vp"]
            entity_labels = d["entities"]
            acronym_labels = d["acronym"]

            examples.append(
                InputExample(
                    guid=guid,
                    words=words,
                    intent_label=intent_label,
                    slot_labels=slot_labels,
                    pos_labels=pos_labels,
                    np_labels=np_labels,
                    vp_labels=vp_labels,
                    entity_labels=entity_labels,
                    acronym_labels=acronym_labels,
                )
            )
        return examples

    def get_examples(self, mode: str) ->  List[InputExample]:
        """
        Args:
            mode: train, dev, test
        """
        kfold_dir = str(self.args.kfold) if self.args.kfold >= 0 else ""
        data_path = os.path.join(self.args.data_dir, self.args.task, kfold_dir)
        logger.info("LOOKING AT {}".format(data_path))
        return self._create_examples(
            data=self._read_file(os.path.join(data_path, "{}.json".format(mode))),
            set_type=mode,
        )


def convert_examples_to_features(
    examples: List[InputExample],
    max_seq_len: int,
    tokenizer: AutoTokenizer,
    pad_token_label_id: int=-100,
    cls_token_segment_id: int=0,
    pad_token_segment_id: int =0,
    sequence_a_segment_id: int =0,
    mask_padding_with_zero: bool=True,
    verbose: bool=False,
) -> List[InputFeatures]:
    # Setting based on the current model type
    cls_token = tokenizer.cls_token
    sep_token = tokenizer.sep_token
    unk_token = tokenizer.unk_token
    pad_token_id = tokenizer.pad_token_id

    features = []
    for (ex_index, example) in enumerate(examples):
        if verbose and ex_index % 5000 == 0:
            logger.info("Writing example %d of %d" % (ex_index, len(examples)))

        # Tokenize word by word (for NER)
        tokens = []
        slot_labels_ids = []
        pos_labels_ids = []
        np_labels_ids, vp_labels_ids, entity_labels_ids, acronym_labels_ids = (
            [],
            [],
            [],
            [],
        )

        for (
            word,
            slot_label,
            pos_label,
            np_label,
            vp_label,
            entity_label,
            acronym_label,
        ) in zip(
            example.words,
            example.slot_labels,
            example.pos_labels,
            example.np_labels,
            example.vp_labels,
            example.entity_labels,
            example.acronym_labels,
        ):
            word_tokens = tokenizer.tokenize(word)
            if not word_tokens:
                word_tokens = [unk_token]  # For handling the bad-encoded word
            tokens.extend(word_tokens)
            # Use the real label id for the first token of the word, and padding ids for the remaining tokens
            slot_labels_ids.extend(
                [int(slot_label)] + [pad_token_label_id] * (len(word_tokens) - 1)
            )
            pos_labels_ids.extend(
                [int(pos_label)] + [pad_token_label_id] * (len(word_tokens) - 1)
            )

            np_labels_ids.extend(
                [int(np_label)] + [pad_token_label_id] * (len(word_tokens) - 1)
            )
            vp_labels_ids.extend(
                [int(vp_label)] + [pad_token_label_id] * (len(word_tokens) - 1)
            )
            entity_labels_ids.extend(
                [int(entity_label)] + [pad_token_label_id] * (len(word_tokens) - 1)
            )
            acronym_labels_ids.extend(
                [int(acronym_label)] + [pad_token_label_id] * (len(word_tokens) - 1)
            )

        # Account for [CLS] and [SEP]
        special_tokens_count = 2
        if len(tokens) > max_seq_len - special_tokens_count:
            tokens = tokens[: (max_seq_len - special_tokens_count)]
            slot_labels_ids = slot_labels_ids[: (max_seq_len - special_tokens_count)]
            pos_labels_ids = pos_labels_ids[: (max_seq_len - special_tokens_count)]

            np_labels_ids = np_labels_ids[: (max_seq_len - special_tokens_count)]
            vp_labels_ids = vp_labels_ids[: (max_seq_len - special_tokens_count)]
            entity_labels_ids = entity_labels_ids[
                : (max_seq_len - special_tokens_count)
            ]
            acronym_labels_ids = acronym_labels_ids[
                : (max_seq_len - special_tokens_count)
            ]

        # Add [SEP] token
        tokens += [sep_token]
        slot_labels_ids += [pad_token_label_id]
        pos_labels_ids += [pad_token_label_id]
        np_labels_ids += [pad_token_label_id]
        vp_labels_ids += [pad_token_label_id]
        entity_labels_ids += [pad_token_label_id]
        acronym_labels_ids += [pad_token_label_id]
        token_type_ids = [sequence_a_segment_id] * len(tokens)

        # Add [CLS] token
        tokens = [cls_token] + tokens
        slot_labels_ids = [pad_token_label_id] + slot_labels_ids
        pos_labels_ids = [pad_token_label_id] + pos_labels_ids
        np_labels_ids = [pad_token_label_id] + np_labels_ids
        vp_labels_ids = [pad_token_label_id] + vp_labels_ids
        entity_labels_ids = [pad_token_label_id] + entity_labels_ids
        acronym_labels_ids = [pad_token_label_id] + acronym_labels_ids
        token_type_ids = [cls_token_segment_id] + token_type_ids

        input_ids = tokenizer.convert_tokens_to_ids(tokens)

        # The mask has 1 for real tokens and 0 for padding tokens. Only real
        # tokens are attended to.
        attention_mask = [1 if mask_padding_with_zero else 0] * len(input_ids)

        # Zero-pad up to the sequence length.
        padding_length = max_seq_len - len(input_ids)
        input_ids = input_ids + ([pad_token_id] * padding_length)
        attention_mask = attention_mask + (
            [0 if mask_padding_with_zero else 1] * padding_length
        )
        token_type_ids = token_type_ids + ([pad_token_segment_id] * padding_length)
        slot_labels_ids = slot_labels_ids + ([pad_token_label_id] * padding_length)
        pos_labels_ids = pos_labels_ids + ([pad_token_label_id] * padding_length)

        np_labels_ids = np_labels_ids + ([pad_token_label_id] * padding_length)
        vp_labels_ids = vp_labels_ids + ([pad_token_label_id] * padding_length)
        entity_labels_ids = entity_labels_ids + ([pad_token_label_id] * padding_length)
        acronym_labels_ids = acronym_labels_ids + (
            [pad_token_label_id] * padding_length
        )

        assert len(input_ids) == max_seq_len, "Error with input length {} vs {}".format(
            len(input_ids), max_seq_len
        )
        assert (
            len(attention_mask) == max_seq_len
        ), "Error with attention mask length {} vs {}".format(
            len(attention_mask), max_seq_len
        )
        assert (
            len(token_type_ids) == max_seq_len
        ), "Error with token type length {} vs {}".format(
            len(token_type_ids), max_seq_len
        )
        assert (
            len(slot_labels_ids) == max_seq_len
        ), "Error with slot labels length {} vs {}".format(
            len(slot_labels_ids), max_seq_len
        )
        assert (
            len(pos_labels_ids) == max_seq_len
        ), "Error with pos labels length {} vs {}".format(
            len(pos_labels_ids), max_seq_len
        )
        assert (
            len(np_labels_ids) == max_seq_len
        ), "Error with np labels length {} vs {}".format(
            len(np_labels_ids), max_seq_len
        )
        assert (
            len(vp_labels_ids) == max_seq_len
        ), "Error with vp labels length {} vs {}".format(
            len(vp_labels_ids), max_seq_len
        )
        assert (
            len(entity_labels_ids) == max_seq_len
        ), "Error with entity labels length {} vs {}".format(
            len(entity_labels_ids), max_seq_len
        )
        assert (
            len(acronym_labels_ids) == max_seq_len
        ), "Error with acronym labels length {} vs {}".format(
            len(acronym_labels_ids), max_seq_len
        )

        intent_label_id = int(example.intent_label)

        if verbose and ex_index < 3:
            logger.info("*** Example ***")
            logger.info("guid: %s" % example.guid)
            logger.info("tokens: %s" % " ".join([str(x) for x in tokens]))
            logger.info("input_ids: %s" % " ".join([str(x) for x in input_ids]))
            logger.info(
                "attention_mask: %s" % " ".join([str(x) for x in attention_mask])
            )
            logger.info(
                "token_type_ids: %s" % " ".join([str(x) for x in token_type_ids])
            )
            logger.info(
                "intent_label: %s (id = %d)" % (example.intent_label, intent_label_id)
            )
            logger.info("slot_labels: %s" % " ".join([str(x) for x in slot_labels_ids]))
            logger.info("POS_labels: %s" % " ".join([str(x) for x in pos_labels_ids]))

            logger.info("NP_labels: %s" % " ".join([str(x) for x in np_labels_ids]))
            logger.info("VP_labels: %s" % " ".join([str(x) for x in vp_labels_ids]))
            logger.info(
                "entity_labels: %s" % " ".join([str(x) for x in entity_labels_ids])
            )
            logger.info(
                "acronym_labels: %s" % " ".join([str(x) for x in acronym_labels_ids])
            )

        features.append(
            InputFeatures(
                input_ids=input_ids,
                attention_mask=attention_mask,
                token_type_ids=token_type_ids,
                intent_label_id=intent_label_id,
                slot_labels_ids=slot_labels_ids,
                pos_labels_ids=pos_labels_ids,
                np_labels_ids=np_labels_ids,
                vp_labels_ids=vp_labels_ids,
                entity_labels_ids=entity_labels_ids,
                acronym_labels_ids=acronym_labels_ids,
            )
        )
    return features


def load_and_cache_examples(args: Any, tokenizer: AutoTokenizer, mode: str, model_name: str) -> TensorDataset:
    processor = DefProcessor(args)

    # Load data features from cache or dataset file
    cached_features_file = os.path.join(
        args.data_dir,
        "cached_{}_{}_{}_{}".format(
            mode,
            args.task,
            list(filter(None, model_name.split("/"))).pop(),
            args.max_seq_len,
        ),
    )

    if os.path.exists(cached_features_file) and not args.overwrite_cache:
        logger.info("Loading features from cached file %s", cached_features_file)
        features = torch.load(cached_features_file)
    else:
        # Load data features from dataset file
        logger.info("Creating features from dataset file at %s", args.data_dir)
        if mode == "train":
            examples = processor.get_examples("train")
        elif mode == "dev":
            examples = processor.get_examples("dev")
        elif mode == "test":
            examples = processor.get_examples("test")
        else:
            raise Exception("For mode, Only train, dev, test is available")

        # Use cross entropy ignore index as padding label id so that only real label ids contribute to the loss later
        pad_token_label_id = args.ignore_index
        features = convert_examples_to_features(
            examples, args.max_seq_len, tokenizer, pad_token_label_id=pad_token_label_id
        )
        logger.info("Saving features into cached file %s", cached_features_file)
        torch.save(features, cached_features_file)

    # Convert to Tensors and build dataset
    all_input_ids = torch.tensor([f.input_ids for f in features], dtype=torch.long)
    all_attention_mask = torch.tensor(
        [f.attention_mask for f in features], dtype=torch.long
    )
    all_token_type_ids = torch.tensor(
        [f.token_type_ids for f in features], dtype=torch.long
    )
    all_intent_label_ids = torch.tensor(
        [f.intent_label_id for f in features], dtype=torch.long
    )
    all_slot_labels_ids = torch.tensor(
        [f.slot_labels_ids for f in features], dtype=torch.long
    )
    all_pos_labels_ids = torch.tensor(
        [f.pos_labels_ids for f in features], dtype=torch.long
    )

    all_np_labels_ids = torch.tensor(
        [f.np_labels_ids for f in features], dtype=torch.float
    )
    all_vp_labels_ids = torch.tensor(
        [f.vp_labels_ids for f in features], dtype=torch.float
    )
    all_entity_labels_ids = torch.tensor(
        [f.entity_labels_ids for f in features], dtype=torch.float
    )
    all_acronym_labels_ids = torch.tensor(
        [f.acronym_labels_ids for f in features], dtype=torch.float
    )

    dataset = TensorDataset(
        all_input_ids,
        all_attention_mask,
        all_token_type_ids,
        all_intent_label_ids,
        all_slot_labels_ids,
        all_pos_labels_ids,
        all_np_labels_ids,
        all_vp_labels_ids,
        all_entity_labels_ids,
        all_acronym_labels_ids,
    )
    return dataset


def load_and_cache_examples_one(args: Any, tokenizer: AutoTokenizer, data: Dict[Any,Any], model_name: str) -> TensorDataset:
    processor = DefProcessor(args)
    example = InputExample(
        guid="one",
        words=data["tokens"],
        intent_label=1,  # fakse intent label
        slot_labels=[1] * len(data["tokens"]),  # fake slot labels
        pos_labels=[
            processor.pos_labels.index(s) if s in processor.pos_labels else 0
            for s in data["pos"]
        ],
        np_labels=data["np"],
        vp_labels=data["vp"],
        entity_labels=data["entities"],
        acronym_labels=data["acronym"],
    )

    # Use cross entropy ignore index as padding label id so that only real label ids contribute to the loss later
    features = convert_examples_to_features(
        [example], args.max_seq_len, tokenizer, pad_token_label_id=args.ignore_index
    )

    # Convert to Tensors and build dataset
    all_input_ids = torch.tensor([f.input_ids for f in features], dtype=torch.long)
    all_attention_mask = torch.tensor(
        [f.attention_mask for f in features], dtype=torch.long
    )
    all_token_type_ids = torch.tensor(
        [f.token_type_ids for f in features], dtype=torch.long
    )
    all_intent_label_ids = torch.tensor(
        [f.intent_label_id for f in features], dtype=torch.long
    )
    all_slot_labels_ids = torch.tensor(
        [f.slot_labels_ids for f in features], dtype=torch.long
    )
    all_pos_labels_ids = torch.tensor(
        [f.pos_labels_ids for f in features], dtype=torch.long
    )

    all_np_labels_ids = torch.tensor(
        [f.np_labels_ids for f in features], dtype=torch.float
    )
    all_vp_labels_ids = torch.tensor(
        [f.vp_labels_ids for f in features], dtype=torch.float
    )
    all_entity_labels_ids = torch.tensor(
        [f.entity_labels_ids for f in features], dtype=torch.float
    )
    all_acronym_labels_ids = torch.tensor(
        [f.acronym_labels_ids for f in features], dtype=torch.float
    )

    dataset = TensorDataset(
        all_input_ids,
        all_attention_mask,
        all_token_type_ids,
        all_intent_label_ids,
        all_slot_labels_ids,
        all_pos_labels_ids,
        all_np_labels_ids,
        all_vp_labels_ids,
        all_entity_labels_ids,
        all_acronym_labels_ids,
    )
    return dataset
