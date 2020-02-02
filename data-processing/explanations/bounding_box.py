import logging
from typing import (Callable, Dict, FrozenSet, Iterable, Iterator, List,
                    Optional, Tuple)

import cv2
import numpy as np

from explanations.types import (BoundingBoxInfo, CharacterId,
                                CharacterLocations, Dimensions)
from explanations.types import FloatRectangle as Rectangle
from explanations.types import (PdfBoundingBox, Point, RasterBoundingBox,
                                Symbol, SymbolId)


def extract_bounding_boxes(
    diff_image: np.ndarray,
    pdf_page_dimensions: Dimensions,
    page_number: int,
    hue: float,
    masks: Optional[Iterable[Rectangle]] = None,
) -> List[BoundingBoxInfo]:
    """
    See 'PixelMerger' for description of how bounding boxes are extracted.
    """
    image_height, image_width, _ = diff_image.shape
    page_width = pdf_page_dimensions.width
    page_height = pdf_page_dimensions.height

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
    if len({box.page for box in boxes}) > 1:
        logging.warning(  # pylint: disable=logging-not-lazy
            (
                "Boxes found on more than one page for symbol %s. "
                + "Only the boxes for one page will be considered."
            ),
            symbol,
        )

    page = boxes[0].page
    boxes_on_page = list(filter(lambda b: b.page == page, boxes))

    left = min([box.left for box in boxes_on_page])
    right = max([box.left + box.width for box in boxes_on_page])
    top = max([box.top for box in boxes_on_page])
    bottom = min([box.top - box.height for box in boxes_on_page])

    return PdfBoundingBox(left, top, right - left, top - bottom, page)



def subtract(rect1: Rectangle, rect2: Rectangle) -> Iterator[Rectangle]:
    """
    Get a collection of rectangles that make up the difference between 'rect1' and 'rect2'.
    The returned rectangles will have the dimensions of rectangles called "split[1..4]" below.
    Note that the number of rectangles returned will depend on how rect1 and rect2 overlap.

    rect1
    ----------------------------------------------
    |                                            |
    |                                   (split 1)|
    |············· -----------------·············|
    |              | rect2         |             |
    |     (split 2)|               |    (split 3)|
    |··············-----------------·············|
    |                                   (split 4)|
    ----------------------------------------------
    """

    rect1_right = rect1.left + rect1.width
    rect1_bottom = rect1.top - rect1.height
    rect2_right = rect2.left + rect2.width
    rect2_bottom = rect2.top - rect2.height

    if not are_intersecting(rect1, rect2):
        yield Rectangle(rect1.left, rect1.top, rect1.width, rect1.height)
        return

    # Create 'split 1'
    if rect2.top <= rect1.top and rect2.top >= rect1_bottom:
        height = rect1.top - rect2.top
        if height > 0:
            yield Rectangle(rect1.left, rect1.top, rect1.width, height)

    # Create 'split 2'
    if rect2.left >= rect1.left and rect2.left <= rect1_right:
        diff_top = min(rect1.top, rect2.top)
        diff_bottom = max(rect1_bottom, rect2_bottom)
        width = rect2.left - rect1.left
        height = diff_top - diff_bottom
        if width > 0 and height > 0:
            yield Rectangle(rect1.left, diff_top, width, height)

    # Create 'split 3'
    if rect2_right <= rect1_right and rect2_right >= rect1.left:
        diff_top = min(rect1.top, rect2.top)
        diff_bottom = max(rect1_bottom, rect2_bottom)
        width = rect1_right - rect2_right
        height = diff_top - diff_bottom
        if width > 0 and height > 0:
            yield Rectangle(rect2_right, diff_top, width, height)

    # Create 'split 4'
    if rect2_bottom >= rect1_bottom and rect2_bottom <= rect1.top:
        height = rect2_bottom - rect1_bottom
        if height > 0:
            yield Rectangle(rect1.left, rect2_bottom, rect1.width, height)



def are_intersecting(rect1: Rectangle, rect2: Rectangle) -> bool:

    between: Callable[[float, float, float], float] = lambda x, x1, x2: x1 <= x <= x2

    horizontal_range_overlap = any(
        [
            between(rect1.left, rect2.left, rect2.left + rect2.width),
            between(rect1.left + rect1.width, rect2.left, rect2.left + rect2.width),
            between(rect2.left, rect1.left, rect1.left + rect1.width),
            between(rect2.left + rect2.width, rect1.left, rect1.left + rect1.width),
        ]
    )
    vertical_range_overlap = any(
        [
            between(rect1.top, rect2.top - rect2.height, rect2.top),
            between(rect1.top - rect1.height, rect2.top - rect2.height, rect2.top),
            between(rect2.top, rect1.top - rect1.height, rect1.top),
            between(rect2.top - rect2.height, rect1.top - rect1.height, rect1.top),
        ]
    )

    return horizontal_range_overlap and vertical_range_overlap



