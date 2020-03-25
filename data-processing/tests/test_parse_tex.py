from common.parse_tex import (
    BeginDocumentExtractor,
    BibitemExtractor,
    DocumentclassExtractor,
    EquationExtractor,
    MacroExtractor,
    PlaintextExtractor,
)
from common.types import MacroDefinition
from entities.sentences.extractor import SentenceExtractor


def test_extract_plaintext_with_newlines():
    extractor = PlaintextExtractor()
    plaintext_segments = list(
        extractor.parse(
            "main.tex",
            "This sentence is followed by a newline.\nThis is the second sentence.",
        )
    )

    # Earlier versions of the plaintext extractor inadvertently removed newlines, which are needed
    # to accurately perform downstream tasks like sentence boundary detection. This test makes sure
    # that the newlines are preserved.
    plaintext = "".join([segment.text for segment in plaintext_segments])
    assert (
        plaintext
        == "This sentence is followed by a newline.\nThis is the second sentence."
    )


def test_extract_sentences():
    extractor = SentenceExtractor()
    sentences = list(
        extractor.parse(
            "main.tex",
            "This is the first \\macro[arg]{sentence}. This is the second sentence.",
        )
    )
    assert len(sentences) == 2

    sentence1 = sentences[0]
    assert sentence1.start == 0
    assert sentence1.end == 40
    assert sentences[0].text == "This is the first argsentence."

    sentence2 = sentences[1]
    assert sentence2.start == 41
    assert sentence2.end == 69
    assert sentences[1].text == "This is the second sentence."


def test_ignore_periods_in_equations():
    extractor = SentenceExtractor()
    sentences = list(
        extractor.parse("main.tex", "This sentence has an $ equation. In $ the middle.")
    )
    assert len(sentences) == 1
    assert sentences[0].text == "This sentence has an [[math]] the middle."


def test_extract_equation_from_dollar_sign():
    extractor = EquationExtractor()
    equations = list(extractor.parse("main.tex", "$x + y$"))
    assert len(equations) == 1

    equation = equations[0]
    assert equation.start == 0
    assert equation.content_start == 1
    assert equation.end == 7
    assert equation.content_tex == "x + y"
    assert equation.tex == "$x + y$"


def test_extract_equation_from_equation_environment():
    extractor = EquationExtractor()
    equations = list(extractor.parse("main.tex", "\\begin{equation}x\\end{equation}"))
    assert len(equations) == 1

    equation = equations[0]
    assert equation.start == 0
    assert equation.content_start == 16
    assert equation.end == 31
    assert equation.content_tex == "x"
    assert equation.tex == "\\begin{equation}x\\end{equation}"


def test_extract_equation_from_star_environment():
    extractor = EquationExtractor()
    equations = list(extractor.parse("main.tex", "\\begin{equation*}x\\end{equation*}"))
    assert len(equations) == 1

    equation = equations[0]
    assert equation.start == 0
    assert equation.end == 33


def test_extract_equation_environment_with_argument():
    extractor = EquationExtractor()
    equations = list(extractor.parse("main.tex", "\\begin{array}{c}x\\end{array}"))
    assert len(equations) == 1

    equation = equations[0]
    assert equation.content_start == 16


def test_extract_equation_from_double_dollar_signs():
    extractor = EquationExtractor()
    equations = list(extractor.parse("main.tex", "$$x$$"))
    assert len(equations) == 1

    equation = equations[0]
    assert equation.start == 0
    assert equation.end == 5


def test_dont_extract_equation_from_command_argument_brackets():
    extractor = EquationExtractor()
    equations = list(extractor.parse("main.tex", "\\documentclass[11pt]{article}"))
    assert len(equations) == 0


def test_extract_equation_from_brackets():
    extractor = EquationExtractor()
    equations = list(extractor.parse("main.tex", "\\[x + y\\]"))
    assert len(equations) == 1

    equation = equations[0]
    assert equation.start == 0
    assert equation.content_start == 2
    assert equation.end == 9


def test_extract_nested_equations():
    extractor = EquationExtractor()
    equations = list(
        extractor.parse("main.tex", "$x + \\hbox{\\begin{equation}y\\end{equation}}$")
    )
    assert len(equations) == 2
    outer = next(filter(lambda e: e.start == 0, equations))
    assert outer.end == 44
    inner = next(filter(lambda e: e.start == 11, equations))
    assert inner.end == 42


def test_handle_unclosed_environments():
    extractor = EquationExtractor()
    equations = list(extractor.parse("main.tex", "$x + \\hbox{\\begin{equation}y}$"))
    assert len(equations) == 1
    equation = equations[0]
    assert equation.start == 0
    assert equation.end == 30


def test_ignore_escaped_dollar_sign():
    extractor = EquationExtractor()
    equations = list(extractor.parse("main.tex", "\\$\\$"))
    assert len(equations) == 0


def test_extract_begindocument():
    extractor = BeginDocumentExtractor()
    tex = "\\RequirePackage[hyperindex]{hyperref}\n\\begin{document}"
    begindocument = extractor.parse(tex)
    assert begindocument.start == 38
    assert begindocument.end == 54


