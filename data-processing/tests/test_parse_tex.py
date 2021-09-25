from entities.citations.extractor import BibitemExtractor

from common.parse_tex import (
    BeginDocumentExtractor,
    DocumentclassExtractor,
    MacroExtractor,
)
from common.types import MacroDefinition


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


def test_extract_bibitem_wrapping_key():
    tex = "\n".join([r"\bibitem[label]%", r"    {key}", r"    token"])
    extractor = BibitemExtractor()
    bibitems = list(extractor.parse(tex))
    assert len(bibitems) == 1
    assert "token" in bibitems[0].text


def test_extract_bibitem_with_brackets_in_label():
    tex = "\n".join([r"\bibitem[label{[]}]{key}", r"token"])
    extractor = BibitemExtractor()
    bibitems = list(extractor.parse(tex))
    assert len(bibitems) == 1
    assert "token" in bibitems[0].text


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
