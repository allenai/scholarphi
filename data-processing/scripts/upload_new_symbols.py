import argparse
import dataclasses
import json
import math
import os
import os.path
import random
import tempfile
from typing import Dict, List, Optional, Tuple

import cv2
from common.commands.raster_pages import raster_pages
from common.fetch_arxiv import fetch_from_arxiv
from common.models import setup_database_connections
from common.types import BoundingBox, EntityUploadInfo, Path
from common.unpack import unpack_archive
from common.upload_entities import upload_entities

# pylint: disable=wrong-import-order
from texcompile.client import compile as texcompile
from texsymdetect.client import detect_symbols


def process(
    arxiv_id: str,
    s2_id: str,
    schema: str,
    create_tables: bool = False,
    debug_output_dir: Optional[Path] = None,
) -> None:

    if debug_output_dir and not os.path.exists(debug_output_dir):
        os.makedirs(debug_output_dir)

    print("Initializing connection to the database.")
    setup_database_connections(schema_name=schema, create_tables=create_tables)

    with tempfile.TemporaryDirectory() as temp_dir:

        sources_path = os.path.join(temp_dir, "fetched-sources")
        print(
            f"Downloading archive of source files from arXiv for paper {arxiv_id}...",
            end="",
        )
        fetch_from_arxiv(arxiv_id, dest=sources_path)
        print("done.")

        unpacked_dir = os.path.join(temp_dir, "unpacked")
        print(f"Unpacking sources for paper {arxiv_id} into {unpacked_dir}.")
        unpack_archive(sources_path, unpacked_dir)

        print("Compiling sources...", end="")
        outputs_dir = os.path.join(temp_dir, "compiled-files")
        compilation_result = texcompile(unpacked_dir, outputs_dir)
        if not compilation_result.success:
            raise SystemExit("Compilation of paper failed.", compilation_result.log)
        print("done.")

        print("Rastering PS/PDF to images...", end="")
        images_dir = os.path.join(temp_dir, "images")
        raster_success = raster_pages(
            outputs_dir,
            images_dir,
            # TODO(andrewhead): support projects with multiple output files.
            compilation_result.output_files[0].name,
            compilation_result.output_files[0].type_,
        )
        print("done.")

        print("Detecting symbols (this will take some time)...", end="")
        symbols = detect_symbols(unpacked_dir)
        print("done.")

        if debug_output_dir:
            debug_symbols_path = os.path.join(debug_output_dir, "symbols.jsonl")
            print(f"Writing symbol locations to {debug_symbols_path}...", end="")
            with open(debug_symbols_path, "w", errors="ignore") as symbols_file:
                for s in symbols:
                    symbols_file.write(json.dumps(dataclasses.asdict(s)) + "\n")
        print("done.")

        print("Drawing symbol bounding boxes over image...", end="")
        if debug_output_dir:
            debug_images_dir = os.path.join(debug_output_dir, "debug-images")
            print(f"\nImages will be saved to {debug_images_dir}...", end="")
        else:
            debug_images_dir = os.path.join(temp_dir, "debug-images")
        if not os.path.exists(debug_images_dir):
            os.makedirs(debug_images_dir)

        entity_colors: Dict[str, Tuple[int, int, int]] = {}
        for filename in os.listdir(images_dir):
            path = os.path.join(images_dir, filename)
            image = cv2.imread(path)
            image_height = image.shape[0]
            image_width = image.shape[1]
            page_no = int(filename.split(".")[0][5:])

            for symbol in symbols:
                if symbol.location.page != page_no:
                    continue

                key = symbol.mathml

                # Use a consistent (yet initially randomly-chosen) color for each entity detected.
                if key not in entity_colors:
                    entity_colors[key] = (
                        random.randint(0, 256),
                        random.randint(0, 256),
                        random.randint(0, 256),
                    )
                color = entity_colors[key]

                left = math.floor(symbol.location.left * image_width)
                top = math.floor(symbol.location.top * image_height)
                right = math.ceil(left + symbol.location.width * image_width)
                bottom = math.ceil(top + symbol.location.height * image_height)

                width = symbol.location.width
                height = symbol.location.height
                cv2.rectangle(
                    image, (left, top), (right, bottom), color, 1,
                )

            cv2.imwrite(
                os.path.join(debug_images_dir, f"page-{page_no:03d}.png"), image
            )

        print("done.")

        print("Uploading symbol data to the database...", end="")
        entity_infos: List[EntityUploadInfo] = []
        for symbol in symbols:
            data = {
                "type": symbol.type_,
                "tex": f"${symbol.tex}$",
                "mathml": symbol.mathml,
                "tags": [],
            }
            bounding_box = BoundingBox(
                left=symbol.location.left,
                top=symbol.location.top,
                width=symbol.location.width,
                height=symbol.location.height,
                page=symbol.location.page - 1,
            )

            # Save all data for this symbol
            entity_information = EntityUploadInfo(
                id_=symbol.id_,
                type_="symbol",
                bounding_boxes=[bounding_box],
                data=data,
                relationships={},
            )
            entity_infos.append(entity_information)

        # upload_entities(s2_id, arxiv_id, entity_infos, None)
        print("done.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        "Fetch and unpack sources for a single arXiv paper."
    )
    parser.add_argument(
        "arxiv_id",
        help="The arXiv ID for a paper. May include version number (i.e., 'v1', 'v2', etc.)",
    )
    parser.add_argument("s2_id", help="The S2 ID for the paper.")
    parser.add_argument(
        "--create-tables",
        action="store_true",
        help="Create tables in the database if they do not exist.",
    )
    parser.add_argument(
        "--debug-output-dir",
        help=(
            "Directory into which to put outputs for debugging (e.g., documents with symbol "
            + "positions visualized, JSON on symbol positions)."
        ),
    )
    parser.add_argument(
        "--schema", help="Name of schema into which to upload data.",
    )

    args = parser.parse_args()
    process(
        args.arxiv_id,
        args.s2_id,
        args.schema,
        args.create_tables,
        args.debug_output_dir,
    )
