import colorsys
import logging
import os
import re
from dataclasses import dataclass
from typing import Any, Callable, Dict, Iterator, List, NamedTuple, Optional, Set, cast

import numpy as np

from explanations.parse_tex import (
    BeginDocumentExtractor,
    CitationExtractor,
    ColorLinksExtractor,
    DocumentclassExtractor,
    EquationExtractor,
)
from explanations.types import (
    CharacterRange,
    Citation,
    Entity,
    Equation,
    EquationId,
    FileContents,
    TexFileName,
    TokenWithOrigin,
)

"""
All TeX coloring operations follow the same process.

First, detect character positions of entities that need to be colorized. This is done an Extractor
listens to a stream of tokens from a TeX scanner.

Insert macros at the top of each file for custom coloring. These macros should make no assumptions
about what TeX engine will be used to compile the TeX; they should not require that third-party
packages have been loaded, and should check the definition of the TeX engine before attempting to
execute a command that is unique to that engine.

Then, color the detected entities from last to first. Coloring should always start with the
entities with the highest character positions, and going in reverse until the entities with the
lowest. This is because inserting color commands will change positions of all text after the
colorized entity.

Entities will be colorized, each with a different hue. Once the colorizer runs out of new hues, it
returns the currently colorized TeX and list of colorized entities, then resets the TeX and
starts over from where it stopped, cylcing through the same hues again.

If you want a better sense of the colorization process, see the 'colorize_citations' method, which
has more explanatory comments than the other colorization methods.
"""

# Load preambles for TeX files that will load the colorization commands.
with open(os.path.join("resources", "01-macros.tex")) as file_:
    COLOR_MACROS_BASE_MACROS = file_.read()
with open(os.path.join("resources", "02a-latex-import-color.tex")) as file_:
    COLOR_MACROS_LATEX_IMPORTS = file_.read()
with open(os.path.join("resources", "02b-tex-import-color.tex")) as file_:
    COLOR_MACROS_TEX_IMPORTS = file_.read()
with open(os.path.join("resources", "03-load-color-commands.tex")) as file_:
    COLOR_MACROS = file_.read()

TEX_COLOR_MACROS = "\n".join(
    [COLOR_MACROS_BASE_MACROS, COLOR_MACROS_TEX_IMPORTS, COLOR_MACROS]
)
LATEX_COLOR_MACROS = "\n".join(
    [COLOR_MACROS_BASE_MACROS, COLOR_MACROS_LATEX_IMPORTS, COLOR_MACROS]
)


def add_color_macros(tex: str) -> str:
    documentclass_extractor = DocumentclassExtractor()
    documentclass = documentclass_extractor.parse(tex)
    if documentclass is not None:
        begin_document_extractor = BeginDocumentExtractor()
        begin_document = begin_document_extractor.parse(tex)
        if begin_document is not None:
            return (
                tex[: begin_document.start]
                + "\n"
                + LATEX_COLOR_MACROS
                + "\n"
                + tex[begin_document.start :]
            )
    return TEX_COLOR_MACROS + "\n\n" + tex


# TODO(andrewhead): determine number of hues based on the number of hues that OpenCV is capable
# of distinguishing between. Current value is a guess.
NUM_HUES = 30
HUES = np.linspace(0, 1, NUM_HUES)


def generate_hues() -> Iterator[float]:
    for hue in HUES:
        yield hue
    logging.debug(
        "Out of hues. Hopefully the caller is restarting this generator to keep coloring."
    )
    return


def insert_color_in_tex(
    tex: str, hue: float, start: int, end: int, braces: bool = False
) -> str:
    """
    Set 'braces' if you want the TeX (including coloring commands) to be wrapped in curly braces.
    This is particularly helpful for coloring symbols, so that single letters that may be an
    argument of a macro will still be considered as just one argument to that macro.
    """
    return (
        tex[:start]
        + ("{" if braces else "")
        + _get_color_start_tex(hue)
        + tex[start:end]
        + _get_color_end_tex()
        + ("}" if braces else "")
        + tex[end:]
    )


