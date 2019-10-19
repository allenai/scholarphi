from typing import Dict, List, NamedTuple, Optional, Tuple

ArxivId = str
S2Id = str
S2AuthorId = str
Path = str


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


EquationIndex = int


class Equation(NamedTuple):
    i: EquationIndex
    tex: str


class Token(NamedTuple):
    """
    Token from a TeX equation.
    """

    text: str
    start: int
    end: int


class TokenEquationPair(NamedTuple):
    """
    Token paired with the equation it's from.
    """

    token: Token
    equation: Equation


class LocalizedToken(NamedTuple):
    """
    Token with information that can be used to uniquely identify the token amidst multiple
    papers, multiple files for those papers, and multiple equations in those files.
    """

    text: str
    start: int
    end: int
    arxiv_id: str
    tex_path: str
    equation_index: int


class FileContents(NamedTuple):
    arxiv_id: ArxivId
    """
    Absolute path to the TeX file.
    """
    path: str
    contents: str


"""
Map from a float hue [0..1] to the LaTeX equation with that color.
"""  # pylint: disable=pointless-string-statement
ColorizedEquations = Dict[float, str]


class ColorizedTex(NamedTuple):
    contents: TexContents
    equations: ColorizedEquations


"""
Map from a float hue [0..1] to the token of a TeX equation with that color.
"""
ColorizedTokens = Dict[float, Token]
ColorizedTokensByEquation = Dict[EquationIndex, ColorizedTokens]
ColorizedTokensByLocation = Dict[Tuple[Path, EquationIndex], ColorizedTokens]


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
