import json, os
from entities.terms import TermExtractor

# from dataclasses import dataclass
# from typing import Iterator
#
# import re
import json

# from common.parse_tex import DEFAULT_CONTEXT_SIZE, EntityExtractor, PlaintextExtractor
# from common.types import SerializableEntity

glossary = json.load(open(os.path.join('resources', 'aggregate_glossary.json')))

def test_extract_terms(terms):
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
