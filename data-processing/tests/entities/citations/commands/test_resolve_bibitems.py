from entities.citations.commands.resolve_bibitems import ResolveBibitems


def test_split_key():
    assert ResolveBibitems.split_key(None) == None
