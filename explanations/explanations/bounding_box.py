from typing import Dict, Iterator, List, Optional

import cv2
import fitz
import numpy as np

from explanations.types import PdfBoundingBox, Point, Rectangle


def extract_bounding_boxes(
    diff_image: np.ndarray, page_number: int, hues: List[float], pdf: fitz.Document
) -> Dict[float, List[PdfBoundingBox]]:
    """
    See 'PixelMerger' for description of how bounding boxes are extracted.
    """
    image_height, image_width, _ = diff_image.shape
    pdf_page = pdf[page_number]
    page_width = pdf_page.rect.width
    page_height = pdf_page.rect.height

    boxes_by_hue = {}

    for hue in hues:
        pixel_boxes = list(find_boxes_of_color(diff_image, hue))
        pdf_bounding_boxes = [
            _to_pdf_coordinates(
                box, image_width, image_height, page_width, page_height, page_number
            )
            for box in pixel_boxes
        ]
        boxes_by_hue[hue] = pdf_bounding_boxes

    return boxes_by_hue


def find_boxes_of_color(
    image: np.ndarray, hue: float, tolerance: float = 0.005
) -> List[Rectangle]:
    """
    'hue' is a floating point number between 0 and 1. 'tolerance' is the amount of difference
    from 'hue' (from 0-to-1) still considered that hue.
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
    matching_pixels_list: List[Point] = []
    for i in range(len(matching_pixels[0])):
        matching_pixels_list.append(Point(matching_pixels[1][i], matching_pixels[0][i]))
    return list(PixelMerger().merge_pixels(matching_pixels_list))


class PixelMerger:
    """
    Merges pixels into bounding boxes. The algorithm was designed to create one bounding box per
    line of text in a PDF. To do this, the algorithm combines all pixels at the same y-position
    into lines. Then it merges vertically-adjacent lines into boxes.
    """

    def __init__(self, max_vertical_break: int = 1) -> None:
        self.last_row: Optional[int] = None
        self.top_y: Optional[int] = None
        self.bottom_y: Optional[int] = None
        self.min_x: Optional[int] = None
        self.max_x: Optional[int] = None
        self.max_vertical_break = max_vertical_break

    def merge_pixels(self, points: List[Point]) -> Iterator[Rectangle]:
        self._reset_merge_state()

        pixels_by_row = self._group_pixels_by_row(points)
        ordered_rows = sorted(pixels_by_row.keys())

        for row in ordered_rows:
            row_pixels = pixels_by_row[row]

            # At a vertical gap, create a rectangle from the rows seen above.
            if self.last_row is not None and (
                (row - self.last_row) > self.max_vertical_break
            ):
                yield self._create_rectangle()
                self._reset_merge_state()

            if self.last_row is None:
                self.top_y = row

            self._update_x_range(row_pixels)
            self.bottom_y = row
            self.last_row = row

        if self.top_y is not None:
            yield self._create_rectangle()

    def _create_rectangle(self) -> Rectangle:
        assert self.min_x is not None
        assert self.max_x is not None
        assert self.top_y is not None
        assert self.bottom_y is not None
        return Rectangle(
            left=self.min_x,
            top=self.top_y,
            width=self.max_x - self.min_x + 1,
            height=self.bottom_y - self.top_y + 1,
        )

    def _update_x_range(self, points: List[Point]) -> None:
        x_values = [p.x for p in points]
        if self.min_x is not None:
            x_values.append(self.min_x)
        if self.max_x is not None:
            x_values.append(self.max_x)

        self.min_x = min(x_values)
        self.max_x = max(x_values)

    def _reset_merge_state(self) -> None:
        self.last_row = None
        self.top_y = None
        self.bottom_y = None
        self.min_x = None
        self.max_x = None

    def _group_pixels_by_row(self, points: List[Point]) -> Dict[int, List[Point]]:
        pixels_by_row: Dict[int, List[Point]] = {}
        for point in points:
            if not point.y in pixels_by_row:
                pixels_by_row[point.y] = []
            pixels_by_row[point.y].append(point)
        return pixels_by_row


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