def _get_color_start_tex(hue: float) -> str:
    """
    Coloring macros were chosen carefully to satisfy a few needs:
    1. Be portable to many documents.
    2. Don't disrupt the layout of text.

    Other approaches that didn't pan out (talk to andrewhead@ if you want to know why) but
    which might be worth looking into if you wanted to extend the coloring algorithm was using
    fcolorbox's, or soul's 'hl' (highlight) command. There are also some commands that output the
    location of boxes of TeX (e.g., 'zsavebox').

    Why use hues to color? It makes colorization and color detection easier. During colorization,
    hues can be used to express a color with a single number. During color detection (for finding
    bounding boxes of colorized entities), in the rasters of pages, the pixels of the edges of
    characters be faded and thus have different R, G, and B values no matter what the color. However,
    those same pixels will still have the same hue, just at a higher value or lower saturation.
    """
    red, green, blue = colorsys.hsv_to_rgb(hue, 1, 255)
    red_scaled = red / 255.0
    blue_scaled = blue / 255.0
    green_scaled = green / 255.0
    return r"\scholarsetcolor[rgb]{{{red},{green},{blue}}}".format(
        red=red_scaled, green=green_scaled, blue=blue_scaled
    )


def _get_color_end_tex() -> str:
    return r"\scholarrevertcolor{}"


@dataclass(frozen=True)
class ColorizedEntity:
    hue: float
    "Hue (from 0 to 1) of the color assigned to entity."

    identifier: Dict[str, Any]
    "Unique identifier that will distinguish this entity from others from the same tex_path."

    tex: str
    "TeX for this entity."

    context_tex: str
    "A fixed amount of context before and after the TeX where this entity appears."

    data: Dict[str, Any]
    "Additional data for the entity that should be saved to CSV."


class ColorizationBatch(NamedTuple):
    tex: str
    entities: List[ColorizedEntity]


def colorize_citations(
    tex: str,
    insert_color_macros: bool = True,
    batch_size: Optional[int] = None,
    preset_hue: Optional[float] = None,
) -> Iterator[ColorizationBatch]:
    """
    'batch_size' is the maximum number of citations to process at a time. It defaults to the number
    of hues available for coloring. You cannot specify more than the number of hues.
    """

    def get_entity_metadata(entity: Entity) -> Dict[str, Any]:
        citation = cast(Citation, entity)
        return {"keys": citation.keys}

    batches = colorize_entities(
        tex,
        CitationExtractor(),
        get_entity_metadata,
        insert_color_macros,
        batch_size,
        preset_hue,
    )
    for batch in batches:
        yield batch


def colorize_equations(
    tex: str,
    insert_color_macros: bool = True,
    batch_size: Optional[int] = None,
    preset_hue: Optional[float] = None,
) -> Iterator[ColorizationBatch]:
    def get_entity_metadata(entity: Entity) -> Dict[str, Any]:
        equation = cast(Equation, entity)
        return {
            "content_start": equation.content_start,
            "content_end": equation.content_end,
            "content_tex": equation.content_tex,
            "depth": equation.depth,
            "start": entity.start,
            "end": entity.end,
        }

    def when(entity: Entity) -> bool:
        equation = cast(Equation, entity)
        return equation.depth == 0

    def get_color_positions(entity: Entity) -> CharacterRange:
        equation = cast(Equation, entity)
        return CharacterRange(equation.content_start, equation.content_end)

    batches = colorize_entities(
        tex,
        EquationExtractor(),
        get_entity_metadata,
        insert_color_macros,
        batch_size,
        preset_hue,
        when,
        get_color_positions,
    )
    for batch in batches:
        yield batch


