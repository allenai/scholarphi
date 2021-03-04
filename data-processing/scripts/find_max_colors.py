import os
import os.path
import tempfile
from argparse import ArgumentParser

import cv2
from common.bounding_box import find_boxes_with_color
from common.colorize_tex import (COLOR_MACROS, COLOR_MACROS_BASE_MACROS,
                                 COLOR_MACROS_TEX_IMPORTS, _get_tex_color,
                                 generate_hues)
from common.commands.raster_pages import raster_pages
from common.compile import compile_tex


class ColorCouldNotBeFoundException(Exception):
    pass


class ColorConfusionException(Exception):
    pass


def colorize_and_detect_colors(num_colors: int) -> None:
    with tempfile.TemporaryDirectory() as temp_dir:

        sources_dir = os.path.join(temp_dir, "sources")
        os.makedirs(sources_dir)
        rasters_dir = os.path.join(temp_dir, "rasters")
        os.makedirs(rasters_dir)

        # Prepare a TeX file where the letter 'o' is repeated, each time on a new line. A
        # different color is assigned to 'o' each time it is written.
        body = ""
        all_hues = []
        for hue in generate_hues(num_colors):
            red, green, blue = _get_tex_color(hue)
            colorized_o = rf"\textcolor[rgb]{{{red},{green},{blue}}}{{o}}" + "\n\n"
            body += colorized_o
            all_hues.append(hue)

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

        for hue in all_hues:
            hue_boxes = []
            for image_path in os.listdir(rasters_dir):
                img = cv2.imread(os.path.join(rasters_dir, image_path), -1)
                # Set tolerance for finding a color to slightly less than the amount of
                # interval between adjacent hues.
                tolerance = ((1.0 / num_colors) / 2) * 0.9
                hue_boxes.extend(find_boxes_with_color(img, hue, tolerance=tolerance))

            if len(hue_boxes) > 1:
                raise ColorConfusionException(
                    f"Expected to find only one bounding box for hue {hue}. Instead found "
                    + f"{len(hue_boxes)}."
                )

            if len(hue_boxes) == 0:
                raise ColorCouldNotBeFoundException()


if __name__ == "__main__":
    parser = ArgumentParser(
        description=(
            "Determine the number of colors that can be distinguished from each other in "
            + "our computer vision pipeline."
        )
    )
    parser.add_argument(
        "--start",
        type=int,
        default=30,
        help="Initial number of distinct colors to render.",
    )
    parser.add_argument(
        "--end",
        type=int,
        default=10000,
        help="Largest number of colors to attempt to detect simultaneously.",
    )
    parser.add_argument(
        "--step",
        type=int,
        default=100,
        help="Number of additional colors to render with each step.",
    )

    args = parser.parse_args()
    for color_count in range(args.start, args.end, args.step):
        print(f"Attempting to distinguish between {color_count} colors.")
        try:
            colorize_and_detect_colors(color_count)
        except ColorConfusionException as e:
            print(e)
            print(
                f"Could not distinguish between {color_count} colors. Some colors were "
                + "mistaken for other colors."
            )
            raise SystemExit
        except ColorCouldNotBeFoundException as e:
            print(e)
            print(
                f"Could not find all colors when coloring with {color_count} colors. This might "
                + "indicate an opportunity to improve the color detection code."
            )
            raise SystemExit
        else:
            print(f"Successfully distinguished between {color_count} colors.")
            print()
