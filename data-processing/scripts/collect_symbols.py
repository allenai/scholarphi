import argparse
import json
import os.path
from collections import defaultdict
from typing import Dict, List, Optional

from common import directories, file_utils
from common.commands.base import add_arxiv_id_filter_args, load_arxiv_ids_using_args
from common.types import BoundingBox, EntityLocationInfo, SymbolId

import run_pipeline  # pylint: disable=unused-import

PRIOR_COMMAND_ARGS = [
    "python",
    "scripts/run_pipeline.py",
    "--arxiv-ids-file arxiv_ids.txt",
    "--entities symbols",
    "--end collect-symbol-locations",
    "--one-paper-at-a-time",
    "--keep-paper-data",
    "--dry-run",
    "-v",
]

# <tex-path>-<equation-id>-<symbol-index>
SymbolIdStr = str


def load_symbol_locations(
    arxiv_id: str,
) -> Optional[Dict[SymbolIdStr, List[BoundingBox]]]:
    """
    Load bounding boxes for each entity. Entities can have multiple bounding boxes (as will
    be the case if they are split over multiple lines).
    """

    boxes_by_symbol_id: Dict[str, List[BoundingBox]] = defaultdict(list)
    bounding_boxes_path = os.path.join(
        directories.arxiv_subdir(f"symbols-locations", arxiv_id),
        "entity_locations.csv",
    )

    for hue_info in file_utils.load_from_csv(bounding_boxes_path, EntityLocationInfo):
        box = BoundingBox(
            page=hue_info.page,
            left=hue_info.left,
            top=hue_info.top,
            width=hue_info.width,
            height=hue_info.height,
        )
        boxes_by_symbol_id[f"{hue_info.tex_path}-{hue_info.entity_id}"].append(box)

    return boxes_by_symbol_id


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=(
            "Collect symbol data output by the pipeline into a format "
            + "that can be readily used by external code for evaluating "
            + "the performance of the symbol extractor."
        )
    )
    add_arxiv_id_filter_args(parser)
    args = parser.parse_args()

    arxiv_ids = load_arxiv_ids_using_args(args)
    if arxiv_ids is None:
        raise SystemExit(f"Invalid arXiv IDs argument: {args.arxiv_id}")

    for id_ in arxiv_ids:
        symbol_locations = load_symbol_locations(id_)
        if not symbol_locations:
            continue
        symbols = file_utils.load_symbols(id_)
        if not symbols:
            continue
        symbols_dict = dict(symbols)

        if not os.path.exists("symbols"):
            os.makedirs("symbols")
        with open(
            os.path.join("symbols", f"{id_}.jsonl"), "w", errors="ignore"
        ) as symbols_file:
            for sid_str, locations in symbol_locations.items():
                tex_path, equation_id, symbol_index = sid_str.rsplit("-", maxsplit=2)
                symbol = symbols_dict.get(
                    SymbolId(tex_path, int(equation_id), int(symbol_index))
                )
                if not symbol:
                    continue
                if not locations:
                    continue

                parent = symbol.parent
                l = min([l.left for l in locations])
                r = max([l.left + l.width for l in locations])
                t = min([l.top for l in locations])
                b = max([l.top + l.height for l in locations])

                parent_id = (
                    f"{parent.tex_path}-{parent.equation_index}-{parent.symbol_index}"
                    if parent
                    else None
                )
                sym_json = {
                    "id_": sid_str,
                    "mathml": symbol.mathml,
                    "tex": symbol.tex,
                    "location": {"left": l, "top": t, "width": r - l, "height": b - t, "page": locations[0].page},
                    "parent": parent_id,
                    "type_": symbol.type_,
                }
                symbols_file.write(json.dumps(sym_json) + "\n")

        pass
