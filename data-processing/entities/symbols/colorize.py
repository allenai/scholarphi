import re
from typing import cast

from common.types import CharacterRange, SerializableEntity, SerializableToken


def adjust_color_positions(entity: SerializableEntity) -> CharacterRange:
    """
    Sometimes, if you try to insert coloring commands at the boundary of where a symbol appears
    in TeX, it can cause errors. For example, it can be error-prone to put color commands...

    1. Right outside of braces from the original TeX (e.g., "{x}")
    2. Right after subscripts or superscripts (_, ^, \\sb, \\sp)
    3. Between a dot or a hat and the symbol it modifies (e.g., "\\hat x")

    By putting color commands inside of braces, problems #2 and #3 can be avoided. For #1,
    and for a few other cases, this function adjusts the positions that coloring commands
    will be placed to avoid tricky TeX compilation gotchas.
    """
    token = cast(SerializableToken, entity)
    equation_tex = token.equation
    token_string = equation_tex[token.relative_start : token.relative_end]

    token_start = token.start
    token_end = token.end

    # Adjust color commands to be on the inside of a group denoted by curly braces.
    if token_string.startswith("{") and token_string.endswith("}"):
        return CharacterRange(token.start + 1, token.end - 1)

    # If the token contains an ampersand, then probably this is a mistake, and it was
    # only included because the ampersand was replaced with space before the KaTeX parse,
    # and that space was included in this token in the parse. Remove the ampersand from the token.
    match = re.search(r"\s*&\s*$", token_string)
    if match is not None:
        token_end = token_start + match.start()

    # And coloring commands should never go outside the bounds of the equation.
    equation_start = token.start - token.relative_start
    equation_end = equation_start + len(equation_tex)
    start = max(token_start, equation_start)
    end = min(token_end, equation_end)
    return CharacterRange(start, end)
