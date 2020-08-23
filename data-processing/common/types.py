from dataclasses import dataclass
from typing import Any, Callable, Dict, List, NamedTuple, Optional, Set, Union

"""
FILE PROCESSING
"""

ArxivId = str
Path = str
AbsolutePath = str
RelativePath = str


@dataclass(frozen=True)
class FileContents:

    path: Path
    " Relative or absolute; depends on the path passed in for file reading. "

    contents: str
    " Contents of the file. "

    encoding: str
    " Character encoding of the file. "


@dataclass(frozen=True)
class PipelineJob:

    email: Optional[str]
    " Email address to send results to. "

    dry_run: Optional[bool]
    """
    Whether to skip uploading processing results to the database. Use this option when you want
    to receive a digest and create logs for how a paper is processed, but you don't want to merge
    the extracted bounding boxes into the database.
    """

    arxiv_ids: List[ArxivId]
    " List of papers to process. "


@dataclass(frozen=True)
class OutputFile:
    output_type: str
    " Type of file output by running TeX (e.g., 'ps', 'pdf')"

    path: RelativePath
    """
    Path to file relative to the compilation directory. In most cases, this will
    either be relative to <data-directory>/<arxiv-id>, or to
    <data-directory>/<arxiv-id>/<iteration>/.
    """


@dataclass(frozen=True)
class CompilationResult:
    success: bool
    output_files: List[OutputFile]
    stdout: bytes
    stderr: bytes


"""
SEMANTIC SCHOLAR API
"""

S2Id = str
S2AuthorId = str


@dataclass(frozen=True)
class Author:
    id: Optional[S2AuthorId]
    name: str


@dataclass(frozen=True)
class Reference:
    s2_id: S2Id
    arxivId: ArxivId
    doi: str
    title: str
    authors: List[Author]
    venue: str
    year: int


@dataclass(frozen=True)
class SerializableReference:
    s2_id: S2Id
    arxivId: ArxivId
    doi: str
    title: str
    authors: str
    " Should be a literal string representing a Python list that can be read with ast.literal_eval "
    venue: str
    year: int


@dataclass(frozen=True)
class S2Metadata:
    s2_id: S2Id
    references: List[Reference]


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
class SerializableEntity(Entity):
    """
    If they are to be saved and loaded to the file system, entities should have additional
    information that can uniquely identify them (tex_path, id_), and a raw representation of
    their contents (tex, content_tex). The unique identifier will be key in later stages of
    the pipeline for linking information about the entity with its hue from colorization and the
    bounding boxes detected for the entitiy.

    To be serializable to CSV, an entity should generally only have fields of primitive types.
    That said, the 'load_csv' method of the 'file_utils' module also provides utilities for
    loading more complex data types, like optional fields, lists of strings, and mutable
    strings. For a full list of permissible data types, see the 'load_csv' method.
    """

    tex_path: str
    """
    The path to the TeX file this entity was found in. Should be a short path, relative to the
    directory of sources this TeX file is in, not relative to the data directory, and not
    relative to the source code directory for this project.
    """

    id_: str
    """
    An ID which, when combined with the TeX path and arXiv ID for this entity, can uniquely
    identify the entity. In many cases, this will simply be a stringified index of which entity
    in the TeX file this is (e.g., 0, 1, 2, ...).
    """

    tex: str
    " The TeX for the detected entity. "

    context_tex: str
    """
    Context around the position where this entity was extracted from. It's recommended that
    at least 20 characters to the left and right are included.
    """


@dataclass(frozen=True)
class HueIteration:
    hue: float
    iteration: str


@dataclass(frozen=True)
class Equation(SerializableEntity):
    i: int
    " Index of this equation in the TeX document. "

    content_start: int
    " Index of character where the contents (i.e. 'content_tex') of the equation starts. "

    content_end: int
    " Index of character where the contents of the equation ends. "

    content_tex: str
    " TeX for the equation contents, inside the environment (e.g., 'x + y'). "

    katex_compatible_tex: str
    " A santized version of the equation content meant for KaTeX parsing. "

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
class Phrase(SerializableEntity):
    text: str


