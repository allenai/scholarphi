def test_extract_sentences(terms):
    extractor = TermExtractor()
    terms = list(
        extractor.parse(
            "main.tex",
            "/title (towards interpretable semantic segmentation via gradient-weighted class activation mapping)",
        )
    )
    assert len(terms) == 3
    term1 = terms[0]
    assert term1.term == "segmentation"
    assert term1.start == 1666
    assert term1.end == 1677
    assert term1.context_str == "/title (towards interpretable semantic segmentation via gradient-weighted class activation mapping)"

    term2 = terms[1]
    assert term2.term == "gradient"
    assert term2.start == 1683
    assert term2.end == 1690
    assert term2.context_str == "/title (towards interpretable semantic segmentation via gradient-weighted class activation mapping)"

    term3 = terms[2]
    assert term3.term == "class"
    assert term3.start == 1701
    assert term3.end == 1705
    assert term3.context_str == "/title (towards interpretable semantic segmentation via gradient-weighted class activation mapping)"
