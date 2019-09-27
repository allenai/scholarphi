import re

from explanations.instrument_tex import color_equations


def test_color_equations():
    tex = "$eq1$ and $eq2$"
    assert (
        re.match(
            r"{\\color{.*} \$eq1\$} and {\\color{.*} \$eq2\$}", color_equations(tex)
        )
        is not None
    )


def test_color_equation_in_argument():
    tex = "\\caption{$eq1$}"
    assert (
        re.match(r"\\caption{{\\color{.*} \$eq1\$}}", color_equations(tex)) is not None
    )
