# When linting this file, ignore outer name redefinitions, because outer name redefinitions is
# how test fixtures (e.g., for initializing NLP models) are used in Pytest.
# pylint: disable=redefined-outer-name

import pytest
from entities.definitions.commands.detect_definitions import (
    DefinitionDetectionModel,
    consolidate_keyword_definitions,
    get_abbreviations,
    get_symbol_nickname_pairs,
)


@pytest.fixture(scope="module")
def model():
    model = DefinitionDetectionModel(['AI2020', 'DocDef2', 'W00'])
    return model


# All tests that require the setup of the model should both:
# 1. Take 'model' as an argument, and
# 2. Be marked with 'pytest.mark.slow' so the test is omitted when running typical unit tests.
@pytest.mark.slow
def test_model_extracts_simple_definitions(model: DefinitionDetectionModel):
    prediction_type = 'W00'
    features = model.featurize("Neural networks are machine learning models.")
    intents, slots, _ = model.predict_batch([features], prediction_type)
    assert intents[prediction_type][0]
    assert slots[prediction_type][0] == ["TERM", "TERM", "O", "DEF", "DEF", "DEF", "O"]


@pytest.mark.slow
def test_extract_term_definition_consolidate():
    prediction_type = 'W00'
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

    term_definition_pairs = consolidate_keyword_definitions(
        text, tokens, slots, confidences, prediction_type
    )
    assert len(term_definition_pairs) == 1
    assert term_definition_pairs[0].term_text == "Neural networks"
    assert term_definition_pairs[0].definition_text == "machine learning models"

@pytest.mark.slow
def test_model_extracts_nickname_before_symbol(model: DefinitionDetectionModel):
    prediction_type = 'DocDef2'
    features = model.featurize("The agent acts with a policy SYMBOL in each timestep SYMBOL")
    intents, slots, _ = model.predict_batch([features], prediction_type)
    assert intents[prediction_type][0]
    assert slots[prediction_type][0] == ["O", "O", "O", "O", "O", "DEF", "TERM", "O", "O", "DEF", "TERM"]


@pytest.mark.slow
def test_extract_symbol_nickname_consolidate():
    prediction_type = 'DocDef2'
    text = "The agent acts with a policy SYMBOL in each timestep SYMBOL."
    tokens, slots, confidences = zip(
        *[
            ("The", "O", 1.0),
            ("agent", "O", 1.0),
            ("acts", "O", 1.0),
            ("with", "O", 1.0),
            ("a", "O", 1.0),
            ("policy", "DEF", 1.0),
            ("SYMBOL", "TERM", 1.0),
            ("in", "O", 1.0),
            ("each", "O", 1.0),
            ("timestep", "DEF", 1.0),
            ("SYMBOL", "TERM", 1.0),
        ]
    )

    term_definition_pairs = consolidate_keyword_definitions(
        text, tokens, slots, confidences, prediction_type
    )
    assert len(term_definition_pairs) == 2
    assert term_definition_pairs[0].term_text == "SYMBOL"
    assert term_definition_pairs[0].definition_text == "policy"
    assert term_definition_pairs[1].term_text == "SYMBOL"
    assert term_definition_pairs[1].definition_text == "timestep"

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

@pytest.mark.slow
def test_model_extracts_nickname_symbol_separated_by_colon(model: DefinitionDetectionModel):
    prediction_type = 'DocDef2'
    features = model.featurize("The agent acts with a policy : SYMBOL")
    intents, slots, _ = model.predict_batch([features], prediction_type)
    assert intents[prediction_type][0]
    assert slots[prediction_type][0] == ["O", "O", "O", "O", "O", "DEF", "O", "TERM"]

def test_extract_nicknames_symbols_separated_by_colon():
    text = "The agent acts with SYMBOL : policy."
    symbol_texs = {20: r"\pi"}
    tokens, pos = list(
        zip(
            *[
                ("The", "DT"),
                ("agent", "NN"),
                ("acts", "VBZ"),
                ("with", "IN"),
                ("SYMBOL", "NN"),
                (":", ":"),
                ("policy", "NN"),
                (".", "."),
            ]
        )
    )

    symbol_nickname_pairs = get_symbol_nickname_pairs(text, tokens, pos, symbol_texs)
    assert len(symbol_nickname_pairs) == 1

    nickname0 = symbol_nickname_pairs[0]
    assert nickname0.term_text == r"\pi"
    assert nickname0.definition_text == "policy"

@pytest.mark.slow
def test_model_extracts_nickname_symbol_parentheses(model: DefinitionDetectionModel):
    prediction_type = 'DocDef2'
    features = model.featurize("The agent acts with policy (SYMBOL)")
    intents, slots, _ = model.predict_batch([features], prediction_type)
    assert intents[prediction_type][0]
    assert slots[prediction_type][0] == ["O", "O", "O", "O", "DEF", "O", "TERM", "O"]

