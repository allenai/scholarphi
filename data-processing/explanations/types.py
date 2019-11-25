from typing import Any, Dict, List, NamedTuple, Optional

"""
FILE PROCESSING
"""

ArxivId = str
Path = str
AbsolutePath = str
RelativePath = str


class FileContents(NamedTuple):
    arxiv_id: ArxivId
    """
    Absolute path to the TeX file.
    """
    path: str
    contents: str


class CompilationResult(NamedTuple):
    success: bool
    compiled_pdfs: Optional[List[str]]
    stdout: bytes
    stderr: bytes


"""
SEMANTIC SCHOLAR API
"""

S2Id = str
S2AuthorId = str


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


"""
CITATIONS
"""


class ColorizedCitation(NamedTuple):
    hue: float
    keys: List[str]


class Bibitem(NamedTuple):
    key: Optional[str]
    """
    Plaintext extracted for bibitem.
    """
    text: str


"""
EQUATION PARSING
"""

EquationIndex = int
CharacterIndex = int
SymbolIndex = int


class CharacterId(NamedTuple):
    tex_path: str
    equation_index: EquationIndex
    character_index: CharacterIndex


class SymbolId(NamedTuple):
    tex_path: str
    equation_index: EquationIndex
    symbol_index: SymbolIndex


class Character(NamedTuple):
    text: str
    i: CharacterIndex
    start: int
    end: int


class CharacterRange(NamedTuple):
    start: int
    end: int


class TokenWithOrigin(NamedTuple):
    """
    A token and a character are the same thing, it just has two names for historical reasons.
    """

    tex_path: str
    equation_index: int
    equation: str
    token_index: int
    start: int
    end: int
    text: str


MathML = str


class Symbol(NamedTuple):
    characters: List[CharacterIndex]
    mathml: MathML
    """
    List of child symbols. Should be of type 'Symbol'. 'children' is a bit of misnomer. These is
    actually a list of all other symbols for which this is the closest ancestor.
    """
    children: List[Any]


class SymbolWithId(NamedTuple):
    symbol_id: SymbolId
    symbol: Symbol


class EquationId(NamedTuple):
    tex_path: str
    equation_index: int


class Equation(NamedTuple):
    """
    TeX for full equation environment (e.g., "$x + y$").
    """

    tex: str
    """
    TeX for the equation markup, inside the environment (e.g., "x + y")
    """
    content_tex: str
    i: int
    """
    Indexes of characters in TeX where the equation appears.
    """
    start: int
    end: int
    """
    Index at which the equation markup starts (corresponds to start of 'content_tex'.)
    """
    content_start: int


class ColorizedEquation(NamedTuple):
    hue: float
    tex: str
    i: EquationIndex


"""
SEARCH
"""


class Match(NamedTuple):
    """
    A MathML equation that matches a queried MathML equation. Rank is relative to the set of
    MathML equations it was chosen from. Rank starts at 1.
    """

    mathml: MathML
    rank: int


Matches = Dict[MathML, List[Match]]


"""
IMAGE PROCESSING
"""


class Point(NamedTuple):
    """
    Location of a pixel within an image.
    """

    x: int
    y: int


class Dimensions(NamedTuple):
    width: int
    height: int


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


CharacterLocations = Dict[CharacterId, List[PdfBoundingBox]]
