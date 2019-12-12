from explanations.sanitize_equation import sanitize_equation


def test_replace_label_with_space():
    equation = "\\label{Label}x + y"
    sanitized = sanitize_equation(equation)
    assert sanitized == "             x + y"


def test_replace_ampersand_with_space():
    # Escaped ampersands will be left alone.
    equation = "& x & y \\&"
    sanitized = sanitize_equation(equation)
    assert sanitized == "  x   y \\&"


def test_replace_begin_and_end_split():
    equation = "\\begin{split}x + y\\end{split}"
    sanitized = sanitize_equation(equation)
    assert sanitized == "             x + y           "
