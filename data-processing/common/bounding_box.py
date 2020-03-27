import logging
from typing import (Callable, Dict, FrozenSet, Iterable, Iterator, List,
                    Optional, Set, Tuple)

import cv2
import numpy as np

from common.types import (BoundingBox, FloatRectangle, Point, Rectangle,
                          Symbol, SymbolId, TokenId, TokenLocations)


def extract_bounding_boxes(
    diff_image: np.ndarray,
    page_number: int,
    hue: float,
    masks: Optional[Iterable[FloatRectangle]] = None,
) -> List[BoundingBox]:
    """
    See 'PixelMerger' for description of how bounding boxes are extracted.
    Masks are assumed to be non-intersecting. Masks should be expressed as ratios relative to the
    page's width and height instead of pixel values---left, top, width, and height all have values
    in the range 0..1).
    """
    image_height, image_width, _ = diff_image.shape
    pixel_masks = None
    if masks is not None:
        pixel_masks = [
            Rectangle(
                left=round(m.left * image_width),
                top=round(m.top * image_height),
                width=round(m.width * image_width),
                height=round(m.height * image_height),
            )
            for m in masks
        ]

    pixel_boxes = list(find_boxes_with_color(diff_image, hue, masks=pixel_masks))
    boxes = []
    for box in pixel_boxes:
        left_ratio = float(box.left) / image_width
        top_ratio = float(box.top) / image_height
        width_ratio = float(box.width) / image_width
        height_ratio = float(box.height) / image_height
        boxes.append(
            BoundingBox(left_ratio, top_ratio, width_ratio, height_ratio, page_number)
        )

    return boxes


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
        from within each of those boxes. Masks should be in pixel coordinates.
    """

    height, width, _ = image.shape
    if masks is None:
        masks = (Rectangle(left=0, top=0, width=width, height=height),)

    CV2_MAXIMUM_HUE = 180
    SATURATION_THRESHOLD = 50  # out of 255

    cv2_hue = hue * CV2_MAXIMUM_HUE
    cv2_tolerance = tolerance * CV2_MAXIMUM_HUE
    img_hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    saturated_pixels = img_hsv[:, :, 1] > SATURATION_THRESHOLD

    hues = img_hsv[:, :, 0]
    distance_to_hue = np.abs(hues.astype(np.int16) - cv2_hue)
    abs_distance_to_hue = np.minimum(distance_to_hue, CV2_MAXIMUM_HUE - distance_to_hue)

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
) -> BoundingBox:
    """
    Convert a "bounding_box" in pixel coordinates in a raster image to PDF coordinates.
    """
    left = bounding_box.left
    top = bounding_box.top
    right = bounding_box.left + bounding_box.width
    bottom = bounding_box.top + bounding_box.height
    pdf_left = left * (pdf_page_width / float(image_width))
    pdf_right = right * (pdf_page_width / float(image_width))
    # Set PDF coordinates relative to the document bottom. Because image coordinates are relative
    # to the image's top, flip the y-coordinates.
    pdf_top = pdf_page_height - (top * (pdf_page_height / float(image_height)))
    pdf_bottom = pdf_page_height - (bottom * (pdf_page_height / float(image_height)))
    return BoundingBox(
        left=pdf_left,
        top=pdf_top,
        width=pdf_right - pdf_left,
        height=pdf_top - pdf_bottom,
        page=page,
    )


def get_symbol_bounding_box(
    symbol: Symbol, symbol_id: SymbolId, token_boxes: TokenLocations
) -> Optional[BoundingBox]:
    boxes = []
    for token_index in symbol.tokens:
        token_id = TokenId(
            symbol_id.tex_path, symbol_id.equation_index, token_index
        )
        boxes.extend(token_boxes.get(token_id, []))

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
    top = min([box.top for box in boxes_on_page])
    bottom = max([box.top + box.height for box in boxes_on_page])

    return BoundingBox(left, top, right - left, bottom - top, page)


def _is_box_in_cluster(
    box: BoundingBox, cluster: Set[BoundingBox], vsplit: float
) -> bool:
    if len(cluster) == 0:
        return True

    cluster_top = min([b.top for b in cluster])
    cluster_bottom = max([b.top + b.height for b in cluster])
    cluster_page = next(iter(cluster)).page

    box_bottom = box.top + box.height
    return box.page == cluster_page and (
        (cluster_top - vsplit) <= box.top <= (cluster_bottom + vsplit)
        or (cluster_top - vsplit) <= box_bottom <= (cluster_bottom + vsplit)
    )


def cluster_boxes(
    boxes: Iterable[BoundingBox], vertical_split: float = 0.02
) -> Iterator[Set[BoundingBox]]:
    """
    Cluster boxes into sets of boxes that are separated by 'vertical_split' * the height of the
    document page. This method was designed to help in grouping together bounding boxes that refer
    to the same entity, but which have been split from each other by a line break. Sets of boxes
    will be returned in order from top to bottom in the document.
    """
    boxes_sorted = sorted(boxes, key=lambda b: (b.page, b.top))

    cluster: Set[BoundingBox] = set()
    for box in boxes_sorted:
        if _is_box_in_cluster(box, cluster, vertical_split):
            cluster.add(box)
        else:
            yield cluster
            cluster = set([box])

    yield cluster


def subtract(rect1: FloatRectangle, rect2: FloatRectangle) -> Iterator[FloatRectangle]:
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
    rect1_bottom = rect1.top + rect1.height
    rect2_right = rect2.left + rect2.width
    rect2_bottom = rect2.top + rect2.height

    if not are_intersecting(rect1, rect2):
        yield FloatRectangle(rect1.left, rect1.top, rect1.width, rect1.height)
        return

    # Create 'split 1'
    if rect2.top >= rect1.top and rect2.top <= rect1_bottom:
        height = rect2.top - rect1.top
        if height > 0:
            yield FloatRectangle(rect1.left, rect1.top, rect1.width, height)

    # Create 'split 2'
    if rect2.left >= rect1.left and rect2.left <= rect1_right:
        diff_top = max(rect1.top, rect2.top)
        diff_bottom = min(rect1_bottom, rect2_bottom)
        width = rect2.left - rect1.left
        height = diff_bottom - diff_top
        if width > 0 and height > 0:
            yield FloatRectangle(rect1.left, diff_top, width, height)

    # Create 'split 3'
    if rect2_right <= rect1_right and rect2_right >= rect1.left:
        diff_top = max(rect1.top, rect2.top)
        diff_bottom = min(rect1_bottom, rect2_bottom)
        width = rect1_right - rect2_right
        height = diff_bottom - diff_top
        if width > 0 and height > 0:
            yield FloatRectangle(rect2_right, diff_top, width, height)

    # Create 'split 4'
    if rect2_bottom <= rect1_bottom and rect2_bottom >= rect1.top:
        height = rect1_bottom - rect2_bottom
        if height > 0:
            yield FloatRectangle(rect1.left, rect2_bottom, rect1.width, height)


def are_intersecting(rect1: FloatRectangle, rect2: FloatRectangle) -> bool:

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
            between(rect1.top, rect2.top, rect2.top + rect2.height),
            between(rect1.top + rect1.height, rect2.top, rect2.top + rect2.height),
            between(rect2.top, rect1.top, rect1.top + rect1.height),
            between(rect2.top + rect2.height, rect1.top, rect1.top + rect1.height),
        ]
    )

    return horizontal_range_overlap and vertical_range_overlap


def subtract_from_multiple(
    rects: Iterable[FloatRectangle], other: FloatRectangle
) -> Iterator[FloatRectangle]:
    """
    Assumes all rectangles in 'rects' are mutually exclusive.
    """
    for rect in rects:
        for diff_rect in subtract(rect, other):
            yield diff_rect


def subtract_multiple(
    rect: FloatRectangle, other_rects: Iterable[FloatRectangle]
) -> Iterator[FloatRectangle]:

    difference = [rect]
    for other_rect in other_rects:
        difference = list(subtract_from_multiple(difference, other_rect))

    for diff_rect in difference:
        yield diff_rect


def subtract_multiple_from_multiple(
    rects: Iterable[FloatRectangle], other_rects: Iterable[FloatRectangle]
) -> Iterator[FloatRectangle]:

    rects_unioned = union(rects)
    for rect in rects_unioned:
        for diff_rect in subtract_multiple(rect, other_rects):
            yield diff_rect


def union(rects: Iterable[FloatRectangle]) -> Iterator[FloatRectangle]:
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
    rects: Iterable[FloatRectangle], other_rects: Iterable[FloatRectangle]
) -> Iterator[FloatRectangle]:
    """
    In case the exact rectangles returned are important to you, the intersection is computed by
    first computing the union of all rectangles, then subtracting the difference between 'rects'
    and 'other_rects', and then subtracting the difference between 'other_rects' and 'rects'.
    """

    rects = list(rects)
    other_rects = list(other_rects)
    diff1 = list(subtract_multiple_from_multiple(rects, other_rects))
    diff2 = list(
        subtract_multiple_from_multiple(  # pylint: disable=arguments-out-of-order
            other_rects, rects
        )
    )
    union_rects = union(rects + other_rects)

    union_minus_diff1 = subtract_multiple_from_multiple(union_rects, diff1)
    union_minus_diffs = subtract_multiple_from_multiple(union_minus_diff1, diff2)
    for rect in union_minus_diffs:
        yield rect


def sum_areas(rects: Iterable[FloatRectangle]) -> float:
    """
    Assumes rectangles do not overlap with each other.
    """
    total_area = 0.0
    for rect in rects:
        total_area += rect.width * rect.height
    return total_area


def iou(
    rects: Iterable[FloatRectangle], other_rects: Iterable[FloatRectangle]
) -> float:
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
    rects: Iterable[FrozenSet[FloatRectangle]], other_rects: Iterable[FloatRectangle]
) -> Dict[FrozenSet[FloatRectangle], float]:
    """
    Compute the intersection between each rectangle in 'rects' and all rectangles that overlap
    with it in 'other_rects'.
    """
    other_rects = list(other_rects)
    ious: Dict[FrozenSet[FloatRectangle], float] = {}

    for rect_set in rects:

        def filter_fn(
            other_rect: FloatRectangle, rs: FrozenSet[FloatRectangle] = rect_set
        ) -> bool:
            return any([are_intersecting(r, other_rect) for r in rs])

        overlapping_rects = filter(filter_fn, other_rects)
        rect_iou = iou(rect_set, overlapping_rects)
        logging.debug(
            "Detection summary: %s, %s, %f",
            rect_set,
            list(filter(filter_fn, other_rects)),
            rect_iou,
        )
        ious[rect_set] = rect_iou

    return ious


def compute_accuracy(
    actual: Iterable[FrozenSet[FloatRectangle]],
    expected: Iterable[FloatRectangle],
    minimum_iou: float = 0.5,
) -> Tuple[float, float]:

    expected = list(expected)
    actual = list(actual)
    ious = iou_per_rectangle(actual, expected)

    count_found = len(list(filter(lambda i: i >= minimum_iou, ious.values())))
    precision = float(count_found) / len(actual)
    recall = float(count_found) / len(expected)

    return (precision, recall)
