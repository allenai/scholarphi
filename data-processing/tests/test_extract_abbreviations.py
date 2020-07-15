from entities.abbreviations.extractor import AbbreviationExtractor


def assert_abbreviation(abb, id_, text, start, end, expansion, tex):
    # test the equivalence of an abbreviation instance abb and the values it should have
    assert abb.id_ == id_, "ID Incorrect"
    assert abb.text == text, "Abbreviation Short Form Incorrect"
    assert abb.start == start, "Abbreviation Start Position Incorrect"
    assert abb.end == end, "Abbreviation End Position Incorrect"
    assert abb.expansion == expansion, "Abbreviation Expansion Incorrect"
    assert abb.tex == tex, "Abbreviation Instance Incorrect"


def test_basic():
    # tests the most basic plaintext version
    a = AbbreviationExtractor()
    abbs = list(
        a.parse(
            "",
            "Natural Language Processing (NLP) is a sub-field of artificial "
            + "intelligence (AI).",
        )
    )
    # this ensures if you have a different yield order it still works
    abbs.sort(key=lambda x: x.start)

    assert len(abbs) == 4, "Incorrect Number of Abbreviations Detected"
    assert_abbreviation(
        abbs[0],
        "expansion-0",
        "NLP",
        0,
        27,
        "Natural Language Processing",
        "Natural Language Processing",
    )
    assert_abbreviation(
        abbs[1],
        "abbreviation-0-0",
        "NLP",
        29,
        32,
        "Natural Language Processing",
        "NLP",
    )
    assert_abbreviation(
        abbs[2],
        "expansion-1",
        "AI",
        52,
        75,
        "artificial intelligence",
        "artificial intelligence",
    )
    assert_abbreviation(
        abbs[3], "abbreviation-1-0", "AI", 77, 79, "artificial intelligence", "AI",
    )


def test_multiple():
    # slightly more involved example, fail-safe to catch additional bugs anywhere
    a = AbbreviationExtractor()
    abbs = list(
        a.parse(
            "",
            "Natural Language Processing (NLP) is a sub-field of artificial intelligence (AI).\n"
            + " AI can also be applied to other areas that are not NLP.",
        )
    )
    abbs.sort(key=lambda x: x.start)

    assert len(abbs) == 6
    assert_abbreviation(
        abbs[4], "abbreviation-1-1", "AI", 83, 85, "artificial intelligence", "AI"
    )
    assert_abbreviation(
        abbs[5],
        "abbreviation-0-1",
        "NLP",
        134,
        137,
        "Natural Language Processing",
        "NLP",
    )


def test_latex():
    # more realistic example, latex formatting included
    a = AbbreviationExtractor()
    abbs = list(
        a.parse(
            "",
            "Natural Language Processing \\textbf{(NLP)} is a sub-field of artificial intelligence (AI).\n"
            + " Here's a random equation: $E=mc^2$ to throw you off. AI can also be applied to \\textbf{c}omputer \\textbf{v}ision (CV).",
        )
    )
    abbs.sort(key=lambda x: x.start)

    assert len(abbs) == 7
    assert_abbreviation(
        abbs[0],
        "expansion-0",
        "NLP",
        0,
        27,
        "Natural Language Processing",
        "Natural Language Processing",
    )
    assert_abbreviation(
        abbs[1],
        "abbreviation-0-0",
        "NLP",
        37,
        40,
        "Natural Language Processing",
        "NLP",
    )
    assert_abbreviation(
        abbs[2],
        "expansion-1",
        "AI",
        61,
        84,
        "artificial intelligence",
        "artificial intelligence",
    )
    assert_abbreviation(
        abbs[3], "abbreviation-1-0", "AI", 86, 88, "artificial intelligence", "AI"
    )
    assert_abbreviation(
        abbs[5],
        "expansion-2",
        "CV",
        179,
        204,
        "computer vision",
        "c}omputer \\textbf{v}ision",
    )
    assert_abbreviation(
        abbs[6], "abbreviation-2-0", "CV", 206, 208, "computer vision", "CV"
    )
