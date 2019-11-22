from explanations.parse_tex import (
    CitationExtractor,
    ColorLinksExtractor,
    EquationExtractor,
)


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


def test_extracts_nested_equations():
    extractor = EquationExtractor()
    equations = list(extractor.parse("$x + \\hbox{\\begin{equation}y\\end{equation}}$"))
    assert len(equations) == 2
    outer = next(filter(lambda e: e.start == 0, equations))
    assert outer.end == 44
    inner = next(filter(lambda e: e.start == 11, equations))
    assert inner.end == 42


def test_handles_unclosed_environments():
    extractor = EquationExtractor()
    equations = list(extractor.parse("$x + \\hbox{\\begin{equation}y}$"))
    assert len(equations) == 1
    equation = equations[0]
    assert equation.start == 0
    assert equation.end == 30


def test_ignores_escaped_dollar_sign():
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


def test_extract_colorlinks():
    extractor = ColorLinksExtractor()
    tex = "\\usepackage[arg1,colorlinks=true,arg2]{hyperref}"
    colorlinks_elements = list(extractor.parse(tex))
    assert len(colorlinks_elements) == 1

    colorlinks = colorlinks_elements[0]
    assert colorlinks.value == "true"
    assert colorlinks.value_start == 28
    assert colorlinks.value_end == 32
