from typing import Dict, List, NamedTuple, Optional

ArxivId = str
S2Id = str
S2AuthorId = str


"""
Map from a float hue [0..1] to the LaTeX equation with that color.
"""  # pylint: disable=pointless-string-statement
ColorizedEquations = Dict[float, str]


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
    doi: str
    title: str
    authors: List[Author]
    venue: str
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


class FileContents(NamedTuple):
    arxiv_id: ArxivId
    """
    Absolute path to the TeX file.
    """
    path: str
    contents: str


class ColorizedTex(NamedTuple):
    contents: TexContents
    equations: ColorizedEquations


class CompilationResult(NamedTuple):
    success: bool
    compiled_pdfs: Optional[List[bytes]]
    stdout: bytes
    stderr: bytes


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
