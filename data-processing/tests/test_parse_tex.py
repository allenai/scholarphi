from common.parse_tex import (BeginDocumentExtractor, DocumentclassExtractor,
                              EquationExtractor, MacroExtractor,
                              PhraseExtractor, extract_plaintext)
from common.types import MacroDefinition
from entities.citations.extractor import BibitemExtractor
from entities.sentences.extractor import SentenceExtractor


def test_extract_plaintext_with_equations():
    plaintext = extract_plaintext(
        "main.tex", "This sentence includes a symbol $x$ and equation $$y = x$$."
    )
    assert plaintext == (
        "This sentence includes a symbol EQUATION_DEPTH_0_START x EQUATION_DEPTH_0_END "
        + "and equation EQUATION_DEPTH_0_START y = x EQUATION_DEPTH_0_END."
    )


def test_extract_plaintext_with_nested_equations():
    plaintext = extract_plaintext(
        "main.tex", r"This sentence contains an equation \(x = \textrm{$y$}\)."
    )
    assert plaintext == (
        r"This sentence contains an equation EQUATION_DEPTH_0_START x = \textrm{ "
        + "EQUATION_DEPTH_1_START y EQUATION_DEPTH_1_END } EQUATION_DEPTH_0_END."
    )


def test_extract_plaintext_no_add_space_before_equation_possessive():
    plaintext = extract_plaintext(
        "main.tex", "This sentence includes a possessive equation $x$'s."
    )
    assert (
        plaintext
        == r"This sentence includes a possessive equation EQUATION_DEPTH_0_START x "
        + "EQUATION_DEPTH_0_END's."
    )


def test_extract_plaintext_remove_comments():
    plaintext = extract_plaintext("main.tex", "% comment\nText% comment\n% comment")
    assert plaintext == "Text"


def test_extract_plaintext_skip_input():
    plaintext = extract_plaintext(
        "main.tex", "\n".join([r"\input file", r"\input{file}", r"\include{file}"])
    )
    assert plaintext.isspace()


def test_extract_plaintext_leave_initial_intact():
    tex = "\\documentclass{article}"
    plaintext = extract_plaintext("main.tex", tex)
    assert plaintext.initial == tex


def test_extract_plaintext_consolidate_periods():
    plaintext = extract_plaintext("main.tex", "Sentence. .. Next sentence.")
    assert plaintext == "Sentence. Next sentence."


def test_extract_plaintext_consolidate_periods_across_groups():
    plaintext = extract_plaintext("main.tex", "\\footnote{Sentence.}. Next sentence.")
    assert plaintext == "Sentence. Next sentence."


def test_extract_plaintext_separate_section_header():
    plaintext = extract_plaintext(
        "main.tex", "\n".join(["Line 1", r"\section{Section header}", "Line 3"])
    )
    assert plaintext == "\n".join(["Line 1", "", "Section header.", "", "Line 3"])


def test_extract_phrases():
    extractor = PhraseExtractor(["word", "two-token phrase"])
    phrases = list(
        extractor.parse(
            "main.tex", "This sentence contains word and a two-token phrase."
        )
    )

    phrase1 = phrases[0]
    assert phrase1.start == 23
    assert phrase1.end == 27
    assert phrase1.text == "word"

    phrase2 = phrases[1]
    assert phrase2.start == 34
    assert phrase2.end == 50
    assert phrase2.text == "two-token phrase"


def test_extract_phrases_from_formatted_text():
    extractor = PhraseExtractor(["two-token phrase"])
    phrases = list(
        extractor.parse(
            "main.tex", r"In this \textbf{two-token phrase}, something happens."
        )
    )
    assert len(phrases) == 1


def test_extract_phrases_containing_ampersands():
    # This example is from arXiv paper 1811.11889.
    extractor = PhraseExtractor(["D&M"])
    phrases = list(extractor.parse("main.tex", r"This sentence contains D\&M."))
    assert len(phrases) == 1
    assert phrases[0].text == "D&M"
    assert phrases[0].tex == r"D\&M"


def test_extract_phrases_starting_with_symbol():
    # This example is from arXiv paper 1811.11889.
    extractor = PhraseExtractor(["+D&M"])
    phrases = list(extractor.parse("main.tex", r"This sentence contains +D\&M."))
    assert len(phrases) == 1
    assert phrases[0].text == "+D&M"


def test_extract_phrase_containing_single_letter():
    extractor = PhraseExtractor(["T"])
    phrases = list(extractor.parse("main.tex", "This sentence contains the letter T."))
    assert len(phrases) == 1
    assert phrases[0].text == "T"


