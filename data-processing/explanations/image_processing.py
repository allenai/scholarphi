import colorsys
import logging
from typing import List

import cv2
import fitz
import numpy as np
from PIL import Image

from explanations.types import PdfBoundingBoxAndHue


def get_cv2_images(pdf: fitz.Document) -> List[np.ndarray]:
    """
    Get CV2 images for PDF, as a list with one image for each page.
    """
    page_images = []
    for page in pdf:
        # TODO(andrewhead): handle rotated pages. This will likely require:
        # 1. Saving the rotation value for a page
        # 2. Once bounding boxes are found, applying an inverse rotation to them
        # The inverse rotation must be applied to the bounding boxes because annotations like the
        # bounding boxes are applied using positions relative to the rotated page.
        assert page.rotation == 0
        pixmap = page.getPixmap()
        image = Image.frombuffer(
            "RGB", [pixmap.w, pixmap.h], pixmap.samples, "raw", "RGB", 0, 1
        )
        np_image = np.asarray(image)
        cv2_image = cv2.cvtColor(np_image, cv2.COLOR_RGB2BGR)
        page_images.append(cv2_image)
    return page_images


def annotate_pdf(
    pdf: fitz.Document, boxes: List[PdfBoundingBoxAndHue]
) -> fitz.Document:
    """
    Annotate the 'pdf' object passed in. Caller is responsible for saving this file to disk.
    """
    logging.debug("Annotating PDF with bounding boxes.")
    for box_and_hue in boxes:
        box = box_and_hue.box
        page: fitz.Page = pdf[box.page]
        # For many PDFs with the pyMuPDF toolkit, coordinates of annotations are relative to the
        # top-left of the page, though in some cases it's relative to the bottom-left. In those
        # cases, flip the coordinate system using this fix:
        # https://github.com/pymupdf/PyMuPDF/issues/367#issuecomment-534756345
        if (
            hasattr(page, "_isWrapped")
            and not page._isWrapped  # pylint: disable=protected-access
            and hasattr(page, "_wrapContents")
        ):
            page._wrapContents()  # pylint: disable=protected-access
        # The PDF bounding boxes are relative to the bottom-left of the the page. Flip them to
        # be relative to the top-left before drawing them (see comment above).
        top = page.rect.height - box.top
        bottom = top + box.height
        rect = (box.left, top, box.left + box.width, bottom)
        color = colorsys.hsv_to_rgb(box_and_hue.hue, 1, 1)
        page.drawRect(rect, color=color, fill=None)
    return pdf


def diff_image_lists(
    image_list_0: List[np.ndarray], image_list_1: List[np.ndarray]
) -> List[np.ndarray]:
    """
    Difference two lists of CV2 images, with pairwise comparisons at each index.
    """
    assert len(image_list_0) == len(image_list_1)
    diffs = []
    for i in range(0, len(image_list_0)):  # pylint: disable=consider-using-enumerate
        diff = diff_images(image_list_0[i], image_list_1[i])
        diffs.append(diff)
    return diffs


def diff_images(image0: np.ndarray, image1: np.ndarray) -> np.ndarray:
    """Returns a copy of 'image0' with all pixels where 'image0' and 'image1' are equal set to white."""
    logging.debug("Diffing images.")
    assert np.array_equal(np.shape(image0), np.shape(image1))
    diff = image0 - image1
    mask = np.any(diff != 0, axis=2)  # Check if any channel is different
    rgb_mask = np.transpose(np.tile(mask, (3, 1, 1)), axes=[1, 2, 0])
    diff_image = np.copy(image0)
    diff_image[np.logical_not(rgb_mask)] = 255
    return diff_image
