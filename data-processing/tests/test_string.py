from common.string import JournaledString


def test_replace():
    s = JournaledString("starter string")
    edited = s.edit(8, 14, "changed")
    assert s == "starter string"
    assert edited == "starter changed"


def test_replace_overlapping_span():
    s = JournaledString("starter string")
    edited = s.edit(8, 14, "changed")
    edited = edited.edit(13, 15, "ing")
    assert edited == "starter changing"


def test_many_replacements():
    s = JournaledString("hello world")
    edited = s.edit(6, 11, "moon")
    edited = edited.edit(6, 8, "ballo")
    edited = edited.edit(1, 2, "i")
    edited = edited.edit(5, 5, ",")
    assert edited == "hillo, balloon"


def test_preserve_initial_string():
    s = JournaledString("starter string")
    edited = s.edit(8, 15, "changed")
    assert edited.initial == "starter string"


def test_substring():
    s = JournaledString("starter string")
    edited = s.edit(5, 7, "ing")
    sub = edited.substring(3, 10)
    assert sub == "rting s"
    assert sub.initial == "rter s"
    assert sub.initial_offsets(0, 1) == (0, 1)
    assert sub.initial_offsets(3, 4) == (2, 4)


def test_substring_at_boundaries():
    s = JournaledString("starter string")
    edited = s.edit(5, 7, "ing")
    sub = edited.substring(5, 8)
    assert sub == "ing"
    assert sub.initial == "er"


def test_map_to_initial_offsets():
    s = JournaledString("starter string")
    edited = s.edit(8, 15, "changed")
    assert edited.initial_offsets(0, 1) == (0, 1)

    # Offsets within replacement text map to the offset of the start
    # of the replaced span, because it's not clear which characters in
    # the replaced substring (if any) correspond to the initial string.
    assert edited.initial_offsets(8, 9) == (8, 14)
    assert edited.initial_offsets(9, 9) == (8, 14)
    assert edited.initial_offsets(15, 15) == (14, 14)


def test_map_to_mutated_offsets():
    s = JournaledString("starter string")
    edited = s.edit(8, 14, "changed")

    # Likewise (to the note in the above test), when mapping offsets from the
    # initial string to the mutated string, it's not clear where exactly offsets from the
    # old string map to in a replaced range. So conservatively map offsets in the
    # old range to entire segments in the mutated string.
    assert edited.current_offsets(0, 1) == (0, 1)
    assert edited.current_offsets(9, 9) == (8, 15)


def test_serialize():
    s = JournaledString("starter string")
    edited = s.edit(8, 14, "changed")
    assert edited.to_json() == {
        "value": "starter changed",
        "segments": [
            {"initial": "starter ", "current": "starter ", "changed": False},
            {"initial": "string", "current": "changed", "changed": True},
        ],
    }


def test_delete():
    s = JournaledString("starter string")
    edited = s.edit(7, 8, "")
    assert edited.to_json()["segments"] == [
        {"initial": "starter", "current": "starter", "changed": False},
        {"initial": " ", "current": "", "changed": True},
        {"initial": "string", "current": "string", "changed": False},
    ]


def test_load():
    s = JournaledString.from_json(
        {
            "value": "starter changed",
            "segments": [
                {"initial": "starter ", "current": "starter ", "changed": False},
                {"initial": "string", "current": "changed", "changed": True},
            ],
        }
    )
    assert s.initial == "starter string"
    assert s == "starter changed"
    assert s.initial_offsets(0, 1) == (0, 1)
    assert s.initial_offsets(9, 9) == (8, 14)