def colorize_entities(
    tex: str,
    entity_extractor: Any,
    get_entity_metadata: Callable[[Entity], Dict[str, Any]],
    insert_color_macros: bool = True,
    batch_size: Optional[int] = None,
    preset_hue: Optional[float] = None,
    when: Optional[Callable[[Entity], bool]] = None,
    get_color_positions: Optional[Callable[[Entity], CharacterRange]] = None,
) -> Iterator[ColorizationBatch]:

    batch_size = min(batch_size, NUM_HUES) if batch_size is not None else NUM_HUES
    CONTEXT_SIZE = 100

    if insert_color_macros:
        tex = add_color_macros(tex)
    tex = _disable_hyperref_coloring(tex)

    entities = list(entity_extractor.parse(tex))

    # Order entities from last-to-first so we can add color commands without messing with the offsets of
    # entities that haven't yet been colored.
    entities_reverse_order = sorted(entities, key=lambda e: e.start, reverse=True)

    hue_generator = generate_hues()
    colorized_entities: List[ColorizedEntity] = []

    colorized_tex = tex
    item_index = 0
    for e, ei in zip(entities_reverse_order, range(len(entities) - 1, -1, -1)):

        # Decide whether or not to color this entity
        if when is not None and not when(e):
            continue

        # Get a hue to color this entity
        if preset_hue is not None:
            hue = preset_hue
        else:
            hue = next(hue_generator)

        entity_tex = tex[e.start : e.end]
        content_tex = tex[max(0, e.start - CONTEXT_SIZE) : e.end + CONTEXT_SIZE]

        # Save a reference to this colorized entity to return to the caller
        colorized_entities.insert(
            0,
            ColorizedEntity(
                hue, {"index": ei}, entity_tex, content_tex, get_entity_metadata(e),
            ),
        )

        # Determine what range of characters to color
        color_character_range = CharacterRange(e.start, e.end)
        if get_color_positions is not None:
            color_character_range = get_color_positions(e)
        colorized_tex = insert_color_in_tex(
            colorized_tex, hue, color_character_range.start, color_character_range.end
        )

        item_index += 1

        # When the hues run out, notify caller that a batch has been finished.
        # Provide the caller with the colorized tex and list of colors.
        if item_index == batch_size:
            yield ColorizationBatch(colorized_tex, colorized_entities)

            # Then reset the TeX so it is not colorized so we can start coloring with the
            # same hues without collisions. And clear the list of colors assigned.
            colorized_tex = tex
            colorized_entities = []

            # Reset the hue generator.
            hue_generator = generate_hues()

            # Reset the citation counter to 0.
            item_index = 0

    # When finished coloring, yield any colorized entities that haven't yet bee yielded.
    if len(colorized_entities) > 0:
        yield ColorizationBatch(colorized_tex, colorized_entities)


class ColorizedTokenWithOrigin(NamedTuple):
    tex_path: str
    equation_index: int
    token_index: int
    start: int
    end: int
    text: str
    hue: float


class TokenColorizationBatch(NamedTuple):
    colorized_files: Dict[TexFileName, FileContents]
    colorized_tokens: List[ColorizedTokenWithOrigin]


