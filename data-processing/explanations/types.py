from dataclasses import dataclass
from typing import Any, Dict, List, NamedTuple, Optional

"""
FILE PROCESSING
"""

ArxivId = str
Path = str
AbsolutePath = str
RelativePath = str


@dataclass(frozen=True)
class FileContents:
    """
    Relative or absolute; depends on the path passed in for file reading.
    """

    path: Path
    """
    Contents of the file.
    """
    contents: str
    """
    Character encoding of the file.
    """
    encoding: str


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


class Bibitem(NamedTuple):
    key: Optional[str]
    """
    Plaintext extracted for bibitem.
    """
    text: str


"""
TEX PARSING
"""

TexFileName = str
TexContents = str


@dataclass(frozen=True)
class CharacterRange:
    start: int
    "Character position where this range begins in the TeX."

    end: int
    "Character position where this range ends in the TeX."


@dataclass(frozen=True)
class Entity(CharacterRange):
    """
    Every entity has, at the least, a start and end position.
    """


@dataclass(frozen=True)
class Citation(Entity):
    keys: List[str]


@dataclass(frozen=True)
class Equation(Entity):
    i: int
    "Index of this equation in the TeX document."

    tex: str
    "TeX for the full equation environment (e.g., '$x + y$')."

    content_start: int
    "Index of character where the contents (i.e. 'content_tex') of the equation starts."

    content_end: int
    "Index of character where the contents of the equation ends."

    content_tex: str
    "TeX for the equation contents, inside the environment (e.g., 'x + y')."

    depth: int
    """
    Depth within a tree of equations. Most equations will not be nested in others, so will have a
    depth of 0 if not nested in another equation. As an example, if this equation is nested in
    another equation, which is nested in another equation, it will have a depth of 2.
    """


@dataclass(frozen=True)
class LengthAssignment(Entity):
    pass


@dataclass(frozen=True)
class BeginDocument(Entity):
    pass


@dataclass(frozen=True)
class Documentclass(Entity):
    pass


class ColorLinks(NamedTuple):
    value: str
    value_start: int
    value_end: int


@dataclass(frozen=True)
class MacroDefinition:
    name: str
    " Name of macro. For example, 'omega' if you want to detect \\omega{}. "

    parameter_string: str
    " Parameter string for macro, in TeX format, e.g., '[#1]#2'. As with TeX, can be empty string. "


@dataclass(frozen=True)
class Macro(Entity):
    tex: str


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


@dataclass(frozen=True)
class TokenWithOrigin:
    """
    A token and a character are the same thing, it just has two names for historical reasons.
    """

    tex_path: str
    equation: Equation
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


@dataclass(frozen=True)
class EquationId:
    tex_path: str
    equation_index: int


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
