from typing import List

from TexSoup import RArg, TexSoup


def extract_bibitem_ids(bbl_contents: str) -> List[str]:
    soup = TexSoup(bbl_contents)
    bibitems = soup.find_all("bibitem")
    ids = []
    for item in bibitems:
        for arg in item.args:
            if isinstance(arg, RArg):
                ids.append(arg.value)
    return ids
