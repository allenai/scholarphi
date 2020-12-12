from typing import List

from common.colorize_tex import (
    ColorizedTex,
    _get_tex_color,
    add_color_macros,
    generate_hues,
)
from common.parse_tex import DocumentclassExtractor
from common.types import ColorizeOptions, SerializableEntity


def colorize_citations(
    tex: str,
    bibitems: List[SerializableEntity],
    options: ColorizeOptions = ColorizeOptions(),
) -> ColorizedTex:
    """
    To save time, this function only attempts to add colorization commands to the main document file,
    as determined by the presence of the "documentclass" macro. This function will do nothing when
    applied to plain TeX (i.e. non-LaTeX) files.
    """

    documentclass_extractor = DocumentclassExtractor()
    documentclass = documentclass_extractor.parse(tex)
    if not documentclass:
        return ColorizedTex(tex, {})

    citation_color_commands_tex = ""
    citation_hues = {}
    hue_generator = generate_hues()
    for bibitem in bibitems:
        if options.preset_hue is not None:
            hue = options.preset_hue
        else:
            hue = next(hue_generator)

        citation_color_commands_tex += _get_color_citation_tex(bibitem.id_, hue) + "\n"
        citation_hues[bibitem.id_] = hue

    colorized_tex = add_color_macros(tex, after_macros=citation_color_commands_tex)
    return ColorizedTex(colorized_tex, citation_hues)


def _get_color_citation_tex(bibitem_key: str, hue: float) -> str:
    """
    Citations are colorized in a different way than other entities. The challenge with using the
    standard approach is that there's no way to introduce colorization commands in a way that will
    color different entries in the same citation differently. (e.g., assigning different colors to
    the two sources in (Weld et al. 2015; Lo et al. 2013)). To get around this problem, we
    instead instrument the citation implementations of LaTeX and hyperref macros.

    The instrumentation of the LaTeX and hyperref macros will be performed by done importing some
    TeX code from the '03-load-color-commands.tex' file. Once that TeX has been imported, all a file
    has to do to colorize a citation with a specific key is to call the
    'scholarregistercitecolor' command from within the TeX, as shown below.
    """

    red, green, blue = _get_tex_color(hue)
    return r"\scholarregistercitecolor{{{key}}}{{{red}}}{{{green}}}{{{blue}}}".format(
        key=bibitem_key, red=red, green=green, blue=blue
    )
