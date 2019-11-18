import logging
from abc import ABC, abstractmethod
from typing import Callable, List, NamedTuple, Optional
from unittest import mock

import TexSoup as TexSoupModule
from TexSoup import (
    Buffer,
    RArg,
    TexCmd,
    TexEnv,
    TexNode,
    TexSoup,
    TokenWithPosition,
    read_tex,
    tokenize,
)

TexFileName = str
TexContents = str


class ParseListener(ABC):
    @abstractmethod
    def on_node_parsed(
        self, buffer: Buffer, node: TexNode, start: int, end: int
    ) -> None:
        pass


class CitationExtractor(ParseListener):

    COMMAND_NAMES: List[str] = ["cite"]

    def __init__(self) -> None:
        self.citations: List[Citation] = []

    def on_node_parsed(
        self, buffer: Buffer, node: TexNode, start: int, end: int
    ) -> None:
        if isinstance(node, TexCmd):
            if node.name in self.COMMAND_NAMES:
                keys: List[str] = []
                for arg in node.args:
                    if isinstance(arg, RArg):
                        keys = arg.value.split(",")
                        break
                self.citations.append(Citation(keys, start, end))


class Citation(NamedTuple):
    keys: List[str]
    """
    Indexes of characters in TeX where the citation appears.
    """
    start: int
    end: int


class EquationExtractor(ParseListener):

    EQUATION_ENVIRONMENT_NAMES: List[str] = ["$", "equation", "["]

    def __init__(self) -> None:
        self.equations: List[Equation] = []

    def on_node_parsed(
        self, buffer: Buffer, node: TexNode, start: int, end: int
    ) -> None:
        if isinstance(node, TexEnv):
            if node.name in self.EQUATION_ENVIRONMENT_NAMES:
                tex = str(node)
                """
                XXX(andrewhead): the extraction of equation contents as the first element of
                'contents' only works because the TexSoup parser does not attempt to further parse
                what's inside an equation (i.e. other commands and nested equations). If the TexSoup
                parser is modified to parse equation internals, this code must be changed.
                """
                equation_contents = next(node.contents)
                if not isinstance(equation_contents, TokenWithPosition):
                    logging.warning(
                        "Equation contents is not a token with position. Skipping: %s",
                        node,
                    )
                    return

                content_tex = str(equation_contents)
                content_start = equation_contents.position
                index = len(self.equations)
                self.equations.append(
                    Equation(tex, content_tex, index, start, end, content_start)
                )


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


def wrap_read_tex_func(
    read_tex_original: Callable[[Buffer], None], listeners: List[ParseListener]
) -> Callable[[Buffer], None]:
    def _wrapped(src: Buffer) -> None:
        tex_buffer = src

        position_before = tex_buffer.peek().position
        node = read_tex_original(src)
        position_after = _get_next_token_position_or_buffer_end_position(src)

        for listener in listeners:
            listener.on_node_parsed(tex_buffer, node, position_before, position_after)

        return node

    return _wrapped


def walk_tex_parse_tree(
    tex: str, listeners: Optional[List[ParseListener]] = None
) -> None:
    """
    XXX(andrewhead): Walk the parse tree *not* with a TexSoup object, but by instrumenting TexSoup's
    parser, i.e. the 'read_tex' method. This is because the vital positions of many tokens are lost
    in TexSup objects, but it's available in the 'read_tex' method.

    'read_tex' is wrapped to capture the start and end positions of tokens when it finishes parsing
    a rule. It also calls a list of provided listeners whenever a rule is finished parsing.

    'read_tex' is patched below with the mock library, because it is called recursively from within
    the 'read_tex' method. The patch redirects nested calls to 'read_tex' with calls to the wrapped
    version, to make sure it's called whenever a nested rule finishes parsing.
    """
    listeners = [] if listeners is None else listeners
    read_tex_instrumented = wrap_read_tex_func(read_tex, listeners)

    with mock.patch.object(
        TexSoupModule.reader, "read_tex", side_effect=read_tex_instrumented
    ):
        tokens = tokenize(tex)
        buffer = Buffer(tokens)
        try:
            while buffer.hasNext():
                read_tex_instrumented(buffer)
        except (TypeError, EOFError) as e:
            raise TexSoupParseError(str(e))


def _get_next_token_position_or_buffer_end_position(buffer: Buffer) -> int:

    if buffer.peek():
        next_token = buffer.peek()
        assert isinstance(next_token.position, int)
        return next_token.position

    last_token = buffer.peek(-1)
    assert isinstance(last_token.position, int)
    return last_token.position + len(last_token)


class TexSoupParseError(Exception):
    """
    Error parsing a TeX file using TexSoup.
    """


def parse_soup(tex: str) -> TexSoup:
    """
    Use this utility method for parsing a TexSoup objct from TeX.
    It's not recommended to use TexSoup objects for transforming TeX, however, as TeX soup sometimes
    changes the TeX when it prints it back out. For now, TexSoup objects are best used for scraping
    entities from the TeX, if you don't care about exactly where in the text those entites came from.
    """
    try:
        soup = TexSoup(tex)
        return soup
    except (TypeError, EOFError) as e:
        raise TexSoupParseError(str(e))
