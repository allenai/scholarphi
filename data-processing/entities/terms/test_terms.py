import json, os
from entities.terms import TermExtractor

# from dataclasses import dataclass
# from typing import Iterator
#
# import re
import json

# from common.parse_tex import DEFAULT_CONTEXT_SIZE, EntityExtractor, PlaintextExtractor
# from common.types import SerializableEntity

# TODO: Add asserts for definition text & definition html.

glossary = json.load(open(os.path.join('resources', 'aggregate_glossary.json')))

def test_extract_single_terms(terms):
    extractor = TermExtractor(input_glossary=glossary)
    terms = list(
        extractor.parse(
            "main.tex",
            "/title{towards interpretable semantic segmentation via gradient-weighted class activation mapping}",
        )
    )
    assert len(terms) == 3
    term1 = terms[0]
    assert term1.term == "segmentation"
    assert term1.start == 39
    assert term1.end == 49
    assert term1.context_tex == "/title{towards interpretable semantic segmentation via gradient-weighted class activation mapping}"

    term2 = terms[1]
    assert term2.term == "gradient"
    assert term2.start == 55
    assert term2.end == 62
    assert term2.context_tex == "/title{towards interpretable semantic segmentation via gradient-weighted class activation mapping}"

    term3 = terms[2]
    assert term3.term == "class"
    assert term3.start == 73
    assert term3.end == 77
    assert term3.context_tex == "/title{towards interpretable semantic segmentation via gradient-weighted class activation mapping}"

def test_extract_multiple_terms(terms):
    extractor = TermExtractor(input_glossary=glossary)
    terms = list(
        extractor.parse(
            "main.tex",
        "approaches based on deep learning, and convolutional neural networks (cnns) in particular,"
        " have recently substantially improved the performance for various image understanding tasks,"
        " such as image classification, object detection, and image segmentation.")
    )

    assert len(terms) == 5
    term1 = terms[0]
    assert term1.term == "deep learning"
    assert term1.start == 21
    assert term1.end == 33
    assert term1.context_tex == "approaches based on deep learning, and convolutional neural networks (cnns) in particular, " \
                                "have recently substantially improved the performance for various image understanding tasks, " \
                                "such as image classification, object detection, and image segmentation."

    term2 = terms[1]
    assert term2.term == "convolutional neural network"
    assert term2.start == 40
    assert term2.end == 68
    assert term2.context_tex == "approaches based on deep learning, and convolutional neural networks (cnns) in particular, " \
                                "have recently substantially improved the performance for various image understanding tasks, " \
                                "such as image classification, object detection, and image segmentation."

    term3 = terms[2]
    assert term3.term == "neural networks"
    assert term3.start == 55
    assert term3.end == 69
    assert term3.context_tex == "approaches based on deep learning, and convolutional neural networks (cnns) in particular, " \
                                "have recently substantially improved the performance for various image understanding tasks, " \
                                "such as image classification, object detection, and image segmentation."

    term4 = terms[3]
    assert term4.term == "performance"
    assert term4.start == 134
    assert term4.end == 144
    assert term4.context_tex == "approaches based on deep learning, and convolutional neural networks (cnns) in particular, " \
                                "have recently substantially improved the performance for various image understanding tasks, " \
                                "such as image classification, object detection, and image segmentation."

    term5 = terms[4]
    assert term5.term == "object"
    assert term5.start == 215
    assert term5.end == 220
    assert term5.context_tex == "approaches based on deep learning, and convolutional neural networks (cnns) in particular, " \
                                "have recently substantially improved the performance for various image understanding tasks, " \
                                "such as image classification, object detection, and image segmentation."

    term6 = terms[5]
    assert term6.term == "segmentation"
    assert term6.start == 243
    assert term6.end == 254
    assert term6.context_tex == "approaches based on deep learning, and convolutional neural networks (cnns) in particular, " \
                                "have recently substantially improved the performance for various image understanding tasks, " \
                                "such as image classification, object detection, and image segmentation."


