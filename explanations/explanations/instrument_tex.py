import os.path
from typing import Union

from TexSoup import TexNode, TexSoup


def color_equations(tex: str) -> str:
    soup = TexSoup(tex)
    for equation in list(soup.find_all("$")):
        parent = equation.parent
        sibling_expr_ids = []
        for sibling in list(parent.contents):
            sibling_expr_id = id(sibling.expr) if isinstance(sibling, TexNode) else -1
            sibling_expr_ids.append(sibling_expr_id)
        index = sibling_expr_ids.index(id(equation.expr))
        parent.insert(index, "{\\color{red} ")
        parent.insert(index + 2, "}")
    return str(soup)


# def get_main_file(sources_dir: str) -> Union[str, None]:
#     for filename in os.listdir(sources_dir):
#         if filename.endswith(".tex"):
#             path = os.path.join(sources_dir, filename)
#             with open(path) as tex_file:
#                 tex_file.read()
#     return None
