import logging
import re
from typing import Iterator, List, Optional, Set

from common.parse_tex import TexSoupParseError, parse_soup
from common.scan_tex import Pattern, scan_tex
from TexSoup import RArg, TexNode, TexSoup, TokenWithPosition

from .types import Bibitem


class BibitemExtractor:
    def __init__(self) -> None:
        self.current_bibitem_label: Optional[str] = None
        self.bibitem_text = ""
        self.nodes_scanned: Set[TexNode] = set()
        self.bibitems: List[Bibitem] = []

    def parse(self, tex: str) -> Iterator[Bibitem]:
        bibitem_pattern = Pattern("bibitem", r"\\bibitem.*?(?=\\bibitem|\n\n|$|\\end{)")
        for bibitem in scan_tex(tex, [bibitem_pattern]):
            try:
                bibitem_soup = parse_soup(bibitem.text)
            except TexSoupParseError:
                continue
            key = self._extract_key(bibitem.text)
            tokens = self._extract_text(bibitem_soup)
            if key is None:
                logging.warning(
                    "Detected bibitem with null key %s. Skipping.", str(bibitem_soup)
                )
                continue
            yield Bibitem(
                id_=key,
                text=tokens,
                start=-1,
                end=-1,
                tex_path="N/A",
                tex="N/A",
                context_tex="N/A",
            )

    def _extract_key(self, bibitem_text: TexSoup) -> Optional[str]:
        # The format of a bibitem control sequence is:
        # \bibitem[label]{key}
        # where the "[label]" is optional. See the "LaTeX 2ε Sources" manual by Braams et al.
        # There may be spaces (but not more than two newlines) before each of the arguments
        # to the '\bibitem'. There often are these spaces in automatically-generated .bbl files.

        # Remove comments from bibitem TeX. In some generated bibliographies, the key may begin
        # only after a comment and a newline. TexSoup fails to parse key arguments that come
        # after comments, newlines, and tabs, even though they are valid keys.
        normalized_tex = re.sub(r"%.*?$\s*", "", bibitem_text, flags=re.MULTILINE)
        try:
            bibitem = parse_soup(normalized_tex)
        except TexSoupParseError:
            return None

        for arg in bibitem[0].args:
            if isinstance(arg, RArg):
                return str(arg.value)
        return None

    def _extract_text(self, bibitem: TexSoup) -> str:
        text = ""
        for content in list(bibitem.contents)[1:]:
            if isinstance(content, TexNode) and content.string is not None:
                text += content.string
            # Extract text from hyperlinks, e.g., extract the reference text from
            # `\href{<LINK>}{<Reference text...>}`. Some conferences like ACL
            # frequently typeset some parts of references, like titles, as hyperlinks.
            elif (
                isinstance(content, TexNode)
                and content.name == "href"
                and len(content.args) >= 2
                and isinstance(content.args[1], RArg)
            ):
                text += content.args[1].value
            # One common pattern in TeX is to force capitalization for a bibliography entry by
            # surrounding tokens with curly braces. This gets interpreted (incorrectly)
            # by TeXSoup as an RArg. Here, the contents of an RArg are extracted as literal
            # text. A space is appended after the RArg's value because TeXSoup will remove the
            # spaces between what it interprets as RArgs. As only approximate matching will be
            # performed on the text, erroneous insertion of spaces shouldn't be an issue.
            if isinstance(content, RArg):
                text += content.value + " "
            elif isinstance(content, TokenWithPosition):
                text += str(content)
        return _clean_bibitem_text(text)


def _clean_bibitem_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()
