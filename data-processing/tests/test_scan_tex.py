from explanations.scan_tex import Pattern, scan_tex


def test_find_pattern():
    pattern = Pattern("letter", r"[a-z]")
    match = next(scan_tex("a", [pattern]))
    assert match.start == 0
    assert match.end == 1
    assert match.pattern.name == "letter"
    assert match.text == "a"


def test_skip_comments():
    pattern = Pattern("letter", r"[a-z]")
    match = next(scan_tex("%a\na", [pattern]))
    assert match.start == 3
    assert match.end == 4
    assert match.text == "a"


def test_ignore_escaped_comment():
    pattern = Pattern("letter", r"[a-z]")
    match = next(scan_tex("\\%a", [pattern]))
    assert match.text == "a"


def test_find_multiple():
    scanner = scan_tex("<.>", [Pattern("start", r"<"), Pattern("end", r">")])

    match1 = next(scanner)
    assert match1.start == 0
    assert match1.end == 1
    assert match1.pattern.name == "start"

    match2 = next(scanner)
    assert match2.start == 2
    assert match2.end == 3
    assert match2.pattern.name == "end"
