from common.string import MutableString


def test_replace():
    s = MutableString("starter string")
    s.replace(8, 14, "changed")
    assert str(s) == "starter changed"


def test_replace_overlapping_span():
    s = MutableString("starter string")
    s.replace(8, 14, "changed")
    s.replace(13, 15, "ing")
    assert str(s) == "starter changing"


def test_many_replacements():
    s = MutableString("hello world")
    s.replace(6, 11, "moon")
    s.replace(6, 8, "ballo")
    s.replace(1, 2, "i")
    s.replace(5, 5, ",")
    assert str(s) == "hillo, balloon"


def test_preserve_initial_string():
    s = MutableString("starter string")
    s.replace(8, 15, "changed")
    assert s.initial_value == "starter string"


def test_map_to_initial_offsets():
    s = MutableString("starter string")
    s.replace(8, 15, "changed")
    assert s.to_initial_offsets(0, 1) == (0, 1)

    # Offsets within replacement text map to the offset of the start
    # of the replaced span, because it's not clear which characters in
    # the replaced substring (if any) correspond to the initial string.
    assert s.to_initial_offsets(8, 9) == (8, 14)
    assert s.to_initial_offsets(9, 9) == (8, 14)
    assert s.to_initial_offsets(15, 15) == (14, 14)


def test_map_to_mutated_offsets():
    s = MutableString("starter string")
    s.replace(8, 14, "changed")

    # Likewise (to the note in the above test), when mapping offsets from the
    # initial string to the mutated string, it's not clear where exactly offsets from the
    # old string map to in a replaced range. So conservatively map offsets in the
    # old range to entire segments in the mutated string.
    assert s.from_initial_offsets(0, 1) == (0, 1)
    assert s.from_initial_offsets(9, 9) == (8, 15)


def test_serialize():
    s = MutableString("starter string")
    s.replace(8, 14, "changed")
    assert s.to_json() == {
        "value": "starter changed",
        "segments": [
            {"initial": "starter ", "current": "starter ", "changed": False},
            {"initial": "string", "current": "changed", "changed": True},
        ],
    }


def test_delete():
    s = MutableString("starter string")
    s.replace(7, 8, "")
    assert s.to_json()["segments"] == [
        {"initial": "starter", "current": "starter", "changed": False},
        {"initial": " ", "current": "", "changed": True},
        {"initial": "string", "current": "string", "changed": False},
    ]


def test_load():
    s = MutableString.from_json({
        "value": "starter changed",
        "segments": [
            {"initial": "starter ", "current": "starter ", "changed": False},
            {"initial": "string", "current": "changed", "changed": True},
        ]
    })
    assert s.initial_value == "starter string"
    assert str(s) == "starter changed"
    assert s.to_initial_offsets(0, 1) == (0, 1)
    assert s.to_initial_offsets(9, 9) == (8, 14)
