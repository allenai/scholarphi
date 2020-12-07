# When linting this file, ignore outer name redefinitions, because outer name redefinitions is
# how test fixtures (e.g., for initializing NLP models) are used in Pytest.
# pylint: disable=redefined-outer-name

import pytest
from entities.definitions.commands.detect_definitions import (
    DefinitionDetectionModel,
    consolidate_term_definitions,
    get_abbreviations,
    get_symbol_nickname_pairs,
)


@pytest.fixture(scope="module")
def model():
    model = DefinitionDetectionModel()
    return model


# All tests that require the setup of the model should both:
# 1. Take 'model' as an argument, and
# 2. Be marked with 'pytest.mark.slow' so the test is omitted when running typical unit tests.
@pytest.mark.slow
def test_model_extracts_simple_definitions(model: DefinitionDetectionModel):
    features = model.featurize("Neural networks are machine learning models.")
    intents, slots, _ = model.predict_batch([features])
    assert intents[0]
    assert slots[0] == ["TERM", "TERM", "O", "DEF", "DEF", "DEF", "O"]


@pytest.mark.slow
def test_extract_term_definition_pairs_case_1():
    text = "Neural networks are machine learning models."
    tokens, slots, confidences = zip(
        *[
            ("Neural", "TERM", 1.0),
            ("networks", "TERM", 1.0),
            ("are", "O", 1.0),
            ("machine", "DEF", 1.0),
            ("learning", "DEF", 1.0),
            ("models", "DEF", 1.0),
            (".", "O", 1.0),
        ]
    )

    term_definition_pairs = consolidate_term_definitions(
        text, tokens, slots, confidences
    )
    assert len(term_definition_pairs) == 1
    assert term_definition_pairs[0].term_text == "Neural networks"
    assert term_definition_pairs[0].definition_text == "machine learning models"


def test_extract_nicknames_from_before_symbols():
    text = "The agent acts with a policy SYMBOL in each timestep SYMBOL."
    symbol_texs = {29: r"\pi", 53: "t"}
    tokens, pos = list(
        zip(
            *[
                ("The", "DT"),
                ("agent", "NN"),
                ("acts", "VBZ"),
                ("with", "IN"),
                ("a", "DT"),
                ("policy", "NN"),
                ("SYMBOL", "NN"),
                ("in", "IN"),
                ("each", "DT"),
                ("timestep", "NN"),
                ("SYMBOL", "NN"),
                (".", "."),
            ]
        )
    )

    symbol_nickname_pairs = get_symbol_nickname_pairs(text, tokens, pos, symbol_texs)
    assert len(symbol_nickname_pairs) == 2

    nickname0 = symbol_nickname_pairs[0]
    assert nickname0.term_text == r"\pi"
    assert nickname0.definition_text == "policy"

    nickname1 = symbol_nickname_pairs[1]
    assert nickname1.term_text == "t"
    assert nickname1.definition_text == "timestep"


def test_extract_nicknames_from_after_symbols():
    text = "The architecture consists of SYMBOL dense layers trained with SYMBOL learning rate."
    symbol_texs = {29: "L_d", 62: r"\alpha"}
    tokens, pos = list(
        zip(
            *[
                ("The", "DT"),
                ("architecture", "NN"),
                ("consists", "VBZ"),
                ("of", "IN"),
                ("SYMBOL", "NN"),
                ("dense", "JJ"),
                ("layers", "NNS"),
                ("trained", "VBN"),
                ("with", "IN"),
                ("SYMBOL", "NN"),
                ("learning", "NN"),
                ("rate", "NN"),
                (".", "."),
            ]
        )
    )

    symbol_nickname_pairs = get_symbol_nickname_pairs(text, tokens, pos, symbol_texs)
    assert len(symbol_nickname_pairs) == 2

    nickname0 = symbol_nickname_pairs[0]
    assert nickname0.term_text == "L_d"
    assert nickname0.definition_text == "dense layers"

    nickname1 = symbol_nickname_pairs[1]
    assert nickname1.term_text == r"\alpha"
    assert nickname1.definition_text == "learning rate"


def test_extract_nickname_for_th_index_pattern():
    text = "This process repeats for every SYMBOLth timestep."
    symbol_texs = {31: "k"}
    tokens, pos = list(
        zip(
            *[
                ("This", "DT"),
                ("process", "NN"),
                ("repeats", "NNS"),
                ("for", "IN"),
                ("every", "DT"),
                ("SYMBOLth", "JJ"),
                ("timestep", "NN"),
                (".", "."),
            ]
        )
    )

    symbol_nickname_pairs = get_symbol_nickname_pairs(text, tokens, pos, symbol_texs)
    assert len(symbol_nickname_pairs) == 1

    nickname0 = symbol_nickname_pairs[0]
    assert nickname0.term_text == "k"
    assert nickname0.definition_text == "timestep"


@pytest.mark.slow
def test_extract_abbreviation_acronym(model):
    text = "We use a Convolutional Neural Network (CNN) based architecture."
    tokens = [
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
        ".",
    ]

    abbreviations = get_abbreviations(text, tokens, model.nlp)
    assert len(abbreviations) == 1
    assert abbreviations[0].term_text == "CNN"
    assert abbreviations[0].definition_text == "Convolutional Neural Network"


@pytest.mark.slow
def test_extract_abbreviation_shortened_word(model):
    text = "We propose Conductive Networks (CondNets)."
    tokens = [
        "We",
        "propose",
        "Conductive",
        "Networks",
        "(",
        "CondNets",
        ")",
        ".",
    ]
    abbreviations = get_abbreviations(text, tokens, model.nlp)
    assert len(abbreviations) == 1
    assert abbreviations[0].term_text == "CondNets"
    assert abbreviations[0].definition_text == "Conductive Networks"
