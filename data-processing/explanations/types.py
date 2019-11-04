from typing import Dict, List, NamedTuple, Optional

ArxivId = str
S2Id = str
S2AuthorId = str
Path = str
AbsolutePath = str
RelativePath = str


"""
Contents of a set of tex files. Maps from path to TeX file to the file's colorized contents.
"""
TexContents = Dict[str, str]


class Author(NamedTuple):
    id: Optional[S2AuthorId]
    name: str


class Reference(NamedTuple):
    s2Id: S2Id
    arxivId: Optional[ArxivId]
    doi: Optional[str]
    title: str
    authors: List[Author]
    venue: Optional[str]
    year: Optional[int]


class S2Metadata(NamedTuple):
    s2id: S2Id
    references: List[Reference]


class Bibitem(NamedTuple):
    key: str
    """
    Plaintext extracted for bibitem.
    """
    text: str


EquationIndex = int


class Equation(NamedTuple):
    i: EquationIndex
    tex: str


class Token(NamedTuple):
    """
    Token from a TeX equation.
    """

    token_index: int
    text: str
    start: int
    end: int


class TokenEquationPair(NamedTuple):
    """
    Token paired with the equation it's from.
    """

    token: Token
    equation: Equation


class FileContents(NamedTuple):
    arxiv_id: ArxivId
    """
    Absolute path to the TeX file.
    """
    path: str
    contents: str


class ColorizedCitation(NamedTuple):
    hue: float
    keys: List[str]


"""
Map from a float hue [0..1] to the LaTeX equation with that color.
"""
ColorizedEquations = Dict[float, str]


class ColorizedEquation(NamedTuple):
    hue: float
    tex: str
    i: EquationIndex


"""
Map from a float hue [0..1] to the token of a TeX equation with that color.
"""
ColorizedTokens = Dict[float, Token]
ColorizedTokensByEquation = Dict[EquationIndex, ColorizedTokens]


class CompilationResult(NamedTuple):
    success: bool
    compiled_pdfs: Optional[List[str]]
    stdout: bytes
    stderr: bytes


class Point(NamedTuple):
    """
    Location of a pixel within an image.
    """

    x: int
    y: int


class Rectangle(NamedTuple):
    """
    Rectangle within an image. Left and top refer to positions of pixels.
    """

    left: int
    top: int
    width: int
    height: int


class PdfBoundingBox(NamedTuple):
    """
    Bounding box in PDF coordinates.
    """

    left: float
    top: float
    width: float
    height: float
    page: int


class PdfBoundingBoxAndHue(NamedTuple):
    hue: float
    box: PdfBoundingBox


class RasterBoundingBox(NamedTuple):
    """
    Bounding box of pixel locations in an image.
    """

    left: int
    top: int
    width: int
    height: int
    page: int


class BoundingBoxInfo(NamedTuple):
    pdf_box: PdfBoundingBox
    raster_box: RasterBoundingBox


class Position(NamedTuple):
    """
    Position of token within TeX. The first line is 0, and the first character is 0.
    """

    line: int
    character: int
