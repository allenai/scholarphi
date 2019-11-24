import colorsys
import logging
from io import BytesIO
from typing import Dict, List

import cv2
import numpy as np
from PyPDF2 import PdfFileReader, PdfFileWriter
from reportlab.pdfgen.canvas import Canvas
from wand.image import Image

from explanations.types import AbsolutePath, Dimensions, PdfBoundingBoxAndHue


def get_cv2_images(pdf_path: AbsolutePath) -> List[np.ndarray]:
    """
    Get CV2 images for PDF, as a list with one image for each page.
    """
    page_images = []

    with open(pdf_path, "rb") as pdf_file:
        pdf = PdfFileReader(pdf_file)

        for page_index in range(pdf.getNumPages()):
            # TODO(andrewhead): handle rotated pages. This will likely require:
            # 1. Saving the rotation value for a page
            # 2. Once bounding boxes are found, applying an inverse rotation to them
            # The inverse rotation must be applied to the bounding boxes because annotations like the
            # bounding boxes are applied using positions relative to the rotated page.
            page = pdf.getPage(page_index)

            pdf_writer = PdfFileWriter()
            pdf_writer.addPage(page)
            bytes_io = BytesIO()
            pdf_writer.write(bytes_io)

            bytes_io.seek(0)
            image = Image(file=bytes_io)

            # Replace transparent background with white background.
            image.background_color = "white"
            image.alpha_channel = "remove"

            # When calling 'np.array(image)' on Ubuntu Bionic, the code sometimes gets a
            # segmentation fault. 'export_pixels' seems to not cause this fault.
            np_image = np.array(image.export_pixels(), dtype='uint8')
            np_image = np_image.reshape(
                (image.height, image.width, 4)  # pylint: disable=unsubscriptable-object
            )
            np_image = np.array(image)
            shape = np_image.shape
            np_image = np_image.reshape(
                (shape[1], shape[0], shape[2])  # pylint: disable=unsubscriptable-object
            )

            cv2_image = cv2.cvtColor(np_image, cv2.COLOR_RGBA2BGR)
            page_images.append(cv2_image)

    return page_images


def annotate_pdf(
    in_pdf_path: AbsolutePath,
    out_pdf_path: AbsolutePath,
    boxes: List[PdfBoundingBoxAndHue],
) -> None:
    logging.debug("Annotating PDF with bounding boxes.")

    writer = PdfFileWriter()
    with open(in_pdf_path, "rb") as in_pdf_file, open(
        out_pdf_path, "wb"
    ) as out_pdf_file:

        pdf = PdfFileReader(in_pdf_file)
        pdf_page_dimensions: Dict[int, Dimensions] = {}
        reader = PdfFileReader(in_pdf_file)
        for page_number in range(pdf.getNumPages()):
            page = pdf.getPage(page_number)
            width = page.mediaBox.getWidth()
            height = page.mediaBox.getHeight()
            pdf_page_dimensions[page_number] = Dimensions(width, height)

        for page_index in range(reader.getNumPages()):
            writer.addPage(reader.getPage(page_index))

        for box_and_hue in boxes:
            box = box_and_hue.box

            bytes_io = BytesIO()
            canvas = Canvas(
                bytes_io,
                pagesize=(
                    pdf_page_dimensions[box.page].width,
                    pdf_page_dimensions[box.page].height,
                ),
            )
            color = colorsys.hsv_to_rgb(box_and_hue.hue, 1, 1)
            canvas.setFillColorRGB(color[0], color[1], color[2], alpha=0.5)
            canvas.rect(
                box.left, box.top - box.height, box.width, box.height, fill=1, stroke=0
            )
            canvas.save()
            bytes_io.seek(0)
            canvas_reader = PdfFileReader(bytes_io)

            page = reader.getPage(box.page)
            page.mergePage(canvas_reader.getPage(0))

        writer.write(out_pdf_file)


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
    assert np.array_equal(np.shape(image0), np.shape(image1))
    diff = image0 - image1
    mask = np.any(diff != 0, axis=2)  # Check if any channel is different
    rgb_mask = np.transpose(np.tile(mask, (3, 1, 1)), axes=[1, 2, 0])
    diff_image = np.copy(image0)
    diff_image[np.logical_not(rgb_mask)] = 255
    return diff_image