@dataclass(frozen=True)
class Term(SerializableEntity):
    text: str
    sentence_id: Optional[str]

    type_: Optional[str]
    " Type of term (e.g., symbol, protologism, abbreviation). "

    definitions: List[str]
    " List of definitions that describe this term. "

    sources: List[str]
    """
    List of sources that describe where each definition came from. One per definition.
    To find the source for a definition, look for the source with the same index as
    the definition.
    """


@dataclass(frozen=True)
class BeginDocument(Entity):
    pass


@dataclass(frozen=True)
class Documentclass(Entity):
    pass


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
TokenIndex = int
SymbolIndex = int


@dataclass(frozen=True)
class SymbolId:
    tex_path: str
    equation_index: EquationIndex
    symbol_index: SymbolIndex


@dataclass(frozen=True)
class TokenId:
    tex_path: str
    equation_index: EquationIndex
    token_index: TokenIndex


@dataclass(frozen=True)
class Token(Entity):
    text: str
    " Unicode (not TeX) representation of this token, computed by parsing the equation with KaTeX. "

    token_index: TokenIndex
    """
    Index of this token within the equation. These indexes are guaranteed to be unique within eqach
    equation; however they will not necessarily be contiguous or in order from left to right.
    """


@dataclass(frozen=True)
class TokenWithOrigin(Token):
    tex_path: str
    equation: Equation


MathML = str


class Symbol(NamedTuple):
    tokens: List[TokenIndex]
    tex: str
    start: int
    end: int
    mathml: MathML
    children: List[Any]
    """
    List of child symbols. Should be of type 'Symbol'. 'children' is a bit of misnomer. These is
    actually a list of all other symbols for which this is the closest ancestor.
    """


class SymbolWithId(NamedTuple):
    symbol_id: SymbolId
    symbol: Symbol


@dataclass(frozen=True)
class EquationId:
    tex_path: str
    equation_index: int


" Serializable data classes for symbols, for storing results to file"


@dataclass(frozen=True)
class SerializableToken(SerializableEntity, Token):
    tex_path: str
    equation: str

    equation_index: int

    equation_depth: int
    " 'depth' attribute for the equation this token belongs to. "

    relative_start: int
    """
    While the 'start' and 'end' attributes are the absolute character offsets of the token in the
    TeX file, 'relative_start' and 'relative_end' are relative to the equation it was found in.
    They are the count of characters after the 'content_start' of the containing equation where
    this token starts and finishes.
    """

    relative_end: int
    " See 'relative_start'. "


@dataclass(frozen=True)
class SerializableSymbol(SerializableEntity, SymbolId):
    equation: str
    mathml: str
    is_definition: bool
    """
    Whether this appearance of the symbol is a definition of the symbol.
    """


@dataclass(frozen=True)
class SerializableChild(SymbolId):
    equation: str
    child_index: int


@dataclass(frozen=True)
class SerializableSymbolToken(SymbolId, TokenId):
    pass


"""
COLORIZATION RECORDS
"""

Hue = float


@dataclass(frozen=True)
class ColorizedTokenWithOrigin:
    tex_path: str
    equation_index: int
    token_index: int
    start: int
    end: int
    text: str
    hue: Hue


@dataclass(frozen=True)
class ColorizationRecord:
    tex_path: str
    iteration: str
    hue: float
    entity_id: str
    " Should match the ID on a 'SerializableEntity'"


@dataclass(frozen=True)
class EquationTokenColorizationRecord(ColorizationRecord, ColorizedTokenWithOrigin):
    pass


"""
SEARCH
"""


@dataclass(frozen=True)
class Match:
    """
    A MathML equation that matches a queried MathML equation. Rank is relative to the set of
    MathML equations it was chosen from. Rank starts at 1.
    """

    queried_mathml: MathML
    matching_mathml: MathML
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


@dataclass(frozen=True)
class Rectangle:
    """
    Rectangle within an image. Left and top refer to positions of pixels.
    """

    left: int
    top: int
    width: int
    height: int


@dataclass(frozen=True)
class FloatRectangle:
    left: float
    top: float
    width: float
    height: float