def subtract_from_multiple(
    rects: Iterable[Rectangle], other: Rectangle
) -> Iterator[Rectangle]:
    """
    Assumes all rectangles in 'rects' are mutually exclusive.
    """
    for rect in rects:
        for diff_rect in subtract(rect, other):
            yield diff_rect


def subtract_multiple(
    rect: Rectangle, other_rects: Iterable[Rectangle]
) -> Iterator[Rectangle]:

    difference = [rect]
    for other_rect in other_rects:
        difference = list(subtract_from_multiple(difference, other_rect))

    for diff_rect in difference:
        yield diff_rect


def subtract_multiple_from_multiple(
    rects: Iterable[Rectangle], other_rects: Iterable[Rectangle]
) -> Iterator[Rectangle]:

    rects_unioned = union(rects)
    for rect in rects_unioned:
        for diff_rect in subtract_multiple(rect, other_rects):
            yield diff_rect


def union(rects: Iterable[Rectangle]) -> Iterator[Rectangle]:
    """
    In case the exact rectangles returned are important to you, the union is computed by taking the
    difference of rectangles later in the iterable from rectangles that were earlier in the
    iterable using the 'subtract' methods, and adding the differences to the union.
    """

    rects = iter(rects)
    try:
        first_rect = next(rects)
        yield first_rect
        union_rects = [first_rect]
    except StopIteration:
        return

    while True:
        try:
            rect = next(rects)
        except StopIteration:
            return

        for new_rect in subtract_multiple(rect, union_rects):
            yield new_rect
            union_rects = union_rects + [new_rect]


def intersect(
    rects: Iterable[Rectangle], other_rects: Iterable[Rectangle]
) -> Iterator[Rectangle]:
    """
    In case the exact rectangles returned are important to you, the intersection is computed by
    first computing the union of all rectangles, then subtracting the difference between 'rects'
    and 'other_rects', and then subtracting the difference between 'other_rects' and 'rects'.
    """

    rects = list(rects)
    other_rects = list(other_rects)
    diff1 = list(subtract_multiple_from_multiple(rects, other_rects))
    diff2 = list(subtract_multiple_from_multiple(  # pylint: disable=arguments-out-of-order
        other_rects, rects
    ))
    union_rects = union(rects + other_rects)

    union_minus_diff1 = subtract_multiple_from_multiple(union_rects, diff1)
    union_minus_diffs = subtract_multiple_from_multiple(union_minus_diff1, diff2)
    for rect in union_minus_diffs:
        yield rect


def sum_areas(rects: Iterable[Rectangle]) -> float:
    """
    Assumes rectangles do not overlap with each other.
    """
    total_area = 0.
    for rect in rects:
        total_area += (rect.width * rect.height)
    return total_area


def iou(rects: Iterable[Rectangle], other_rects: Iterable[Rectangle]) -> float:
    """
    Compute the intersection-over-union between two sets of rectangles. Rectangles within
    each iterable *can* overlap with each other.
    """
    rects = list(rects)
    other_rects = list(other_rects)

    intersection_rects = intersect(rects, other_rects)
    intersection_area = sum_areas(intersection_rects)

    union_rects = union(rects + other_rects)
    union_area = sum_areas(union_rects)

    return intersection_area / union_area


def iou_per_rectangle(
    rects: Iterable[FrozenSet[Rectangle]], other_rects: Iterable[Rectangle]
) -> Dict[FrozenSet[Rectangle], float]:
    """
    Compute the intersection between each rectangle in 'rects' and all rectangles that overlap
    with it in 'other_rects'.
    """
    other_rects = list(other_rects)
    ious: Dict[FrozenSet[Rectangle], float] = {}

    for rect_set in rects:

        def filter_fn(other_rect: Rectangle, rs: FrozenSet[Rectangle] = rect_set) -> bool:
            return any([are_intersecting(r, other_rect) for r in rs])

        overlapping_rects = filter(filter_fn, other_rects)
        rect_iou = iou(rect_set, overlapping_rects)
        logging.debug("Detection summary: %s, %s, %f", rect_set, list(filter(filter_fn, other_rects)), rect_iou)
        ious[rect_set] = rect_iou

    return ious


def compute_accuracy(
    actual: Iterable[FrozenSet[Rectangle]], expected: Iterable[Rectangle], minimum_iou: float = 0.5
) -> Tuple[float, float]:

    expected = list(expected)
    actual = list(actual)
    ious = iou_per_rectangle(actual, expected)

    count_found = len(list(filter(lambda i: i >= minimum_iou, ious.values())))
    precision = float(count_found) / len(actual)
    recall = float(count_found) / len(expected)

    return (precision, recall)
