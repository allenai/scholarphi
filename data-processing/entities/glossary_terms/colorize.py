import re
from typing import cast

from common.parse_tex import EquationExtractor
from common.types import CharacterRange, SerializableEntity, Term


def adjust_color_positions(entity: SerializableEntity) -> CharacterRange:
    """
    Color commands sometimes introduce unwanted space when added right before or after an equation.
    One solution is to put color commands right inside the equation.
    """

    term = cast(Term, entity)

    equation_extractor = EquationExtractor()
    equations = list(equation_extractor.parse(entity.tex_path, term.tex))
    if len(equations) == 0:
        return CharacterRange(term.start, term.end)

    # If the term starts with an equation, move the coloring command inside the equation.
    adjusted_start = term.start
    first_equation = min(equations, key=lambda e: e.start)
    first_nonspace = re.search("\S", term.tex)
    if first_nonspace is not None:
        if first_nonspace.start(0) == first_equation.start:
            adjusted_start = term.start + first_equation.content_start

    # If the term ends with an equation, move the coloring command inside the equation.
    adjusted_end = term.end
    last_equation = max(equations, key=lambda e: e.end)
    last_nonspace = re.search("\S(?=\s*$)", term.tex)
    if last_nonspace is not None:
        if last_nonspace.end(0) == last_equation.end:
            adjusted_end = term.start + last_equation.content_end

    return CharacterRange(adjusted_start, adjusted_end)
