from dataclasses import dataclass, field
from typing import Optional
from transformers import TrainingArguments as defaultTrainingArguments


@dataclass
class ModelArguments:
    """
    Arguments pertaining to which model/config/tokenizer we are going to fine-tune, or train from scratch.
    """

    model_name_or_path: Optional[str] = field(
        default=None,
        metadata={
            "help": "The model checkpoint for weights initialization. Leave None if you want to train a model from scratch."
        },
    )
    prediction_type: Optional[str] = field(
        default=None,
        metadata={
            "help": "The model prediction type. One of [TERM-DEF, ABBR-EXP, SYM-NICK]"
        },
    )
    config_name: Optional[str] = field(
        default=None,
        metadata={
            "help": "Pretrained config name or path if not the same as model_name"
        },
    )
    tokenizer_name: Optional[str] = field(
        default=None,
        metadata={
            "help": "Pretrained tokenizer name or path if not the same as model_name"
        },
    )
    cache_dir: Optional[str] = field(
        default=None,
        metadata={
            "help": "Where do you want to store the pretrained models downloaded from s3"
        },
    )
    


@dataclass
class TrainingArguments(defaultTrainingArguments):
    """
    Arguments pertaining to which model/config/tokenizer we are going to fine-tune, or train from scratch.
    """

    ignore_index: Optional[int] = field(
        default=0,
        metadata={
            "help": "Specifies a target value that is ignored and does not contribute to the input gradient"
        },
    )
    slot_loss_coef: Optional[float] = field(
        default=1.0, metadata={"help": "Coeffcient for the slot loss"},
    )
    use_crf: bool = field(default=False, metadata={"help": "Wehther to use CRF"})
    slot_pad_label: Optional[str] = field(
        default="PAD",
        metadata={
            "help": "Pad token for slot label pad (to be ignore when calculate loss)"
        },
    )
    dropout_rate: Optional[float] = field(
        default=0.1, metadata={"help": "Dropout for fully-connected layers"},
    )
    use_pos: bool = field(
        default=False, metadata={"help": "Wehther to use POS embedding or not"}
    )
    use_np: bool = field(
        default=False, metadata={"help": "Wehther to use NP embedding or not"}
    )
    use_vp: bool = field(
        default=False, metadata={"help": "Wehther to use VP embedding or not"}
    )
    use_entity: bool = field(
        default=False, metadata={"help": "Wehther to use Entity embedding or not"}
    )
    use_acronym: bool = field(
        default=False, metadata={"help": "Wehther to use Acronym embedding or not"}
    )

    use_heuristic: bool = field(
        default=False, metadata={"help": "Wehther to use heuristic filters or not"}
    )


@dataclass
class DataTrainingArguments:
    """
    Arguments pertaining to what data we are going to input our model for training and eval.
    """

    overwrite_cache: bool = field(
        default=False,
        metadata={"help": "Overwrite the cached training and evaluation sets"},
    )
    task: Optional[str] = field(
        default=None, metadata={"help": "The name of the task to train"},
    )
    kfold: Optional[int] = field(
        default=-1, metadata={"help": "TBW"},
    )
    data_dir: Optional[str] = field(
        default="./data", metadata={"help": "The input data dir"},
    )
    intent_label_file: Optional[str] = field(
        default="intent_label.txt", metadata={"help": "Intent label file"},
    )
    slot_label_file: Optional[str] = field(
        default="slot_label.txt", metadata={"help": "Slot label file"},
    )
    pos_label_file: Optional[str] = field(
        default="pos_label.txt", metadata={"help": "POS label file"},
    )
    max_seq_len: Optional[int] = field(
        default=50, metadata={"help": "TBW"},
    )