@dataclass(frozen=True)
class BoundingBox(FloatRectangle):
    """
    Bounding box for an entity. Left, top, width, and height are all expressed on a range of
    0..1, where 0 is all the way to the top/left, and 1 is all the way to the bottom/right.
    Bounding boxes are expressed with these ratio dimensions instead of absolute dimensions
    as it's much easier, and accurate enough. To get absolute dimensions in PDF coordinates
    would require us to add to our pipeline a way of detecting the PDF dimensions of all
    files output by the TeX compiler (i.e. for both PDFs and PostScript), which requires
    dependence on external tools like GhostScript. Ratio dimensions can be detected in the
    exact same way for all output files, as long as we can raster them to PNGs.
    """

    page: int


@dataclass(frozen=True)
class BoundingBoxAndHue:
    hue: float
    box: BoundingBox


@dataclass(frozen=True)
class HueLocationInfo(BoundingBox, ColorizationRecord):
    pass


TokenLocations = Dict[TokenId, List[BoundingBox]]


@dataclass(frozen=True)
class CitationLocation(BoundingBox):
    key: str
    cluster_index: int


@dataclass(frozen=True)
class CitationData:
    arxiv_id: ArxivId
    s2_id: S2Id
    citation_locations: Dict[str, Dict[int, Set[CitationLocation]]]
    key_s2_ids: Dict[str, str]
    s2_data: Dict[S2Id, SerializableReference]


@dataclass(frozen=True)
class SymbolLocation(SymbolId, BoundingBox):
    pass


"""
DATABASE UPLOADS
"""


@dataclass(frozen=True)
class EntityReference:
    """
    Reference to another entity within the same paper. The combination of entity ID and type should
    provide a key to the entity that is unique within the paper.
    """

    id_: Optional[str]
    type_: str


"""
Unique data for each type of entity is stored as key-value pairs. Values can either be strings
(a general catch-all data type for storing strings, HTML, integers, etc.), or lists of strings.
"""
EntityData = Dict[str, Union[int, float, str, List[str], List[int], List[float]]]

"""
Relationships for an entity, also stored as key-value pairs. The key is the name of the
related entity. The value is an entity reference, which includes a type and ID that uniquely
identifies the related entity in this paper.
"""
EntityRelationships = Dict[str, Union[EntityReference, List[EntityReference]]]


@dataclass(frozen=True)
class EntityInformation:
    id_: str
    type_: str
    " Together, the 'id' and the 'type' should provide a unique ID for this entity within the paper. "

    bounding_boxes: List[BoundingBox]
    data: Optional[EntityData] = None
    relationships: Optional[EntityRelationships] = None


@dataclass(frozen=True)
class EntityAndLocation:
    entity: SerializableEntity
    locations: List[HueLocationInfo]


@dataclass(frozen=True)
class PaperProcessingResult:
    arxiv_id: ArxivId
    s2_id: S2Id
    localized_entities: List[EntityAndLocation]


VersionNumber = int


EntityUploadCallable = Callable[[PaperProcessingResult, Optional[VersionNumber]], None]


"""
PIPELINE RESULTS
"""


@dataclass(frozen=True)
class EntityProcessingDigest:
    """
    If a count is 'None', it could mean either that the count is 0, or that this statistic simply
    could not be computed for this entity and paper.
    """

    num_extracted: Optional[int] = None
    " Number of entities found in the TeX by the entity extractor. "

    num_entities_located: Optional[int] = None
    " The number of entities for which a bounding box was found in the paper. "

    num_hues_located: Optional[int] = None
    """
    The number of hues for colorized entities for which bounding boxes were found. In many cases,
    this can be used as a rough estimate of the number of entities for which bounding box
    positions were found in the paper; the number of entities which were located is probably less
    than the number of hues found. This statistic should be defined if it is prohibitively
    difficult to figure out the number of entities that were located, or as a workable default
    when supporting a new type of entity for the first time.
    """


PaperProcessingDigest = Dict[str, EntityProcessingDigest]
" A digest of statistics of how many entities were processed for a paper, by entity type. "


PipelineDigest = Dict[ArxivId, PaperProcessingDigest]
" A digest of the results of running the pipeline on a set of papers. "
