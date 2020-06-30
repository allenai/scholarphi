from entities.abbreviations.extractor import AbbreviationExtractor

def test_basic():
    #tests the most basic plaintext version
    a = AbbreviationExtractor()
    abbs = list(a.parse("", "Natural Language Processing (NLP) is a sub-field of artificial intelligence (AI)."))
    #this ensures if you have a different yield order it still works
    abbs.sort(key = lambda x: x.start)

    assert len(abbs) == 4, "Incorrect Number of Abbreviations Detected"
    test_abbreviation(abbs[0], 'NLP', 0, 27, "Natural Language Processing", "Natural Language Processing", 'f', '0')
    test_abbreviation(abbs[1], 'NLP', 29, 32, "Natural Language Processing", "NLP", 's', '1')
    assert abbs[0].str_id[1] == abbs[1].str_id[1], "Different Instances of Abbreviation Do Not Match str_id second char"
    test_abbreviation(abbs[2], 'AI', 52, 75, "artificial intelligence", "artificial intelligence", 'f', '0')
    test_abbreviation(abbs[3], 'AI', 77, 79, "artificial intelligence", "AI", 's', '1')
    assert abbs[2].str_id[1] == abbs[3].str_id[1], "Different Instances of Abbreviation Do Not Match str_id second char"


def test_multiple():
    #slightly more involved example, fail-safe to catch additional bugs anywhere
    a = AbbreviationExtractor()
    abbs = list(a.parse("", "Natural Language Processing (NLP) is a sub-field of artificial intelligence (AI). \
    AI can also be applied to other areas that are not NLP."))
    abbs.sort(key = lambda x: x.start)

    assert len(abbs) == 6
    assert abbs[0].str_id[1] == abbs[1].str_id[1] == abbs[5].str_id[1], "Different Instances of Abbreviation Do Not Match str_id second char"
    assert abbs[2].str_id[1] == abbs[3].str_id[1] == abbs[4].str_id[1], "Different Instances of Abbreviation Do Not Match str_id second char"
    test_abbreviation(abbs[4], 'AI', 86, 88, "artificial intelligence", "AI", 's', '2')
    test_abbreviation(abbs[5], 'NLP', 137, 140, "Natural Language Processing", "NLP", 's', '2')

def test_latex():
    #more realistic example, latex formatting included
    a = AbbreviationExtractor()
    abbs = list(a.parse("", "Natural Language Processing \\textbf{(NLP)} is a sub-field of artificial intelligence (AI). \
    Here's a random equation: $E=mc^2$ to throw you off. AI can also be applied to \\textbf{c}omputer \\textbf{v}ision (CV)."))
    abbs.sort(key = lambda x: x.start)

    assert len(abbs) == 7
    test_abbreviation(abbs[0], 'NLP', 0, 27, "Natural Language Processing", "Natural Language Processing", 'f', '0')
    test_abbreviation(abbs[1], 'NLP', 37, 40, "Natural Language Processing", "NLP", 's', '1')
    assert abbs[0].str_id[1] == abbs[1].str_id[1], "Different Instances of Abbreviation Do Not Match str_id second char"
    test_abbreviation(abbs[2], 'AI', 61, 84, "artificial intelligence", "artificial intelligence", 'f', '0')
    test_abbreviation(abbs[3], 'AI', 86, 88, "artificial intelligence", "AI", 's', '1')
    assert abbs[2].str_id[1] == abbs[3].str_id[1] == abbs[4].str_id[1], "Different Instances of Abbreviation Do Not Match str_id second char"
    test_abbreviation(abbs[5], 'CV', 182, 207, "computer vision", "c}omputer \\textbf{v}ision", 'f', '0')
    test_abbreviation(abbs[6], 'CV', 209, 211, "computer vision", "CV", 's', '1')
    assert abbs[5].str_id[1] == abbs[6].str_id[1], "Different Instances of Abbreviation Do Not Match str_id second char"

def test_abbreviation(abb, text, start, end, expansion, tex, first, last):
    #test the equivalence of an abbreviation instance abb and the values it should have
    assert abb.text == text, \
        "Abbreviation Short Form Incorrect: got {bad}, but expected {good}".format(bad = abb.text, good = text)
    assert abb.start == start, \
        "Abbreviation Start Position Incorrect: got {bad}, but expected {good}".format(bad = abb.start, good = start)
    assert abb.end == end, \
        "Abbreviation End Position Incorrect: got {bad}, but expected {good}".format(bad = abb.end, good = end)
    assert abb.expansion == expansion, \
        "Abbreviation Expansion Incorrect: got {bad}, but expected {good}".format(bad = abb.expansion, good = expansion)
    assert abb.tex == tex, \
        "Abbreviation Instance Incorrect: got {bad}, but expected {good}".format(bad = abb.tex, good = tex)
    assert abb.str_id[0] == first, "First Character of str_id Incorrect: should be f or s for full or short form"
    assert abb.str_id[-1] == last, "Last Character of str_id Incorrect: should indicate xth instance of Abbreviation"