def test_extract_sentences():
    extractor = SentenceExtractor(from_named_sections_only=False)
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
    assert sentence1.text == "This is the first argsentence."

    sentence2 = sentences[1]
    assert sentence2.start == 41
    assert sentence2.end == 69
    assert sentence2.text == "This is the second sentence."


def test_ignore_periods_in_equations():
    extractor = SentenceExtractor(from_named_sections_only=False)
    sentences = list(
        extractor.parse("main.tex", "This sentence has an $ equation. In $ the middle.")
    )
    assert len(sentences) == 1
    assert sentences[0].text == (
        "This sentence has an EQUATION_DEPTH_0_START equation. In EQUATION_DEPTH_0_END "
        + "the middle."
    )


def test_sentence_splitting_end_points():
    extractor = SentenceExtractor(from_named_sections_only=False)
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
    extractor = SentenceExtractor(from_named_sections_only=False)
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


def test_combine_sentence_tex_following_latex_linebreak_conventions():
    extractor = SentenceExtractor(from_named_sections_only=False)
    sentences = list(
        extractor.parse(
            "main.tex",
            "\n".join(
                [
                    # All on one line.
                    (
                        r"This is the first sentence.\\"
                        + r"This is the second sentence.\linebreak "
                        + "This is the third sentence."
                    ),
                    "",
                    "This is the fourth sentence.",
                    " ",
                    # With only a single newline, consecutive lines should be considered the same sentence.
                    "This is the fifth sentence, which is written on multiple",
                    "lines.",
                ]
            ),
        )
    )
    assert sentences[0].text == "This is the first sentence."
    assert sentences[0].end == 27
    assert sentences[1].text == "This is the second sentence."
    assert sentences[2].text == "This is the third sentence."
    assert sentences[3].text == "This is the fourth sentence."
    assert (
        sentences[4].text
        == "This is the fifth sentence, which is written on multiple lines."
    )
    assert len(sentences) == 5


def test_sentence_from_within_command():
    extractor = SentenceExtractor(from_named_sections_only=False)
    # The space in the start of this sentence is important, as in an earlier version of the
    # code, this space caused extraction to fail.
    sentences = list(extractor.parse("main.tex", r" \textit{Example sentence.}"))
    assert sentences[0].text == "Example sentence."
    assert sentences[0].tex == "Example sentence."
    assert sentences[0].start == 9
    assert sentences[0].end == 26


def test_sentence_includes_preceding_equation():
    extractor = SentenceExtractor(from_named_sections_only=False)
    # This was a specific case seen in an example paper.
    sentences = list(
        extractor.parse("main.tex", "Sentence 1.\n\\[x\\]\nstarts the sentence.")
    )
    assert sentences[1].tex == "\\[x\\]\nstarts the sentence."
    assert sentences[1].start == 12
    assert sentences[1].end == 38


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


def test_extract_equation_from_dollar_sign_after_newline():
    # This pattern was observed in arXiv paper 1703.00102.
    extractor = EquationExtractor()
    equations = list(extractor.parse("main.tex", r"\\$x$"))
    assert len(equations) == 1


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
    tex = "\\def\\year{2020}\n\\documentclass{article}"
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
    assert bibitems[0].id_ == "key1"
    assert bibitems[0].text == "token1 token2 token3"
    assert bibitems[1].id_ == "key2"
    assert bibitems[1].text == "token4 token5"


def test_extract_bibitem_tokens_from_curly_braces():
    tex = "\n".join(["\\bibitem[label]{key1}", "token1 {token2} {token3}",])
    extractor = BibitemExtractor()
    bibitems = list(extractor.parse(tex))
    assert len(bibitems) == 1
    assert bibitems[0].id_ == "key1"
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
    assert bibitems[0].id_ == "key1"
    assert bibitems[0].text == "token1"


def test_extract_bibitem_stop_at_newline():
    tex = "\n".join(
        ["\\bibitem[label]{key1}", "token1", "", "text after bibliography (to ignore)"]
    )
    extractor = BibitemExtractor()
    bibitems = list(extractor.parse(tex))
    assert len(bibitems) == 1
    assert bibitems[0].id_ == "key1"
    assert bibitems[0].text == "token1"


def test_extract_bibitem_include_hyperref_contents():
    tex = "\n".join(
        ["\\bibitem[label]{key1}", r"token1 \href{https://url.com}{token2}"]
    )
    extractor = BibitemExtractor()
    bibitems = list(extractor.parse(tex))
    assert len(bibitems) == 1
    assert bibitems[0].text == "token1 token2"


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