def test_extract_nicknames_symbols_parentheses():
    text = "The agent acts with policy (SYMBOL)."
    symbol_texs = {28: r"\pi"}
    tokens, pos = list(
        zip(
            *[
                ("The", "DT"),
                ("agent", "NN"),
                ("acts", "VBZ"),
                ("with", "IN"),
                ("policy", "NN"),
                ("(", "-LRB-"),
                ("SYMBOL", "NN"),
                (")", "-RRB-"),
                (".", "."),
            ]
        )
    )

    symbol_nickname_pairs = get_symbol_nickname_pairs(text, tokens, pos, symbol_texs)
    assert len(symbol_nickname_pairs) == 1

    nickname0 = symbol_nickname_pairs[0]
    assert nickname0.term_text == r"\pi"
    assert nickname0.definition_text == "policy"

@pytest.mark.slow
def test_model_extracts_nickname_symbol_filter(model: DefinitionDetectionModel):
    prediction_type = 'DocDef2'
    features = model.featurize("The agent acts with SYMBOL SYMBOL")
    intents, slots, _ = model.predict_batch([features], prediction_type)
    assert intents[prediction_type][0] == 0
    assert slots[prediction_type][0] == ["O", "O", "O", "O", "O", "O"]


@pytest.mark.slow
def test_extract_symbol_nickname_cnsolidate_2():
    prediction_type = 'DocDef2'
    text = "The agent acts with SYMBOL SYMBOL"
    tokens, slots, confidences = zip(
        *[
            ("The", "O", 1.0),
            ("agent", "O", 1.0),
            ("acts", "O", 1.0),
            ("with", "O", 1.0),
            ("SYMBOL", "O", 1.0),
            ("SYMBOL", "O", 1.0),
        ]
    )

    term_definition_pairs = consolidate_keyword_definitions(
        text, tokens, slots, confidences, prediction_type
    )
    assert len(term_definition_pairs) == 0

def test_extract_nicknames_symbols_filter():
    text = "The agent acts with SYMBOL SYMBOL."
    symbol_texs = {20: r"\pi", 27: "p"}
    tokens, pos = list(
        zip(
            *[
                ("The", "DT"),
                ("agent", "NN"),
                ("acts", "VBZ"),
                ("with", "IN"),
                ("SYMBOL", "NN"),
                ("SYMBOL", "NN"),
                (".", "."),
            ]
        )
    )

    symbol_nickname_pairs = get_symbol_nickname_pairs(text, tokens, pos, symbol_texs)
    assert len(symbol_nickname_pairs) == 0


@pytest.mark.slow
def test_model_extracts_nickname_after_symbol(model: DefinitionDetectionModel):
    prediction_type = 'DocDef2'
    features = model.featurize("The architecture consists of SYMBOL dense layers trained with SYMBOL learning rate")
    intents, slots, _ = model.predict_batch([features], prediction_type)
    assert intents[prediction_type][0]
    assert slots[prediction_type][0] == ["O", "O", "O", "O", "TERM", "DEF", "DEF", "O", "O", "TERM", "DEF", "DEF"]

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


@pytest.mark.slow
def test_model_extracts_nickname_for_th_index_pattern(model: DefinitionDetectionModel):
    prediction_type = 'DocDef2'
    features = model.featurize("This process repeats for every SYMBOLth timestep")
    intents, slots, _ = model.predict_batch([features], prediction_type)
    assert intents[prediction_type][0]
    assert slots[prediction_type][0] == ["O", "O", "O", "O", "O", "TERM", "DEF"]

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
def test_model_extract_abbreviation_acronym(model: DefinitionDetectionModel):
    prediction_type = 'AI2020'
    features = model.featurize("We use a Convolutional Neural Network (CNN) based architecture")
    intents, slots, _ = model.predict_batch([features], prediction_type)
    assert intents[prediction_type][0]
    assert slots[prediction_type][0] == ["O", "O", "O", "DEF", "DEF", "DEF", "O", "TERM", "O", "O", "O"]


@pytest.mark.slow
def test_extract_abbreviation_expansion_consolidate():
    prediction_type = 'AI2020'
    text = "We use a Convolutional Neural Network (CNN) based architecture"
    tokens, slots, confidences = zip(
        *[
            ("We", "O", 1.0),
            ("use", "O", 1.0),
            ("a", "O", 1.0),
            ("Convolutional", "DEF", 1.0),
            ("Neural", "DEF", 1.0),
            ("Network", "DEF", 1.0),
            ("(", "O", 1.0),
            ("CNN", "TERM", 1.0),
            (")", "O", 1.0),
            ("based", "O", 1.0),
            ("architecture", "O", 1.0),
        ]
    )

    abbreviation_expansion_pairs = consolidate_keyword_definitions(
        text, tokens, slots, confidences, prediction_type
    )
    assert len(abbreviation_expansion_pairs) == 1
    assert abbreviation_expansion_pairs[0].term_text == "CNN"
    assert abbreviation_expansion_pairs[0].definition_text == "Convolutional Neural Network"

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
def test_model_extract_abbreviation_shortened_word(model: DefinitionDetectionModel):
    prediction_type = 'AI2020'
    features = model.featurize("We propose Conductive Networks (CondNets)")
    intents, slots, _ = model.predict_batch([features], prediction_type)
    assert intents[prediction_type][0]
    assert slots[prediction_type][0] == ["O", "O", "DEF", "DEF", "O", "TERM", "O"]

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
