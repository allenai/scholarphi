from entities.sentences.colorize import get_sentence_color_positions
from entities.sentences.types import Sentence


def create_sentence(tex: str, start: int) -> Sentence:
    return Sentence(
        start=start,
        end=start + len(tex),
        tex_path="main.tex",
        id_=0,
        tex=tex,
        context_tex="<extracted text>",
        text="<plaintext>",
    )


def test_colorize_at_sentence_bounds():
    sentence = create_sentence("This is a sentence.", start=100)
    positions = get_sentence_color_positions(sentence)
    assert positions.start == 100
    assert positions.end == 119


def test_adjust_color_start_to_within_equation():
    sentence = create_sentence(
        "$x$ is an equation at the start of the sentence.", start=0
    )
    positions = get_sentence_color_positions(sentence)
    # The start position should not be at 0 (the start of the equation), but instead should be
    # adjusted to fall within the equation at the start of the sentence.
    assert positions.start != 0
    assert positions.start == 1
    assert positions.end == 48


def test_adjust_color_end_to_within_equation():
    sentence = create_sentence(
        # Note that this sentence doesn't end with a period. My hunch is that if a sentence ends
        # with a period, it's okay to put the coloring commands after the period, as they will not
        # be in the problematic position of right after the equation.
        "This sentence ends with the equation $x$",
        start=0,
    )
    positions = get_sentence_color_positions(sentence)
    assert positions.start == 0
    assert positions.end != 40
    assert positions.end == 39


def test_no_adjust_color_positions_if_equation_within_text():
    sentence = create_sentence(
        "This sentence has the equation $x$ in the middle.", start=0
    )
    positions = get_sentence_color_positions(sentence)
    assert positions.start == 0
    assert positions.end == 49


def test_adjust_color_to_within_equations_even_if_sentence_starts_or_ends_with_space():
    sentence = create_sentence(
        "   $x$ is the equation that opens the text, even though it appears after a space, and"
        + "this sentence ends with an equation followed by space $x$   ",
        start=0,
    )
    positions = get_sentence_color_positions(sentence)
    assert positions.start == 4
    assert positions.end == 141
