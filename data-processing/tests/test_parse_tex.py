from explanations.parse_tex import (BibitemExtractor, CitationExtractor,
                                    ColorLinksExtractor,
                                    DocumentclassExtractor, EquationExtractor,
                                    MacroExtractor)
from explanations.types import MacroDefinition


def test_extract_equation_from_dollar_sign():
    extractor = EquationExtractor()
    equations = list(extractor.parse("$x + y$"))
    assert len(equations) == 1

    equation = equations[0]
    assert equation.start == 0
    assert equation.content_start == 1
    assert equation.end == 7
    assert equation.content_tex == "x + y"
    assert equation.tex == "$x + y$"


def test_extract_equation_from_equation_environment():
    extractor = EquationExtractor()
    equations = list(extractor.parse("\\begin{equation}x\\end{equation}"))
    assert len(equations) == 1

    equation = equations[0]
    assert equation.start == 0
    assert equation.content_start == 16
    assert equation.end == 31
    assert equation.content_tex == "x"
    assert equation.tex == "\\begin{equation}x\\end{equation}"


def test_extract_equation_from_star_environment():
    extractor = EquationExtractor()
    equations = list(extractor.parse("\\begin{equation*}x\\end{equation*}"))
    assert len(equations) == 1

    equation = equations[0]
    assert equation.start == 0
    assert equation.end == 33


def test_extract_equation_environment_with_argument():
    extractor = EquationExtractor()
    equations = list(extractor.parse("\\begin{array}{c}x\\end{array}"))
    assert len(equations) == 1

    equation = equations[0]
    assert equation.content_start == 16


def test_extract_equation_from_double_dollar_signs():
    extractor = EquationExtractor()
    equations = list(extractor.parse("$$x$$"))
    assert len(equations) == 1

    equation = equations[0]
    assert equation.start == 0
    assert equation.end == 5


def test_dont_extract_equation_from_command_argument_brackets():
    extractor = EquationExtractor()
    equations = list(extractor.parse("\\documentclass[11pt]{article}"))
    assert len(equations) == 0


def test_extract_equation_from_brackets():
    extractor = EquationExtractor()
    equations = list(extractor.parse("\\[x + y\\]"))
    assert len(equations) == 1

    equation = equations[0]
    assert equation.start == 0
    assert equation.content_start == 2
    assert equation.end == 9


def test_extract_nested_equations():
    extractor = EquationExtractor()
    equations = list(extractor.parse("$x + \\hbox{\\begin{equation}y\\end{equation}}$"))
    assert len(equations) == 2
    outer = next(filter(lambda e: e.start == 0, equations))
    assert outer.end == 44
    inner = next(filter(lambda e: e.start == 11, equations))
    assert inner.end == 42


def test_handle_unclosed_environments():
    extractor = EquationExtractor()
    equations = list(extractor.parse("$x + \\hbox{\\begin{equation}y}$"))
    assert len(equations) == 1
    equation = equations[0]
    assert equation.start == 0
    assert equation.end == 30


def test_ignore_escaped_dollar_sign():
    extractor = EquationExtractor()
    equations = list(extractor.parse("\\$\\$"))
    assert len(equations) == 0


def test_extract_citation():
    extractor = CitationExtractor()
    citations = list(extractor.parse("text\\cite{key1,key2}"))
    assert len(citations) == 1

    citation = citations[0]
    assert citation.keys == ["key1", "key2"]
    assert citation.start == 4
    assert citation.end == 20


def test_extract_citation_from_cite_star():
    extractor = CitationExtractor()
    citations = list(extractor.parse("text\\cite*{key}"))
    assert len(citations) == 1
    assert citations[0].keys == ["key"]


def test_extract_documentclass_after_comment_ending_with_whitespace():
    extractor = DocumentclassExtractor()
    tex = "\n\n%\\documentclass{IEEEtran}    \n\\documentclass{article}"
    documentclass = extractor.parse(tex)
    assert documentclass is not None


def test_extract_colorlinks():
    extractor = ColorLinksExtractor()
    tex = "\\usepackage[arg1,colorlinks=true,arg2]{hyperref}"
    colorlinks_elements = list(extractor.parse(tex))
    assert len(colorlinks_elements) == 1

    colorlinks = colorlinks_elements[0]
    assert colorlinks.value == "true"
    assert colorlinks.value_start == 28
    assert colorlinks.value_end == 32


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
