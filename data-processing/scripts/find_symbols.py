import os
import os.path
import shutil
import tempfile
from argparse import ArgumentParser
from typing import Iterator, List, Optional, Tuple

import cv2
import numpy as np
from common.bounding_box import find_boxes_with_rgb
from common.colorize_tex import (
    COLOR_MACROS,
    COLOR_MACROS_BASE_MACROS,
    COLOR_MACROS_LATEX_IMPORTS,
    COLOR_MACROS_TEX_IMPORTS,
    add_color_macros,
)
from common.commands.raster_pages import raster_pages
from common.compile import compile_tex
from common.scan_tex import Pattern, scan_tex
from common.types import Entity, Path, RelativePath


class ColorCouldNotBeFoundException(Exception):
    pass


class ColorConfusionException(Exception):
    pass


class UnexpectedTexFormatException(Exception):
    pass


class EndDocumentExtractor:
    def parse(self, tex: str) -> Optional[Entity]:
        pattern = Pattern("begin_document", r"\\end{document}")
        scanner = scan_tex(tex, [pattern], include_unmatched=False)
        try:
            match = next(scanner)
            return Entity(match.start, match.end)
        except StopIteration:
            return None


def _get_color(
    skip: Optional[List[Tuple[int, int, int]]] = None
) -> Iterator[Tuple[int, int, int]]:
    """
    This function is cyclical: it loops back to the initial colors when it is has reached the end
    of the unique colors. This will be after millions of unique colors have been produced.
    Skip black and white colors by default.
    """
    skip = skip or [(0, 0, 0), (255, 255, 255)]
    while True:
        for red in range(0, 255):
            for green in range(0, 255):
                for blue in range(0, 255):
                    if (red, green, blue) in skip:
                        continue
                    yield red, green, blue


def _does_page_contain_start_marker(image: np.array) -> bool:
    num_pixels = image.shape[0] * image.shape[1]
    num_blue_pixels = len(
        np.where(
            (image[:, :, 0] == 80) & (image[:, :, 1] == 165) & (image[:, :, 2] == 250)
        )[0]
    )
    return num_blue_pixels / float(num_pixels) > 0.5


def detect_symbols(
    original_sources_dir: Path, main_file_path: RelativePath, symbols_file_path: Path
) -> None:

    # Read TeX for symbols from auxiliary file.
    symbol_texs = []
    with open(symbols_file_path) as symbols_file:
        for line in symbols_file:
            symbol_texs.append(line.strip())

    with tempfile.TemporaryDirectory() as temp_dir:

        sources_dir = os.path.join(temp_dir, "sources")
        shutil.copytree(original_sources_dir, sources_dir)

        rasters_dir = os.path.join(temp_dir, "rasters")
        os.makedirs(rasters_dir)

        # Prepare a TeX file where the letter 'o' is repeated, each time on a new line. A
        # different color is assigned to 'o' each time it is written.
        body = ""
        rgbs = []
        color_generator = _get_color()
        for symbol in symbol_texs:
            red, green, blue = next(color_generator)
            colorized_symbol = (
                rf"\textcolor[RGB]{{{red},{green},{blue}}}{{${symbol}$}}" + "\n\n"
            )
            body += colorized_symbol
            rgbs.append((red, green, blue))

        tex_path = os.path.join(sources_dir, main_file_path)
        with open(tex_path) as tex_file:
            tex = tex_file.read()

        tex_with_macros = add_color_macros(tex)

        end_document_extractor = EndDocumentExtractor()
        end_document_command = end_document_extractor.parse(tex_with_macros)
        if not end_document_command:
            raise UnexpectedTexFormatException(
                fr"Could not find \\end{{document}} tag in TeX file {main_file_path}."
                + "Is this a LaTeX document (rather than a plain TeX document)?"
            )

        insertion_offset = end_document_command.start
        tex_with_symbols = (
            tex_with_macros[:insertion_offset]
            + "\n\n"
            + (r"\scholaradvancepage{}" + "\n")
            + (r"\scholarfillandadvancepage{}" + "\n")
            + "\n"
            + body
            + "\n\n"
            + (r"\scholaradvancepage{}" + "\n")
            + (r"\scholaradvancepage{}" + "\n")
            + "\n\n"
            + tex_with_macros[insertion_offset:]
        )

        with open(tex_path, "w") as tex_file:
            tex_file.write(tex_with_symbols)

        # Compile the TeX and raster it to images.
        compilation_result = compile_tex(sources_dir)
        output = compilation_result.output_files[0]
        output_type = output.output_type
        output_path = output.path
        raster_pages(sources_dir, rasters_dir, output_path, output_type)

        # Images should be read in order, because the loop below uses knowledge of the order
        # the colors are supposed to be ordered in to only scan a subset of images to look
        # for each color.
        get_page_no = lambda s: int(s.split(".")[0][5:])
        all_image_names = sorted(os.listdir(rasters_dir), key=get_page_no)
        if not all_image_names:
            raise ColorCouldNotBeFoundException()

        def get_next_image() -> Optional[np.array]:
            if not all_image_names:
                return None
            image_name = all_image_names.pop(0)
            image = cv2.imread(os.path.join(rasters_dir, image_name))
            return image

        current_image = get_next_image()
        next_image = get_next_image()

        # Advance until a marker is found suggesting that the custom colorized symbols
        # will appear on the next page.
        while True:
            if not _does_page_contain_start_marker(current_image):
                current_image = next_image
                next_image = get_next_image()
                continue

            # Start detection on the page after the marker.
            current_image = next_image
            next_image = get_next_image()
            break

        while rgbs:
            red, green, blue = rgbs.pop(0)
            boxes = find_boxes_with_rgb(current_image, red, green, blue)

            if next_image is not None:
                if not boxes:
                    boxes = find_boxes_with_rgb(next_image, red, green, blue)
                    if not boxes:
                        raise ColorCouldNotBeFoundException()
                    current_image = next_image
                    next_image = get_next_image()
                else:
                    boxes.extend(find_boxes_with_rgb(next_image, red, green, blue))
                    if len(boxes) > 1:
                        raise ColorConfusionException(
                            f"Expected to find only one bounding box for color "
                            f"(R{red}, G{green}, B{blue}). Instead found "
                            + f"{len(boxes)}."
                        )

            if not boxes:
                raise ColorCouldNotBeFoundException()

            print(f"Success! R{red}, G{green}, B{blue}")


if __name__ == "__main__":
    parser = ArgumentParser(
        description=("Automatically discover the positions of symbols.")
    )
    parser.add_argument(
        "--sources-dir",
        required=True,
        help=(
            "Directory containing sources for the LaTeX project. Assumes this project is "
            + "written in LaTeX, and not just plain TeX."
        ),
    )
    parser.add_argument(
        "--main-file",
        required=True,
        help="Path to main file within the sources directory.",
    )
    parser.add_argument(
        "--symbols-file",
        required=True,
        help="File where each line contains the TeX for one symbol.",
    )

    args = parser.parse_args()
    try:
        detect_symbols(args.sources_dir, args.main_file, args.symbols_file)
    except ColorConfusionException as e:
        print(e)
        print(
            f"Could not distinguish between  colors. Some colors were "
            + "mistaken for other colors."
        )
        raise SystemExit
    except ColorCouldNotBeFoundException as e:
        print(e)
        print(
            f"Could not find all colors when coloring with colors. This might "
            + "indicate an opportunity to improve the color detection code."
        )
        raise SystemExit
    else:
        print(f"Successfully extracted symbol positions.")
        print()
