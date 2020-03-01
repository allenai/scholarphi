import logging
from typing import Dict, Iterable, List, NamedTuple, Set, Tuple

from common.parse_tex import EquationExtractor
from common.types import (
    Character,
    CharacterId,
    Equation,
    EquationId,
    FileContents,
    RelativePath,
    Symbol,
    SymbolId,
    TexFileName,
)

SymbolDict = Dict[SymbolId, Symbol]
SymbolsByEquationId = Dict[EquationId, List[Symbol]]
CharacterDict = Dict[CharacterId, Character]


class AnnotatedFile(NamedTuple):
    tex_path: RelativePath
    contents: str
    encoding: str
    symbol_tex: Iterable[str]


class Annotation(NamedTuple):
    position: int
    text: str


class EquationAnnotations(NamedTuple):
    annotations: List[Annotation]
    symbol_tex: Set[str]


EQUATION_START = "<<equation>>"
EQUATION_END = "<</equation>>"
SYMBOL_START = "<<symbol>>"
SYMBOL_END = "<</symbol>>"


def annotate_symbols_and_equations(
    file_contents: Dict[TexFileName, FileContents],
    symbols: SymbolDict,
    characters: CharacterDict,
) -> List[AnnotatedFile]:

    annotated_files: List[AnnotatedFile] = []
    for tex_path, tex in file_contents.items():
        annotated_contents, symbol_tex = annotate_symbols_and_equations_for_file(
            tex.contents, tex_path, symbols, characters
        )
        annotated_files.append(
            AnnotatedFile(tex_path, annotated_contents, tex.encoding, symbol_tex)
        )

    return annotated_files


def annotate_symbols_and_equations_for_file(
    tex: str, tex_path: RelativePath, symbols: SymbolDict, characters: CharacterDict
) -> Tuple[str, Set[str]]:

    # Extract all equations
    equation_extractor = EquationExtractor()
    equations = list(equation_extractor.parse(tex_path, tex))

    # Group symbols by equation ID
    symbols_by_equation_id = _group_by_equation(symbols)

    # Create a list of annotations
    annotations: List[Annotation] = []
    symbol_tex: Set[str] = set()
    for equation in equations:
        equation_id = EquationId(tex_path, equation.i)
        equation_symbols = symbols_by_equation_id.get(equation_id, [])
        equation_annotations = _create_annotations_for_equation(
            tex, equation, equation_id, equation_symbols, characters
        )
        annotations.extend(equation_annotations.annotations)
        symbol_tex.update(equation_annotations.symbol_tex)

    # Annotate the TeX
    annotated_tex = tex
    annotations_reverse_order = sorted(
        annotations, key=lambda a: a.position, reverse=True
    )
    for annotation in annotations_reverse_order:
        position = annotation.position
        annotated_tex = (
            annotated_tex[:position] + annotation.text + annotated_tex[position:]
        )

    return annotated_tex, symbol_tex


def _create_annotations_for_equation(
    tex: str,
    equation: Equation,
    equation_id: EquationId,
    symbols: List[Symbol],
    characters: CharacterDict,
) -> EquationAnnotations:

    annotations: List[Annotation] = []
    tex_for_symbols: Set[str] = set()

    # Add annotations for the start and end of the equation.
    annotations.append(Annotation(equation.start, EQUATION_START))
    annotations.append(Annotation(equation.end, EQUATION_END))

    for symbol in symbols:

        # If there are no characters associated with this symbol, we can't get its position
        # for annotating it in the TeX. Skip it.
        if len(symbol.characters) == 0:
            logging.warning("No position information for symbol %s. Skipping.", symbol)
            continue

        symbol_characters = []
        for character_index in symbol.characters:
            character_id = CharacterId(
                equation_id.tex_path, equation_id.equation_index, character_index
            )
            character = characters[character_id]
            symbol_characters.append(character)

        relative_symbol_start = min([c.start for c in symbol_characters])
        symbol_start = equation.content_start + relative_symbol_start
        annotations.append(Annotation(symbol_start, SYMBOL_START))

        relative_symbol_end = max([c.end for c in symbol_characters])
        symbol_end = equation.content_start + relative_symbol_end
        annotations.append(Annotation(symbol_end, SYMBOL_END))

        symbol_tex = tex[symbol_start:symbol_end]
        tex_for_symbols.add(symbol_tex)

    return EquationAnnotations(annotations, tex_for_symbols)


def _group_by_equation(symbols: SymbolDict) -> SymbolsByEquationId:
    symbols_by_equation_id: SymbolsByEquationId = {}
    for symbol_id, symbol in symbols.items():
        equation_id = EquationId(symbol_id.tex_path, symbol_id.equation_index)
        if equation_id not in symbols_by_equation_id:
            symbols_by_equation_id[equation_id] = []
        symbols_by_equation_id[equation_id].append(symbol)
    return symbols_by_equation_id
