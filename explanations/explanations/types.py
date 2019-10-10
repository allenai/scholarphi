from typing import Dict, NamedTuple

"""
Map from a float hue [0..1] to the LaTeX equation with that color.
"""
ColorizedEquations = Dict[float, str]


"""
Contents of a set of tex files. Maps from path to TeX file to the file's colorized contents.
"""
TexContents = Dict[str, str]


class ColorizedTex(NamedTuple):
    contents: TexContents
    equations: ColorizedEquations


class Rectangle(NamedTuple):
    """
    Rectangle within an image. Left and top refer to positions of pixels.
    """

    left: int
    top: int
    width: int
    height: int


class PdfBoundingBox(NamedTuple):
    left: float
    top: float
    width: float
    height: float
    page: int


class LocalizedEquation(NamedTuple):
    tex: str
    box: PdfBoundingBox


class Position(NamedTuple):
    """
    Position of token within TeX. The first line is 0, and the first character is 0.
    """

    line: int
    character: int


class Token(NamedTuple):
    """
    Token from a TeX equation.
    """

    text: str
    start: Position
    end: Position
