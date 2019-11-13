from typing import Dict, Iterable, Iterator, List, Optional

import cv2
import fitz
import numpy as np

from explanations.types import (BoundingBoxInfo, CharacterId,
                                CharacterLocations, PdfBoundingBox, Point,
                                RasterBoundingBox, Rectangle, Symbol, SymbolId)


def extract_bounding_boxes(
    diff_image: np.ndarray,
    pdf: fitz.Document,
    page_number: int,
    hue: float,
    masks: Optional[Iterable[Rectangle]] = None,
) -> List[BoundingBoxInfo]:
    """
    See 'PixelMerger' for description of how bounding boxes are extracted.
    """
    image_height, image_width, _ = diff_image.shape
    pdf_page = pdf[page_number]
    page_width = pdf_page.rect.width
    page_height = pdf_page.rect.height

    pixel_boxes = list(find_boxes_with_color(diff_image, hue, masks=masks))
    box_infos = []
    for box in pixel_boxes:
        pdf_bounding_box = _to_pdf_coordinates(
            box, image_width, image_height, page_width, page_height, page_number
        )
        raster_bounding_box = RasterBoundingBox(
            box.left, box.top, box.width, box.height, page_number
        )
        box_infos.append(BoundingBoxInfo(pdf_bounding_box, raster_bounding_box))

    return box_infos


def find_boxes_with_color(
    image: np.ndarray,
    hue: float,
    tolerance: float = 0.005,
    masks: Optional[Iterable[Rectangle]] = None,
) -> List[Rectangle]:
    """
    Arguments:
    - 'hue': is a floating point number between 0 and 1
    - 'tolerance': is the amount of difference from 'hue' (from 0-to-1) still considered that hue.
    - 'masks': a set of masks to apply to the image, one at a time. Bounding boxes are extracted
        from within each of those boxes. Masks are assumed to be non-intersecting.
    """

    if masks is None:
        height, width, _ = image.shape
        masks = (Rectangle(left=0, top=0, width=width, height=height),)

    CV2_MAXIMMUM_HUE = 180
    SATURATION_THRESHOLD = 50  # out of 255

    cv2_hue = hue * CV2_MAXIMMUM_HUE
    cv2_tolerance = tolerance * CV2_MAXIMMUM_HUE
    img_hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    saturated_pixels = img_hsv[:, :, 1] > SATURATION_THRESHOLD

    hues = img_hsv[:, :, 0]
    distance_to_hue = np.abs(hues.astype(np.int16) - cv2_hue)
    abs_distance_to_hue = np.minimum(
        distance_to_hue, CV2_MAXIMMUM_HUE - distance_to_hue
    )

    boxes = []
    for mask in masks:

        masked_distances = np.full(abs_distance_to_hue.shape, np.inf)

        right = mask.left + mask.width
        bottom = mask.top + mask.height
        masked_distances[mask.top : bottom, mask.left : right] = abs_distance_to_hue[
            mask.top : bottom, mask.left : right
        ]

        # To determine which pixels have a color, we look for those that:
        # 1. Match the hue
        # 2. Are heavily saturated (i.e. aren't white---white pixels could be detected as having
        #    any hue, with no saturation.)
        matching_pixels = np.where(
            (masked_distances <= cv2_tolerance) & saturated_pixels
        )

        matching_pixels_list: List[Point] = []
        for i in range(len(matching_pixels[0])):
            matching_pixels_list.append(
                Point(matching_pixels[1][i], matching_pixels[0][i])
            )
        boxes.extend(list(PixelMerger().merge_pixels(matching_pixels_list)))

    return boxes


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


def get_symbol_bounding_box(
    symbol: Symbol, symbol_id: SymbolId, character_boxes: CharacterLocations
) -> Optional[PdfBoundingBox]:
    boxes = []
    for character_index in symbol.characters:
        character_id = CharacterId(
            symbol_id.tex_path, symbol_id.equation_index, character_index
        )
        boxes.extend(character_boxes.get(character_id, []))

    if len(boxes) == 0:
        return None

    # Boxes for a symbol should be on only one page.
    assert len(set([box.page for box in boxes])) == 1

    left = min([box.left for box in boxes])
    right = max([box.left + box.width for box in boxes])
    top = min([box.top for box in boxes])
    bottom = max([box.top + box.height for box in boxes])
    page = boxes[0].page

    return PdfBoundingBox(left, top, right - left, bottom - top, page)