def colorize_equation_tokens(
    file_contents: Dict[TexFileName, FileContents],
    tokens: List[TokenWithOrigin],
    insert_color_macros: bool = True,
    preset_hue: Optional[float] = None,
) -> Iterator[TokenColorizationBatch]:

    equations_by_file: Dict[TexFileName, Set[Equation]] = {}
    tokens_by_equation: Dict[EquationId, List[TokenWithOrigin]] = {}

    for token in tokens:
        equation_id = EquationId(token.tex_path, token.equation.i)
        if equation_id not in tokens_by_equation:
            tokens_by_equation[equation_id] = []
        tokens_by_equation[equation_id].append(token)

        if not token.tex_path in equations_by_file:
            equations_by_file[token.tex_path] = set()
        equations_by_file[token.tex_path].add(token.equation)

    # Number of tokens to skip when coloring. Starts at 0, and increases with each pass of
    # coloring. Multiple passes will be needed as the distinct hues for tokens runs out fast.
    # Tokens are colored in parallel for all equations from all TeX files, as the search for
    # colors will be done within the bounding boxes detected for each equation independently.
    token_skip = 0

    more_batches = True
    while more_batches:

        colorized_files: Dict[TexFileName, FileContents] = {}
        colorized_tokens = []

        for tex_filename, tex_file_contents in file_contents.items():
            colorized_tex = tex_file_contents.contents
            if insert_color_macros:
                colorized_tex = add_color_macros(colorized_tex)

            # Filter equations to those that are not nested in other equations, to avoid coloring a
            # token more than once. It could work to color multiple times, though right now it will
            # break colorization as a token's position will be broken for the second coloring.
            equations_filtered = filter(
                lambda e: e.depth == 0, equations_by_file[tex_filename]
            )

            equations_reverse_order = sorted(
                equations_filtered, key=lambda e: e.content_start, reverse=True,
            )
            for equation in equations_reverse_order:
                equation_tokens = tokens_by_equation.get(
                    EquationId(tex_filename, equation.i)
                )
                if equation_tokens is not None:
                    (
                        colorized_tex,
                        colorized_tokens_for_equation,
                    ) = _colorize_tokens_for_equation(
                        colorized_tex, equation, equation_tokens, token_skip, preset_hue
                    )
                    colorized_tokens.extend(colorized_tokens_for_equation)

            colorized_files[tex_filename] = FileContents(
                tex_file_contents.path, colorized_tex, tex_file_contents.encoding
            )

        # If some tokens were colorized...
        if len(colorized_tokens) > 0:

            # Return batch of colorized tokens and colorized TeX
            yield TokenColorizationBatch(colorized_files, colorized_tokens)
            colorized_tokens = []
            colorized_files = {}

            # Continue coloring, starting from another set of tokens
            more_batches = True
            token_skip += NUM_HUES

        else:
            more_batches = False


class TokenEquationColorizationBatch(NamedTuple):
    colorized_tex: str
    colorized_tokens: List[ColorizedTokenWithOrigin]


def _colorize_tokens_for_equation(
    tex: str,
    equation: Equation,
    tokens: List[TokenWithOrigin],
    skip: int = 0,
    preset_hue: Optional[float] = None,
) -> TokenEquationColorizationBatch:
    """
    Colorize tokens in an equation until there are no more hues.
    To keep colorizing tokens after the hues run out, call this function again, setting 'skip'
    to the number of tokens that were colored in previous calls.
    """

    hue_generator = generate_hues()
    colorized_tokens = []

    tokens_last_to_first = sorted(tokens, key=lambda t: t.start, reverse=True)
    tokens_after_skip = tokens_last_to_first[skip:]

    for token in tokens_after_skip:
        try:
            if preset_hue is None:
                hue = next(hue_generator)
            else:
                hue = preset_hue
        except StopIteration:
            break

        color_positions = _get_token_color_positions(token, equation)

        tex = insert_color_in_tex(
            tex,
            hue,
            equation.content_start + color_positions.start,
            equation.content_start + color_positions.end,
            braces=True,
        )
        colorized_tokens.append(
            ColorizedTokenWithOrigin(
                token.tex_path,
                token.equation.i,
                token.token_index,
                token.start,
                token.end,
                token.text,
                hue,
            )
        )

    return TokenEquationColorizationBatch(tex, colorized_tokens)


def _get_token_color_positions(
    token: TokenWithOrigin, equation: Equation
) -> CharacterRange:
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
    equation_tex = equation.content_tex
    token_string = equation_tex[token.start : token.end]

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
    start = max(token_start, 0)
    end = min(token_end, len(equation_tex))
    return CharacterRange(start, end)


def _disable_hyperref_coloring(tex: str) -> str:
    """
    Coloring from the hyperref package will overwrite the coloring of citations. Disable coloring
    from the hyperref package.
    """
    colorlinks_extractor = ColorLinksExtractor()
    colorlinks_elements = list(colorlinks_extractor.parse(tex))

    colorlinks_reverse_order = sorted(
        colorlinks_elements, key=lambda c: c.value_start, reverse=True,
    )

    for colorlinks in colorlinks_reverse_order:
        tex = tex[: colorlinks.value_start] + "false" + tex[colorlinks.value_end :]

    return tex
