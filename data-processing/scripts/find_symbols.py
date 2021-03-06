import os
import os.path
import random
import shutil
import tempfile
from argparse import ArgumentParser
from typing import Dict, Iterator, List, Optional, Tuple

import cv2
import numpy as np
import requests
from common.bounding_box import find_boxes_with_rgb
from common.colorize_tex import add_color_macros
from common.commands.raster_pages import raster_pages
from common.compile import compile_tex
from common.scan_tex import Pattern, scan_tex
from common.types import (ArxivId, BoundingBox, Entity, Path, Rectangle,
                          RelativePath)


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


SymbolId = str
PageNumber = int


def detect_symbols(
    arxiv_id: ArxivId,
    original_sources_dir: Path,
    main_file_path: RelativePath,
    symbols_file_path: Path,
) -> None:

    # Read TeX for symbols from auxiliary file.
    symbol_texs = []
    with open(symbols_file_path) as symbols_file:
        for line in symbols_file:
            symbol_texs.append(line.strip())

    with tempfile.TemporaryDirectory() as temp_dir:

        sources_dir = os.path.join(temp_dir, "modified-sources")
        shutil.copytree(original_sources_dir, sources_dir)

        rasters_dir = os.path.join(temp_dir, "modified-rasters")
        os.makedirs(rasters_dir)

        templates_dir = os.path.join(temp_dir, "templates")
        os.makedirs(templates_dir)

        # Prepare a TeX file where the letter 'o' is repeated, each time on a new line. A
        # different color is assigned to 'o' each time it is written.
        body = ""
        rgbs: List[Tuple[SymbolId, Tuple[int, int, int]]] = []
        color_generator = _get_color()
        for i, symbol in enumerate(symbol_texs):
            red, green, blue = next(color_generator)
            colorized_symbol = (
                rf"\textcolor[RGB]{{{red},{green},{blue}}}{{${symbol}$}}" + "\n\n"
            )
            body += colorized_symbol
            rgbs.append((str(i), (red, green, blue)))

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

        for (symbol_id, (red, green, blue)) in rgbs:
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

            box = boxes[0]
            print(f"Found symbol R{red}, G{green}, B{blue} at {box}.")

            symbol_templates_dir = os.path.join(templates_dir, symbol_id)
            os.makedirs(symbol_templates_dir)
            template_index = 0
            while True:
                template_path = os.path.join(
                    symbol_templates_dir, f"template-{template_index}.png"
                )
                if os.path.exists(template_path):
                    template_index += 1
                    continue

                template = current_image[
                    box.top : box.top + box.height, box.left : box.left + box.width
                ]
                # Convert all non-white pixels in a template to black.
                template[
                    np.where(
                        (template[:, :, 0] != 255)
                        | (template[:, :, 1] != 255)
                        | (template[:, :, 2] != 255)
                    )
                ] = [0, 0, 0]
                cv2.imwrite(template_path, template)
                print(f"Saved template to {template_path}.")
                break

        print("Extracted templates for all symbols.")

        # Fetch original PDF on which to do visual detection of symbols.
        pdf_name = f"{arxiv_id}.pdf"
        with open(os.path.join(temp_dir, pdf_name), mode="wb") as pdf_file:
            result = requests.get(f"https://arxiv.org/pdf/{arxiv_id}.pdf")
            pdf_file.write(result.content)

        # Render original PDF to images and load those images into memory.
        # Load pages as black-and-white; symbol detection should not depend on color.
        pdf_rasters_dir = os.path.join(temp_dir, "pdf-rasters")
        os.makedirs(pdf_rasters_dir)
        raster_pages(temp_dir, pdf_rasters_dir, pdf_name, "pdf")

        original_pages: Dict[int, np.array] = {}
        annotated_pages: Dict[int, np.array] = {}

        for image_name in os.listdir(pdf_rasters_dir):
            page_no = int(image_name.split(".")[0][5:])
            image = cv2.imread(os.path.join(pdf_rasters_dir, image_name))
            image_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            # All pixels that are not exactly white are made black.
            # TODO(andrewhead): check this little bit of code for appropriate threshold values.
            (_, image_black_and_white) = cv2.threshold(
                image_gray, 254, 255, cv2.THRESH_BINARY
            )
            original_pages[page_no] = image_black_and_white
            annotated_pages[page_no] = image

        annotated_rasters_dir = os.path.join(temp_dir, "annotated-rasters")
        os.makedirs(annotated_rasters_dir)

        # Search for each symbol in the PDF using template matching on the rastered images.
        # At the same time, annotate each page with boxes showing the detected locations of
        # each symbol.
        for (symbol_id, _) in rgbs:
            symbol_templates_dir = os.path.join(templates_dir, symbol_id)
            templates: List[np.array] = []
            for template_path in os.listdir(symbol_templates_dir):
                image = cv2.imread(os.path.join(symbol_templates_dir, template_path))
                image_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                templates.append(image_gray)

            # Use a consistent (yet randomly-chosen) color for each symbol detected.
            symbol_annotation_color = (
                random.randint(0, 256),
                random.randint(0, 256),
                random.randint(0, 256),
            )
            symbol_locations: List[Tuple[PageNumber, Rectangle]] = []
            for page_no, page_image in original_pages.items():
                for template in templates:
                    MATCH_THRESHOLD = 0.95
                    MATCH_METHOD = cv2.TM_CCOEFF_NORMED
                    match_result = cv2.matchTemplate(page_image, template, MATCH_METHOD)
                    match_locations = np.where(match_result > MATCH_THRESHOLD)

                    template_width, template_height = template.shape[::-1]
                    for loc in zip(*match_locations[::-1]):
                        symbol_locations.append(
                            (
                                page_no,
                                Rectangle(
                                    left=loc[0],
                                    top=loc[1],
                                    width=template_width,
                                    height=template_height,
                                ),
                            )
                        )

                        cv2.rectangle(
                            annotated_pages[page_no],
                            loc,
                            (loc[0] + template_width, loc[1] + template_height),
                            symbol_annotation_color,
                            1,
                        )

        # Save annotated rasters to file for debugging.
        for page_no, image in annotated_pages.items():
            image_path = os.path.join(annotated_rasters_dir, f"page-{page_no}.png")
            cv2.imwrite(image_path, image)

        pass


if __name__ == "__main__":
    parser = ArgumentParser(
        description=("Automatically discover the positions of symbols.")
    )
    parser.add_argument(
        "--arxiv-id",
        required=True,
        help=("arXiv ID of the paper in which symbols are being detected."),
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
        detect_symbols(
            args.arxiv_id, args.sources_dir, args.main_file, args.symbols_file
        )
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
