import colorsys
import logging
import os
from dataclasses import dataclass
from typing import Callable, Dict, Iterator, List, Optional, Sequence, Tuple

import numpy as np

from common.parse_tex import BeginDocumentExtractor, DocumentclassExtractor, overlaps
from common.types import CharacterRange, Hue, SerializableEntity

"""
Most TeX coloring operations follow the same process.

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

If you want a better sense of the colorization process, see the 'colorize_equations' method, which
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


def add_color_macros(tex: str, after_macros: Optional[str] = None) -> str:
    documentclass_extractor = DocumentclassExtractor()
    documentclass = documentclass_extractor.parse(tex)
    if documentclass is not None:
        begin_document_extractor = BeginDocumentExtractor()
        begin_document = begin_document_extractor.parse(tex)
        if begin_document is not None:
            return (
                tex[: begin_document.start]
                + "\n"
                + COLOR_MACROS_BASE_MACROS
                + "\n"
                + COLOR_MACROS_LATEX_IMPORTS
                + "\n"
                + tex[begin_document.start : begin_document.end]
                + "\n"
                # These main color macros should be included *after* "\begin{document}". This is
                # because AutoTeX will sometimes add a "\RequirePackage{hyperref}" statement right
                # before "\begin{document}" in the moments before compiling the TeX. If we instead
                # put the color macros are put above "\begin{document}", what happens is that
                # hyperref reverts the hyperref macros that we had redefined to enable coloring.
                + COLOR_MACROS
                + ("\n" + after_macros if after_macros else "")
                + tex[begin_document.end :]
            )
    return (
        TEX_COLOR_MACROS + ("\n" + after_macros if after_macros else "") + "\n\n" + tex
    )


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


def wrap_span(
    tex: str, start: int, end: int, before: str, after: str, braces: bool = False
) -> str:
    return (
        tex[:start]
        + ("{" if braces else "")
        + before
        + tex[start:end]
        + after
        + ("}" if braces else "")
        + tex[end:]
    )


def insert_color_in_tex(
    tex: str, entity_id: str, hue: float, start: int, end: int, braces: bool = False
) -> str:
    """
    Set 'braces' if you want the TeX (including coloring commands) to be wrapped in curly braces.
    This is particularly helpful for coloring symbols, so that single letters that may be an
    argument of a macro will still be considered as just one argument to that macro.
    """
    return wrap_span(
        tex,
        start,
        end,
        _get_color_start_tex(hue),
        _get_color_end_tex(entity_id),
        braces,
    )


def _get_tex_color(hue: float) -> Tuple[float, float, float]:
    """
    Convert a hue value to RGB for a fully-saturated color with a range of [0:1,0:1,0:1].
    """
    red, green, blue = colorsys.hsv_to_rgb(hue, 1, 255)
    red_scaled = red / 255.0
    blue_scaled = blue / 255.0
    green_scaled = green / 255.0
    return red_scaled, green_scaled, blue_scaled


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
    red, green, blue = _get_tex_color(hue)
    return rf"\scholarsetcolor[rgb]{{{red},{green},{blue}}}"


def _get_color_end_tex(entity_id: str) -> str:
    """
    A message is added after an entity is colorized to assist the pipeline with error recovery.
    This allows the pipeline to scan the output of the TeX compiler to detect which entities
    were successfully colorized before errors were encountered.
    """
    return rf"\scholarrevertcolor{{}}\message{{S2: Colorized entity '{entity_id}'.}}"


ColorWhenFunc = Callable[[SerializableEntity], bool]
ColorPositionsFunc = Callable[[SerializableEntity], CharacterRange]


@dataclass(frozen=True)
class ColorizeOptions:
    """
    Options to alter the behavior of the 'colorize_entities' function.
    """

    insert_color_macros: bool = True
    """
    Whether to insert definitions of color macros at the top of each file in which
    entities are colorized. One reason to set this value to 'False' is when testing
    the 'colorize_text' method
    """

    preset_hue: Optional[float] = None
    " If defined, all entities will be colored this single hue. "

    when: Optional[ColorWhenFunc] = None
    " Filter that decides whether to color a particular entity. "

    adjust_color_positions: Optional[ColorPositionsFunc] = None
    """
    Callback that maps an entity to a range of characters that should be colorized in a TeX file.
    If not defined, the range of characters that will be colored will be the span of the entity.
    """

    braces: bool = False
    """
    Whether to surround the colorized entity in curly braces. This seems to be important for
    preventing compilation errors for certaint types of entities, like equation tokens.
    """


EntityId = str


@dataclass(frozen=True)
class ColorizedTex:
    tex: str
    " TeX instrumented with colorization of entities. "

    entity_hues: Dict[EntityId, Hue]
    " Map from entity IDs to the hues they've been colored. "

    skipped: Optional[List[SerializableEntity]] = None
    """
    Sometimes it is impossible to colorize all of the entities at once. One case is when
    to entities overlap with each other. This means that part of at least one of the entities
    will not have the assigned color. In that case, the colorize function is supposed to detect
    the conflict, and return a list of entities that were not colorized, and which should
    therefore be colorized in a later pass.
    """


def colorize_entities(
    tex: str,
    entities: Sequence[SerializableEntity],
    options: ColorizeOptions = ColorizeOptions(),
) -> ColorizedTex:
    """
    This function assumes that entities do not overlap. It is up to the caller to appropriately
    filter entities to those that do not overlap with each other.
    """

    insert_color_macros = options.insert_color_macros
    preset_hue = options.preset_hue
    when = options.when
    preset_hue = options.preset_hue
    adjust_color_positions = options.adjust_color_positions
    braces = options.braces

    # Filter entities to a list where no entity overlaps with any other entity. Those
    # that overlap will be returned as skipped entities.
    entities_filtered: List[SerializableEntity] = []
    skipped = []
    for entity in entities:
        if any([overlaps(entity, e) for e in entities_filtered]):
            skipped.append(entity)
            continue
        entities_filtered.append(entity)

    # Order entities from last-to-first so we can add color commands without messing with the offsets of
    # entities that haven't yet been colored.
    entities_reverse_order = sorted(
        entities_filtered, key=lambda e: e.start, reverse=True
    )

    hue_generator = generate_hues()
    entity_hues = {}

    colorized_tex = tex
    for e in entities_reverse_order:

        # Decide whether or not to color this entity
        if when is not None and not when(e):
            continue

        # Get a hue to color this entity
        if preset_hue is not None:
            hue = preset_hue
        else:
            hue = next(hue_generator)

        # Save a reference to this colorized entity to return to the caller
        entity_hues[e.id_] = hue

        # Determine what range of characters to color
        color_character_range = CharacterRange(e.start, e.end)
        if adjust_color_positions is not None:
            color_character_range = adjust_color_positions(e)
        colorized_tex = insert_color_in_tex(
            colorized_tex,
            e.id_,
            hue,
            color_character_range.start,
            color_character_range.end,
            braces=braces,
        )

    # Only insert color macros after all entities have been wrapped in color commands.
    # The color macros will likely go at the very beginning of the file, and therefore
    # if they are added before the color commands, they are likely to disrupt the character
    # positions at which we expect to find the entities.
    if insert_color_macros:
        colorized_tex = add_color_macros(colorized_tex)

    return ColorizedTex(colorized_tex, entity_hues, skipped=skipped)
