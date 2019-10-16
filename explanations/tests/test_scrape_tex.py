from explanations.scrape_tex import extract_bibitem_ids


def test_extract_bibitem_ids():
    tex = "\n".join(["\\bibitem[{Shorthand}]{id1}", "", "\\bibitem[{Shorthand}]{id2}"])
    ids = extract_bibitem_ids(tex)
    assert ids == ["id1", "id2"]
