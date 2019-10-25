from explanations.scrape_tex import extract_bibitems


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
    bibitems = extract_bibitems(tex)
    assert len(bibitems) == 2
    assert bibitems[0].key == "key1"
    assert bibitems[0].text == "token1 token2 token3"
    assert bibitems[1].key == "key2"
    assert bibitems[1].text == "token4 token5"


def test_extract_bibitems_from_environment():
    tex = "\n".join(
        [
            "\\begin{thebibliography}",
            "\\bibitem[label]{key1}",
            "token1",
            "\\end{thebibliography}",
        ]
    )
    bibitems = extract_bibitems(tex)
    assert len(bibitems) == 1
    assert bibitems[0].key == "key1"
    assert bibitems[0].text == "token1"


def test_extract_bibitem_stop_at_newline():
    tex = "\n".join(
        ["\\bibitem[label]{key1}", "token1", "", "text after bibliography (to ignore)"]
    )
    bibitems = extract_bibitems(tex)
    assert len(bibitems) == 1
    assert bibitems[0].key == "key1"
    assert bibitems[0].text == "token1"
