import pytest

from entities.definitions.commands.detect_definitions import *


@pytest.fixture(scope="module", autouse=True)
def setup_model():
    """
    Only set up the extractor once, as it requires the time-consuming initialization
    of an NLP model.
    """
    global model  # pylint: disable=global-statement
    model = DefinitionDetectionModel()

def test_term_definition_pairs(text, gold):
    featurized_text = model.featurize(text)
    features = [featurized_text]
    intents, slots, slots_conf = model.predict_batch(
        cast(List[Dict[Any, Any]], features)
    )
    term_definition_pairs = get_term_definition_pairs(
            text,
            features[0],
            slots[0],
            slots_conf[0]
    )
    assert len(term_definition_pairs) == len(gold), "Incorrect number of Term-Definitions"
    for prediction_pair, gold_pair in zip(term_definition_pairs, gold):
        assert text[prediction_pair.term_start:prediction_pair.term_end] == gold_pair[0], "Term Incorrect"
        assert text[prediction_pair.definition_start:prediction_pair.definition_end] == gold_pair[1], "Definition Incorrect"

def test_symbol_nickname_pairs(text, tex, gold):
    featurized_text = model.featurize(text)
    features = [featurized_text]
    symbol_texs = get_symbol_texs(
        text, tex
    )
    symbol_nickname_pairs = get_symbol_nickname_pairs(text, features[0], symbol_texs)
    assert len(symbol_nickname_pairs) == len(gold), "Incorrect number of Symbol-Nicknames"
    for prediction_pair, gold_pair in zip(symbol_nickname_pairs, gold):
        if symbol_texs is not None and prediction_pair.term_start in symbol_texs:
            assert symbol_texs[prediction_pair.term_start] == gold_pair[0], "Symbol Incorrect"
        else:
            assert text[prediction_pair.term_start:prediction_pair.term_end] == gold_pair[0], "Symbol Incorrect"
        assert text[prediction_pair.definition_start:prediction_pair.definition_end] == gold_pair[1], "Nickname Incorrect"
        
def test_abbreviation_expansion_pairs(text, gold):
    featurized_text = model.featurize(text)
    features = [featurized_text]
    abbreviation_pairs = get_abbreviation_pairs(
        text, features[0], model.nlp
    )
    assert len(abbreviation_pairs) == len(gold), "Incorrect number of Abbreviations"
    for prediction_pair, gold_pair in zip(abbreviation_pairs, gold):
        assert text[prediction_pair.term_start:prediction_pair.term_end] == gold_pair[0], "Abbreviation Incorrect"
        assert text[prediction_pair.definition_start:prediction_pair.definition_end] == gold_pair[1], "Expansion Incorrect"
    

def test_basic():
    # Test Abbreviation-Expansion detection
    ## Case 1: Abbreviation in parenthesis
    text = "We use a Convolutional Neural Network (CNN) based architecture in this model, which is an improvement over state-of-the-art"
    gold = [('CNN','Convolutional Neural Network')]
    test_abbreviation_expansion_pairs(text, gold)

    # These two are important cases that don't yet work in the current abbreviation detection system
    # ## Case 2: Abbreviation not in parenthesis
    # text = "We use a Convolutional Neural Network, known as CNN, based architecture in this model, which is an improvement over state-of-the-art"
    # gold = [('CNN','Convolutional Neural Network')]
    # test_abbreviation_expansion_pairs(text, gold)

    # ## Case 3: Expansion in parenthesis
    # text = "GANs (Generative Adversarial networks) outperform most generative models in the novel human face generation task."
    # gold = [(GANs,Generative Adversarial networks)]
    # test_abbreviation_expansion_pairs(text, gold)

    ## Case 4: Abbreviation contains multiple lowercase letters
    text = "We propose a new class of architectures called Conductive Networks (CondNets) in this paper."
    gold = [('CondNets','Conductive Networks')]
    test_abbreviation_expansion_pairs(text, gold)

    # Test Symbol-Nickname detection
    ## Case 1: Nickname before symbol 
    text = "The agent acts with a policy SYMBOL in each timestep SYMBOL."
    tex = "The agent acts with a policy [[FORMULA:\pi]] in each timestep [[FORMULA:t]]"
    gold = [('\pi','policy'),('t','timestep')]
    test_symbol_nickname_pairs(text, tex, gold)
    
    ## Case 2: Nickname after symbol 
    text = "The architecture consists of SYMBOL dense layers trained with SYMBOL learning rate."
    tex = "The architecture consists of [[FORMULA:L_d]] dense layers trained with [[FORMULA:\alpha]] learning rate."
    gold = [('L_d','dense layers'),('\alpha','learning rate')]
    test_symbol_nickname_pairs(text, tex, gold)
    
    ## Case 3: SYMBOL-th pattern 
    text = "This process repeats for every SYMBOLth timestep."
    tex = "This process repeats for every [[FORMULA:k]]th timestep."
    gold = [('k','timestep')]
    test_symbol_nickname_pairs(text, tex, gold)
    
    # Test Term-Definition detection
    ## Case 1: Definition before the term
    text = "The technique of learning the underlying data distribution function given labelled examples is known as Supervised Learning in ML literature."
    gold = [('Supervised Learning','The technique of learning the underlying data distribution function given labelled examples')]
    test_term_definition_pairs(text, gold)
    
    ## Case 2: Definition after the term
    text = "We evaluate our model on SQuAD, a reading comprehension dataset consisting of questions posed by crowdworkers on a set of Wikipedia articles."
    gold = [('SQuAD','a reading comprehension dataset consisting of questions posed by crowdworkers on a set of Wikipedia articles')]
    test_term_definition_pairs(text, gold)
    