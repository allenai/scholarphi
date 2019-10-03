import re

from explanations.instrument_tex import color_equations

COLOR_PATTERN = (
    r"(.*?)"
    + r"\\llap{"
    + r"\\pdfcolorstack 0 push {[0-9.]+ [0-9.]+ [0-9.]+ rg}"
    + r"\1"
    + r"\\pdfcolorstack 0 pop}"
)


def test_color_equations():
    tex = "$eq1$ and $eq2$"
    colorized = color_equations(tex).tex
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 2
    assert matches[0] == "$eq1$"
    assert matches[1] == "$eq2$"


def test_color_equation_in_argument():
    tex = "\\caption{$eq1$}"
    colorized = color_equations(tex).tex
    assert colorized.startswith("\\caption")
    matches = re.findall(COLOR_PATTERN, colorized)
    assert len(matches) == 1
    assert matches[0] == "$eq1$"