def test_extract_documentclass_after_comment_ending_with_whitespace():
    extractor = DocumentclassExtractor()
    tex = "\n\n%\\documentclass{IEEEtran}    \n\\documentclass{article}"
    documentclass = extractor.parse(tex)
    assert documentclass is not None


def test_documentclass_after_macro():
    # In some TeX files, the documentclass isn't declared until after some initial macros.
    # We still want to detect the documentclass in these documents.
    extractor = DocumentclassExtractor()
    tex = "\\def\year{2020}\n\\documentclass{article}"
    documentclass = extractor.parse(tex)
    assert documentclass is not None


def test_extract_bibitems():
    tex = "\n".join(
        [
            "\\bibitem[label]{key1}",
            "token1",
            "\\newblock \\emph{token2}",
            "\\newblock token3",
            "\\bibitem[label]{key2}",
            "token4",
            "\\newblock \\emph{token5}",
        ]
    )
    extractor = BibitemExtractor()
    bibitems = list(extractor.parse(tex))
    assert len(bibitems) == 2
    assert bibitems[0].key == "key1"
    assert bibitems[0].text == "token1 token2 token3"
    assert bibitems[1].key == "key2"
    assert bibitems[1].text == "token4 token5"


def test_extract_bibitem_tokens_from_curly_braces():
    tex = "\n".join(["\\bibitem[label]{key1}", "token1 {token2} {token3}",])
    extractor = BibitemExtractor()
    bibitems = list(extractor.parse(tex))
    assert len(bibitems) == 1
    assert bibitems[0].key == "key1"
    assert bibitems[0].text == "token1 token2 token3"


def test_extract_bibitems_from_environment():
    tex = "\n".join(
        [
            "\\begin{thebibliography}",
            "\\bibitem[label]{key1}",
            "token1",
            "\\end{thebibliography}",
        ]
    )
    extractor = BibitemExtractor()
    bibitems = list(extractor.parse(tex))
    assert len(bibitems) == 1
    assert bibitems[0].key == "key1"
    assert bibitems[0].text == "token1"


def test_extract_bibitem_stop_at_newline():
    tex = "\n".join(
        ["\\bibitem[label]{key1}", "token1", "", "text after bibliography (to ignore)"]
    )
    extractor = BibitemExtractor()
    bibitems = list(extractor.parse(tex))
    assert len(bibitems) == 1
    assert bibitems[0].key == "key1"
    assert bibitems[0].text == "token1"


def test_extract_macro():
    tex = "\\macro"
    extractor = MacroExtractor()
    macros = list(extractor.parse(tex, MacroDefinition("macro", "")))
    assert len(macros) == 1
    assert macros[0].start == 0
    assert macros[0].end == 6


def test_extract_macro_with_delimited_parameter():
    tex = "\\macro arg."
    extractor = MacroExtractor()
    macros = list(extractor.parse(tex, MacroDefinition("macro", "#1.")))
    assert len(macros) == 1
    assert macros[0].start == 0
    assert macros[0].end == 11
    assert macros[0].tex == "\\macro arg."


def test_extract_macro_with_undelimited_parameter():
    # the scanner for undelimited parameter '#1' should match the first non-blank token 'a'.
    tex = "\\macro  a"
    extractor = MacroExtractor()
    macros = list(extractor.parse(tex, MacroDefinition("macro", "#1")))
    assert len(macros) == 1
    assert macros[0].start == 0
    assert macros[0].end == 9
    assert macros[0].tex == "\\macro  a"


def test_extract_macro_balance_nested_braces_for_argument():
    tex = "\\macro{{nested}}"
    extractor = MacroExtractor()
    macros = list(extractor.parse(tex, MacroDefinition("macro", "#1")))
    assert len(macros) == 1
    assert macros[0].start == 0
    assert macros[0].end == 16
    assert macros[0].tex == "\\macro{{nested}}"


def test_sentence_splitting_end_points():
    extractor = SentenceExtractor()
    sentences = list(
        extractor.parse(
            "main.tex",
            "This is a sentence. Next we describe two items. 1) The first item. 2) The second item.",
        )
    )

    assert len(sentences) == 4
    sentence_end_points = [[0, 19], [20, 47], [48, 66], [67, 86]]
    for i, [start, end] in enumerate(sentence_end_points):
        assert sentences[i].start == start
        assert sentences[i].end == end


def test_sentence_splitting_end_points_and_more_text():
    extractor = SentenceExtractor()
    sentences = list(
        extractor.parse(
            "main.tex",
            "This sentence. has extra. text. 1. first 2. second 3. third. And some extra. stuff.",
        )
    )
    assert len(sentences) == 8
    sentence_end_points = [
        [0, 14],
        [15, 25],
        [26, 31],
        [32, 40],
        [41, 50],
        [51, 60],
        [61, 76],
        [77, 83],
    ]
    for i, [start, end] in enumerate(sentence_end_points):
        assert sentences[i].start == start
        assert sentences[i].end == end
