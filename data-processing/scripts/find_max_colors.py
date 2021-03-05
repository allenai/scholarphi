import os
import os.path
import tempfile
from argparse import ArgumentParser
from typing import Optional, Tuple

import cv2
import numpy as np
from common.bounding_box import find_boxes_with_rgb
from common.colorize_tex import (
    COLOR_MACROS,
    COLOR_MACROS_BASE_MACROS,
    COLOR_MACROS_TEX_IMPORTS,
)
from common.commands.raster_pages import raster_pages
from common.compile import compile_tex


class ColorCouldNotBeFoundException(Exception):
    pass


class ColorConfusionException(Exception):
    pass


def colorize_and_detect_colors() -> None:
    with tempfile.TemporaryDirectory() as temp_dir:

        sources_dir = os.path.join(temp_dir, "sources")
        os.makedirs(sources_dir)
        rasters_dir = os.path.join(temp_dir, "rasters")
        os.makedirs(rasters_dir)

        # Prepare a TeX file where the letter 'o' is repeated, each time on a new line. A
        # different color is assigned to 'o' each time it is written.
        body = ""
        rgbs = []
        for red in range(162, 192):
            for green in range(245, 255):
                for blue in range(200, 205):
                    if red == green == blue == 255:
                        continue
                    colorized_o = (
                        rf"\textcolor[RGB]{{{red},{green},{blue}}}{{o}}" + "\n\n"
                    )
                    body += colorized_o
                    rgbs.append((red, green, blue))

        with open(os.path.join(sources_dir, "file.tex"), "w") as tex_file:
            tex = (
                COLOR_MACROS_BASE_MACROS
                + "\n"
                + COLOR_MACROS_TEX_IMPORTS
                + "\n"
                + COLOR_MACROS
                + "\n"
                + body
                + "\n"
                + r"\end"
            )
            tex_file.write(tex)

        # Compile the TeX and raster it to images.
        compile_tex(sources_dir)
        raster_pages(sources_dir, rasters_dir, "file.ps", "ps")

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
            # assert False, "also do the check on other parts of the RGB range"
            # assert False, "Then start extracting the bitmaps and saving them"
            image = cv2.imread(os.path.join(rasters_dir, image_name))
            return image

        current_image = get_next_image()
        next_image = get_next_image()

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
        description=(
            "Check the number of colors that can be distinguished from each other in "
            + "RGB space with our computer vision library."
        )
    )

    args = parser.parse_args()
    try:
        colorize_and_detect_colors()
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
        print(f"Successfully distinguished between all colors.")
        print()
