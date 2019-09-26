import re

from explanations.instrument_latex import color_equations, is_latex_main


def test_is_latex_main():
    tex = "\\documentclass[docclass]"
    assert is_latex_main(tex)


def test_is_not_latex_main():
    tex = "example text"
    assert not is_latex_main(tex)


def test_colors_equations():
    tex = "$eq1$ and $eq2$"
    assert (
        re.match(
            r"{\\color{.*} \$eq1\$} and {\\color{.*} \$eq2\$}", color_equations(tex)
        )
        is not None
    )
