"""
Adapted from `https://github.com/allenai/deepequations2`
"""

import json
import logging
import os
import re
import sys
from functools import reduce
from typing import List, Union

import cv2
import numpy as np
from imageio import imread, imsave

from explanations.directories import (
    COLORIZED_PAPER_IMAGES_DIR,
    DIFF_PAPER_IMAGES_DIR,
    PAPER_IMAGES_DIR,
    get_colorized_pdf_path,
    get_original_pdf_path,
)
from explanations.image_processing import diff_image_lists, get_cv2_images, open_pdf
from explanations.types import (
    ColorizedEquations,
    LocalizedEquation,
    PdfBoundingBox,
    Rectangle,
)


def extract_bounding_boxes(
    arxiv_id: str,
    pdf_name: str,
    colorized_equations: ColorizedEquations,
    save_images=False,
) -> List[LocalizedEquation]:
    logging.debug("Getting bounding boxes for %s", pdf_name)

    original_pdf_path = get_original_pdf_path(arxiv_id, pdf_name)
    colorized_pdf_path = get_colorized_pdf_path(arxiv_id, pdf_name)
    original_images = get_cv2_images(original_pdf_path)
    colorized_images = get_cv2_images(colorized_pdf_path)

    # Colorized images is the first parameter: this means that original_images will be
    # subtracted from colorized_images where the two are the same. Necessary for preserving
    # colors from the colorized_images for identifying equations.
    image_diffs = diff_image_lists(colorized_images, original_images)

    if save_images:
        save_images_to_directory(original_images, PAPER_IMAGES_DIR)
        save_images_to_directory(colorized_images, COLORIZED_PAPER_IMAGES_DIR)
        save_images_to_directory(image_diffs, DIFF_PAPER_IMAGES_DIR)

    pdf = open_pdf(original_pdf_path)
    localized_equations = []
    for page_index, image_diff in enumerate(image_diffs):
        logging.debug("Finding bounding boxes in page %d", page_index)
        for hue, equation in colorized_equations.items():
            box = find_box_of_color(image_diff, hue)
            if box is not None:
                image_height, image_width, _ = image_diff.shape
                page = pdf[page_index]
                page_width = page.rect.width
                page_height = page.rect.height
                localized_equations.append(
                    LocalizedEquation(
                        tex=equation,
                        box=_to_pdf_coordinates(
                            box,
                            image_width,
                            image_height,
                            page_width,
                            page_height,
                            page_index,
                        ),
                    )
                )

    return localized_equations


def save_images_to_directory(images: List[np.array], dest_dir: str):
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
    for page_index, image in enumerate(images):
        image_path = os.path.join(dest_dir, "page-%d.png" % (page_index,))
        cv2.imwrite(image_path, image)


def find_box_of_color(
    image: np.array, hue: float, tolerance: float = 0.005
) -> Union[Rectangle, None]:
    """
    Assumes there is only one box of each color on the page.
    'hue' is a floating point number between 0 and 1. 'tolerance' is the amount of difference
    from 'hue' (from 0-to-1) still considered that hue.
    Returns 'None' if no pixels found for that hue.
    """
    CV2_MAXIMMUM_HUE = 180
    MOSTLY_SATURATED = 200  # out of 255

    cv2_hue = hue * CV2_MAXIMMUM_HUE
    cv2_tolerance = tolerance * CV2_MAXIMMUM_HUE
    img_hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    saturated_pixels = img_hsv[:, :, 1] > MOSTLY_SATURATED

    hues = img_hsv[:, :, 0]
    distance_to_hue = np.abs(hues.astype(np.int16) - cv2_hue)
    abs_distance_to_hue = np.minimum(
        distance_to_hue, CV2_MAXIMMUM_HUE - distance_to_hue
    )

    # To determine which pixels have a color, we look for those that:
    # 1. Match the hue
    # 2. Are heavily saturated (i.e. aren't white---white pixels could be detected as having
    #    any hue, with no saturation.)
    matching_pixels = np.where(
        (abs_distance_to_hue <= cv2_tolerance) & saturated_pixels
    )
    if len(matching_pixels[0]) == 0 or len(matching_pixels[1]) == 0:
        return None
    top = np.min(matching_pixels[0])
    bottom = np.max(matching_pixels[0])
    left = np.min(matching_pixels[1])
    right = np.max(matching_pixels[1])
    return Rectangle(
        left=left, top=top, width=(right - left + 1), height=(bottom - top + 1)
    )


def _to_pdf_coordinates(
    bounding_box: Rectangle,
    image_width: int,
    image_height: int,
    pdf_page_width: float,
    pdf_page_height: float,
    page: int,
) -> PdfBoundingBox:
    left = bounding_box.left
    top = bounding_box.top
    right = bounding_box.left + bounding_box.width
    bottom = bounding_box.top + bounding_box.height
    pdf_left = left * (pdf_page_width / image_width)
    pdf_right = right * (pdf_page_width / image_width)
    # Set PDF coordinates relative to the document bottom. Because image coordinates are relative
    # to the image's top, flip the y-coordinates.
    pdf_top = pdf_page_height - (top * (pdf_page_height / image_height))
    pdf_bottom = pdf_page_height - (bottom * (pdf_page_height / image_height))
    return PdfBoundingBox(
        left=pdf_left,
        top=pdf_top,
        width=pdf_right - pdf_left,
        height=pdf_top - pdf_bottom,
        page=page,
    )
