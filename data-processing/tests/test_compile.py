from common.compile import (
    did_compilation_fail,
    get_errors,
    get_last_autotex_compiler,
    get_last_colorized_entity_id,
    is_driver_unimplemented,
)


def test_is_not_missing_driver():
    stdout = bytearray(
        "(./main.tex\n"
        + "Output written on main.pdf (1 page, 11340 bytes).\n"
        + "Transcript written on main.log.",
        "utf-8",
    )
    assert not is_driver_unimplemented(stdout)


def test_is_missing_driver():
    stdout = bytearray(
        "[Loading MPS to PDF converter (version 2006.09.02).]\n"
        + ")))) Coloring not implemented for driver luatex.def\n"
        + "Coloring not implemented for driver luatex.def)",
        "utf-8",
    )
    assert is_driver_unimplemented(stdout)


def test_get_errors():
    stdout = bytearray(
        "[verbose]: This is TeX, Version 3.14159265 (TeX Live 2017) (preloaded format=tex)\n"
        + "(./BioVELum.tex\n"
        + "! Undefined control sequence.\n"
        + "l.1 \\documentclass\n"
        + "                  [10pt]{article}\n"
        + "? \n"
        + "! Emergency stop.\n"
        + "l.1 \\documentclass\n"
        + "                  [10pt]{article}\n"
        + "No pages of output.\n"
        + "Transcript written on BioVELum.log.\n",
        "utf-8",
    )
    errors = list(get_errors(stdout, context=3))
    assert len(errors) == 2

    error1 = errors[0]
    assert len(error1.splitlines()) == 3
    assert error1.startswith(b"! Undefined control sequence")

    error2 = errors[1]
    assert len(error2.splitlines()) == 3
    assert error2.startswith(b"! Emergency stop.")


def test_get_last_autotex_compiler():
    autotex_log = "\n".join(
        [
            "[verbose]:  ~~~~~~~~~~~ Running hpdflatex for the first time ~~~~~~~~",
            "...",
            "[verbose]:  ~~~~~~~~~~~ Running pdflatex for the first time ~~~~~~~~",
            "...",
            "[verbose]:  ~~~~~~~~~~~ Running pdflatex for the second time ~~~~~~~~",
            "...",
        ]
    )
    compiler = get_last_autotex_compiler(autotex_log)
    assert compiler == "pdflatex"


def test_detect_compilation_failure():
    autotex_log = "\n".join(
        [
            "[verbose]:  ~~~~~~~~~~~ Running pdflatex for the first time ~~~~~~~~",
            "! Emergency stop.",
        ]
    )
    failed = did_compilation_fail(autotex_log, "pdflatex")
    assert failed


def test_ignore_compilation_failure_for_other_compiler():
    autotex_log = "\n".join(
        [
            "[verbose]:  ~~~~~~~~~~~ Running pdflatex for the first time ~~~~~~~~",
            "! Emergency stop.",
        ]
    )
    failed = did_compilation_fail(autotex_log, "other-compiler-not-pdflatex")
    assert not failed


def test_get_entity_colored_before_failure():
    autotex_log = "\n".join(
        [
            "[verbose]:  ~~~~~~~~~~~ Running pdflatex for the first time ~~~~~~~~",
            "...",
            "S2: Colorized entity '1'.",
            "...",
            "S2: Colorized entity '2'.",
            "...",
            "! Emergency stop.",
        ]
    )
    id_ = get_last_colorized_entity_id(autotex_log, "pdflatex")
    assert id_ == "2"
