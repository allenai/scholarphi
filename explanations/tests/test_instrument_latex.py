import re

from explanations.instrument_tex import color_equations


def test_colors_equations():
    tex = "$eq1$ and $eq2$"
    assert (
        re.match(
            r"{\\color{.*} \$eq1\$} and {\\color{.*} \$eq2\$}", color_equations(tex)
        )
        is not None
    )
