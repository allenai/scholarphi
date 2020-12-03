import pytest
import spacy
from entities.definitions.commands.detect_definitions import (
    get_abbreviation_pairs,
    get_symbol_nickname_pairs,
    get_symbol_texs,
    get_term_definition_pairs,
)
from scispacy.abbreviation import AbbreviationDetector

nlp = None


pytestmark = pytest.mark.slow


@pytest.fixture(scope="module", autouse=True)
def setup_model():
    """
    Only set up the model once, as it requires the time-consuming initialization
    """
    global nlp  # pylint: disable=global-statement
    nlp = spacy.load("en_core_sci_md")
    abbreviation_pipe = AbbreviationDetector(nlp)
    nlp.add_pipe(abbreviation_pipe)


def test_extract_term_definition_pairs_case_1():
    # Case 1: Definition before the term.
    text = "The technique of learning the underlying data distribution function given labelled examples is known as Supervised Learning in ML literature."
    gold = [
        (
            "Supervised Learning",
            "The technique of learning the underlying data distribution function given labelled examples",
        )
    ]

    # Hardcode features, intents, slots and slots_confidence for the sake of these tests (which are otherwise obtained from the model).
    features = [
        {
            "tokens": [
                "The",
                "technique",
                "of",
                "learning",
                "the",
                "underlying",
                "data",
                "distribution",
                "function",
                "given",
                "labelled",
                "examples",
                "is",
                "known",
                "as",
                "Supervised",
                "Learning",
                "in",
                "ML",
                "literature",
                ".",
            ],
            "pos": [
                "DT",
                "NN",
                "IN",
                "VBG",
                "DT",
                "JJ",
                "NNS",
                "NN",
                "NN",
                "VBN",
                "VBN",
                "NNS",
                "VBZ",
                "VBN",
                "IN",
                "JJ",
                "NNP",
                "IN",
                "NN",
                "NN",
                ".",
            ],
            "head": [
                "technique",
                "known",
                "technique",
                "of",
                "function",
                "function",
                "function",
                "function",
                "learning",
                "examples",
                "examples",
                "function",
                "known",
                "known",
                "Learning",
                "Learning",
                "known",
                "literature",
                "literature",
                "Learning",
                "known",
            ],
            "entity": [0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0],
            "np": [1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            "vp": [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            "abbreviation": [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
            ],
        }
    ]
    slots = [
        [
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "O",
            "O",
            "O",
            "TERM",
            "TERM",
            "O",
            "O",
            "O",
            "O",
        ]
    ]
    slots_confidence = [
        [
            0.99955076,
            0.99992144,
            0.9999387,
            0.9999461,
            0.9999584,
            0.99995697,
            0.9999405,
            0.999931,
            0.9999294,
            0.9999385,
            0.99990106,
            0.9999218,
            0.99996924,
            0.99781585,
            0.9998567,
            0.9995043,
            0.9997199,
            0.9998393,
            0.9998865,
            0.9995171,
            0.99897027,
        ]
    ]

    term_definition_pairs = get_term_definition_pairs(
        text, features[0], slots[0], slots_confidence[0]
    )
    assert len(term_definition_pairs) == len(
        gold
    ), "Incorrect number of Term-Definitions"
    for prediction_pair, gold_pair in zip(term_definition_pairs, gold):
        assert (
            text[prediction_pair.term_start : prediction_pair.term_end] == gold_pair[0]
        ), "Term Incorrect"
        assert (
            text[prediction_pair.definition_start : prediction_pair.definition_end]
            == gold_pair[1]
        ), "Definition Incorrect"


def test_extract_term_definition_pairs_case_2():
    # Case 2: Definition after the term.
    text = "We evaluate our model on SQuAD, a reading comprehension dataset consisting of questions posed by crowdworkers on a set of Wikipedia articles."
    gold = [
        (
            "SQuAD",
            "a reading comprehension dataset consisting of questions posed by crowdworkers on a set of Wikipedia articles",
        )
    ]

    # Hardcode features, intents, slots and slots_confidence for the sake of these tests (which are otherwise obtained from the model).
    features = [
        {
            "tokens": [
                "We",
                "evaluate",
                "our",
                "model",
                "on",
                "SQuAD",
                ",",
                "a",
                "reading",
                "comprehension",
                "dataset",
                "consisting",
                "of",
                "questions",
                "posed",
                "by",
                "crowdworkers",
                "on",
                "a",
                "set",
                "of",
                "Wikipedia",
                "articles",
                ".",
            ],
            "pos": [
                "PRP",
                "VBP",
                "PRP$",
                "NN",
                "IN",
                "NN",
                ",",
                "DT",
                "VBG",
                "NN",
                "NN",
                "VBG",
                "IN",
                "NNS",
                "VBN",
                "IN",
                "NNS",
                "IN",
                "DT",
                "NN",
                "IN",
                "NNP",
                "NNS",
                ".",
            ],
            "head": [
                "evaluate",
                "evaluate",
                "model",
                "evaluate",
                "SQuAD",
                "model",
                "SQuAD",
                "dataset",
                "dataset",
                "dataset",
                "SQuAD",
                "dataset",
                "consisting",
                "of",
                "questions",
                "posed",
                "by",
                "posed",
                "set",
                "on",
                "set",
                "articles",
                "of",
                "evaluate",
            ],
            "entity": [
                0,
                1,
                0,
                1,
                0,
                1,
                0,
                0,
                1,
                1,
                1,
                0,
                0,
                1,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                1,
                1,
                0,
            ],
            "np": [
                1,
                0,
                1,
                1,
                0,
                0,
                0,
                1,
                1,
                1,
                1,
                0,
                0,
                1,
                0,
                0,
                1,
                0,
                1,
                1,
                0,
                1,
                1,
                0,
            ],
            "vp": [
                0,
                1,
                0,
                0,
                0,
                0,
                0,
                0,
                1,
                0,
                0,
                1,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
            ],
            "abbreviation": [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
            ],
        }
    ]
    slots = [
        [
            "O",
            "O",
            "O",
            "O",
            "O",
            "TERM",
            "O",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "DEF",
            "O",
        ]
    ]
    slots_confidence = [
        [
            0.9999578,
            0.9999826,
            0.99999046,
            0.9999851,
            0.999863,
            0.9999236,
            0.9999682,
            0.99983525,
            0.999938,
            0.99983954,
            0.99985385,
            0.99993086,
            0.9999554,
            0.9999474,
            0.9999293,
            0.99994695,
            0.9999515,
            0.99995005,
            0.9999598,
            0.99994326,
            0.9999503,
            0.9999311,
            0.9999398,
            0.9998154,
        ]
    ]

    term_definition_pairs = get_term_definition_pairs(
        text, features[0], slots[0], slots_confidence[0]
    )
    assert len(term_definition_pairs) == len(
        gold
    ), "Incorrect number of Term-Definitions"
    for prediction_pair, gold_pair in zip(term_definition_pairs, gold):
        assert (
            text[prediction_pair.term_start : prediction_pair.term_end] == gold_pair[0]
        ), "Term Incorrect"
        assert (
            text[prediction_pair.definition_start : prediction_pair.definition_end]
            == gold_pair[1]
        ), "Definition Incorrect"


def test_extract_symbol_nickname_pairs_case_1():
    # Case 1: Nickname before symbol.
    text = "The agent acts with a policy SYMBOL in each timestep SYMBOL."
    tex = r"The agent acts with a policy [[FORMULA:\pi]] in each timestep [[FORMULA:t]]"
    gold = [(r"\pi", "policy"), ("t", "timestep")]

    # Hardcode features for the sake of these tests (which are otherwise obtained from the model).
    features = [
        {
            "tokens": [
                "The",
                "agent",
                "acts",
                "with",
                "a",
                "policy",
                "SYMBOL",
                "in",
                "each",
                "timestep",
                "SYMBOL",
                ".",
            ],
            "pos": [
                "DT",
                "NN",
                "VBZ",
                "IN",
                "DT",
                "NN",
                "NN",
                "IN",
                "DT",
                "NN",
                "NN",
                ".",
            ],
            "head": [
                "agent",
                "acts",
                "acts",
                "acts",
                "SYMBOL",
                "SYMBOL",
                "with",
                "acts",
                "SYMBOL",
                "SYMBOL",
                "in",
                "acts",
            ],
            "entity": [0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0],
            "np": [1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0],
            "vp": [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            "abbreviation": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        }
    ]

    symbol_texs = get_symbol_texs(text, tex)
    symbol_nickname_pairs = get_symbol_nickname_pairs(text, features[0], symbol_texs)
    assert len(symbol_nickname_pairs) == len(
        gold
    ), "Incorrect number of Symbol-Nicknames"
    for prediction_pair, gold_pair in zip(symbol_nickname_pairs, gold):
        if symbol_texs is not None and prediction_pair.term_start in symbol_texs:
            assert (
                symbol_texs[prediction_pair.term_start] == gold_pair[0]
            ), "Symbol Incorrect"
        else:
            assert (
                text[prediction_pair.term_start : prediction_pair.term_end]
                == gold_pair[0]
            ), "Symbol Incorrect"
        assert (
            text[prediction_pair.definition_start : prediction_pair.definition_end]
            == gold_pair[1]
        ), "Nickname Incorrect"


def test_extract_symbol_nickname_pairs_case_2():
    # Case 2: Nickname after symbol.
    text = "The architecture consists of SYMBOL dense layers trained with SYMBOL learning rate."
    tex = "The architecture consists of [[FORMULA:L_d]] dense layers trained with [[FORMULA:\alpha]] learning rate."
    gold = [("L_d", "dense layers"), ("\alpha", "learning rate")]

    # Hardcode features for the sake of these tests (which are otherwise obtained from the model).
    features = [
        {
            "tokens": [
                "The",
                "architecture",
                "consists",
                "of",
                "SYMBOL",
                "dense",
                "layers",
                "trained",
                "with",
                "SYMBOL",
                "learning",
                "rate",
                ".",
            ],
            "pos": [
                "DT",
                "NN",
                "VBZ",
                "IN",
                "NN",
                "JJ",
                "NNS",
                "VBN",
                "IN",
                "NN",
                "NN",
                "NN",
                ".",
            ],
            "head": [
                "architecture",
                "consists",
                "consists",
                "consists",
                "layers",
                "layers",
                "of",
                "layers",
                "trained",
                "rate",
                "rate",
                "with",
                "consists",
            ],
            "entity": [0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
            "np": [1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
            "vp": [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            "abbreviation": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        }
    ]
    symbol_texs = get_symbol_texs(text, tex)
    symbol_nickname_pairs = get_symbol_nickname_pairs(text, features[0], symbol_texs)
    assert len(symbol_nickname_pairs) == len(
        gold
    ), "Incorrect number of Symbol-Nicknames"
    for prediction_pair, gold_pair in zip(symbol_nickname_pairs, gold):
        if symbol_texs is not None and prediction_pair.term_start in symbol_texs:
            assert (
                symbol_texs[prediction_pair.term_start] == gold_pair[0]
            ), "Symbol Incorrect"
        else:
            assert (
                text[prediction_pair.term_start : prediction_pair.term_end]
                == gold_pair[0]
            ), "Symbol Incorrect"
        assert (
            text[prediction_pair.definition_start : prediction_pair.definition_end]
            == gold_pair[1]
        ), "Nickname Incorrect"


def test_extract_symbol_nickname_pairs_case_3():
    # Case 3: SYMBOL-th pattern.
    text = "This process repeats for every SYMBOLth timestep."
    tex = "This process repeats for every [[FORMULA:k]]th timestep."
    gold = [("k", "timestep")]

    # Hardcode features for the sake of these tests (which are otherwise obtained from the model).
    features = [
        {
            "tokens": [
                "This",
                "process",
                "repeats",
                "for",
                "every",
                "SYMBOLth",
                "timestep",
                ".",
            ],
            "pos": ["DT", "NN", "NNS", "IN", "DT", "JJ", "NN", "."],
            "head": [
                "repeats",
                "repeats",
                "repeats",
                "timestep",
                "timestep",
                "timestep",
                "repeats",
                "repeats",
            ],
            "entity": [0, 1, 1, 0, 0, 1, 1, 0],
            "np": [1, 1, 1, 0, 0, 0, 0, 0],
            "vp": [0, 0, 0, 0, 0, 0, 0, 0],
            "abbreviation": [0, 0, 0, 0, 0, 0, 0, 0],
        }
    ]
    symbol_texs = get_symbol_texs(text, tex)
    symbol_nickname_pairs = get_symbol_nickname_pairs(text, features[0], symbol_texs)
    assert len(symbol_nickname_pairs) == len(
        gold
    ), "Incorrect number of Symbol-Nicknames"
    for prediction_pair, gold_pair in zip(symbol_nickname_pairs, gold):
        if symbol_texs is not None and prediction_pair.term_start in symbol_texs:
            assert (
                symbol_texs[prediction_pair.term_start] == gold_pair[0]
            ), "Symbol Incorrect"
        else:
            assert (
                text[prediction_pair.term_start : prediction_pair.term_end]
                == gold_pair[0]
            ), "Symbol Incorrect"
        assert (
            text[prediction_pair.definition_start : prediction_pair.definition_end]
            == gold_pair[1]
        ), "Nickname Incorrect"


def test_extract_abbreviation_expansion_pairs_case_1():
    # Case 1: Abbreviation in parentheses.
    text = "We use a Convolutional Neural Network (CNN) based architecture in this model, which is an improvement over state-of-the-art."
    gold = [("CNN", "Convolutional Neural Network")]

    # Hardcode features for the sake of these tests (which are otherwise obtained from the model).
    features = [
        {
            "tokens": [
                "We",
                "use",
                "a",
                "Convolutional",
                "Neural",
                "Network",
                "(",
                "CNN",
                ")",
                "based",
                "architecture",
                "in",
                "this",
                "model",
                ",",
                "which",
                "is",
                "an",
                "improvement",
                "over",
                "state-of-the-art",
                ".",
            ],
            "pos": [
                "PRP",
                "VBP",
                "DT",
                "JJ",
                "NNP",
                "NNP",
                "-LRB-",
                "NNP",
                "-RRB-",
                "VBD",
                "NN",
                "IN",
                "DT",
                "NN",
                ",",
                "WDT",
                "VBZ",
                "DT",
                "NN",
                "IN",
                "JJ",
                ".",
            ],
            "head": [
                "use",
                "use",
                "architecture",
                "architecture",
                "Network",
                "Convolutional",
                "CNN",
                "Network",
                "CNN",
                "architecture",
                "use",
                "model",
                "model",
                "use",
                "model",
                "is",
                "use",
                "improvement",
                "is",
                "improvement",
                "over",
                "use",
            ],
            "entity": [
                0,
                0,
                0,
                1,
                1,
                1,
                0,
                1,
                0,
                0,
                1,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
            ],
            "np": [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0],
            "vp": [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            "abbreviation": [
                0,
                0,
                0,
                1,
                1,
                1,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
            ],
        }
    ]
    abbreviation_pairs = get_abbreviation_pairs(text, features[0], nlp)
    assert len(abbreviation_pairs) == len(gold), "Incorrect number of Abbreviations"
    for prediction_pair, gold_pair in zip(abbreviation_pairs, gold):
        assert (
            text[prediction_pair.term_start : prediction_pair.term_end] == gold_pair[0]
        ), "Abbreviation Incorrect"
        assert (
            text[prediction_pair.definition_start : prediction_pair.definition_end]
            == gold_pair[1]
        ), "Expansion Incorrect"


def test_extract_abbreviation_expansion_pairs_case_2():
    # Case 2 : Abbreviation contains multiple lowercase letters.
    text = "We propose a new class of architectures called Conductive Networks (CondNets) in this paper."
    gold = [("CondNets", "Conductive Networks")]

    # Hardcode features for the sake of these tests (which are otherwise obtained from the model).
    features = [
        {
            "tokens": [
                "We",
                "propose",
                "a",
                "new",
                "class",
                "of",
                "architectures",
                "called",
                "Conductive",
                "Networks",
                "(",
                "CondNets",
                ")",
                "in",
                "this",
                "paper",
                ".",
            ],
            "pos": [
                "PRP",
                "VBP",
                "DT",
                "JJ",
                "NN",
                "IN",
                "NNS",
                "VBN",
                "JJ",
                "NNPS",
                "-LRB-",
                "NN",
                "-RRB-",
                "IN",
                "DT",
                "NN",
                ".",
            ],
            "head": [
                "propose",
                "propose",
                "class",
                "class",
                "propose",
                "architectures",
                "class",
                "architectures",
                "Networks",
                "called",
                "CondNets",
                "Networks",
                "CondNets",
                "paper",
                "paper",
                "called",
                "propose",
            ],
            "entity": [0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0],
            "np": [1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            "vp": [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            "abbreviation": [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        }
    ]
    abbreviation_pairs = get_abbreviation_pairs(text, features[0], nlp)
    assert len(abbreviation_pairs) == len(gold), "Incorrect number of Abbreviations"
    for prediction_pair, gold_pair in zip(abbreviation_pairs, gold):
        assert (
            text[prediction_pair.term_start : prediction_pair.term_end] == gold_pair[0]
        ), "Abbreviation Incorrect"
        assert (
            text[prediction_pair.definition_start : prediction_pair.definition_end]
            == gold_pair[1]
        ), "Expansion Incorrect"
