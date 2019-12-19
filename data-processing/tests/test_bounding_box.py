import os.path
from typing import FrozenSet

import cv2

from explanations.bounding_box import (
    compute_accuracy,
    find_boxes_with_color,
    intersect,
    iou,
    iou_per_rectangle,
    subtract,
    subtract_multiple,
    subtract_multiple_from_multiple,
    union,
)
from explanations.types import FloatRectangle as Rectangle
from tests.util import get_test_path


def test_find_bounding_box():
    image = cv2.imread(get_test_path(os.path.join("images", "rectangle_hue_40.png")))
    boxes = find_boxes_with_color(image, (40 / 360.0))
    assert len(boxes) == 1
    assert boxes[0].left == 10
    assert boxes[0].top == 10
    assert boxes[0].width == 10
    assert boxes[0].height == 10


def test_split_into_lines():
    image = cv2.imread(get_test_path(os.path.join("images", "two_lines_hue_40.png")))
    boxes = find_boxes_with_color(image, (40 / 360.0))
    assert len(boxes) == 2

    # The two boxes that are horizontally aligned but separated get merged.
    assert boxes[0].left == 5
    assert boxes[0].top == 10
    assert boxes[0].width == 30
    assert boxes[0].height == 10

    # The box at a different vertical location doesn't get merged.
    assert boxes[1].left == 5
    assert boxes[1].top == 21
    assert boxes[1].width == 10
    assert boxes[1].height == 10


def test_find_boxes_within_masks():
    image = cv2.imread(get_test_path(os.path.join("images", "two_lines_hue_40.png")))
    boxes = find_boxes_with_color(
        image,
        (40 / 360.0),
        masks=(
            (
                Rectangle(left=5, top=10, width=10, height=10),
                Rectangle(left=25, top=10, width=10, height=10),
            )
        ),
    )
    # The masks will split up two colorized regions that would normally be merged.
    assert len(boxes) == 2

    assert boxes[0].left == 5
    assert boxes[0].top == 10
    assert boxes[0].width == 10
    assert boxes[0].height == 10

    assert boxes[1].left == 25
    assert boxes[1].top == 10
    assert boxes[1].width == 10
    assert boxes[1].height == 10


def test_subtract_rectangle_inside_another():
    outer = Rectangle(0, 0, 20, 20)
    inner = Rectangle(5, 5, 10, 10)
    diff_rects = list(subtract(outer, inner))
    assert len(diff_rects) == 4
    assert Rectangle(0, 0, 20, 5) in diff_rects
    assert Rectangle(0, 5, 5, 10) in diff_rects
    assert Rectangle(15, 5, 5, 10) in diff_rects
    assert Rectangle(0, 15, 20, 5) in diff_rects


def test_subtract_outer_rectangle_from_inner_rectangle():
    outer = Rectangle(0, 0, 20, 20)
    inner = Rectangle(5, 5, 10, 10)
    assert len(list(subtract(inner, outer))) == 0


def test_subtract_rectangle_with_shared_boundaries():
    rect1 = Rectangle(0, 0, 20, 20)
    rect2 = Rectangle(10, 10, 10, 10)
    diff_rects = list(subtract(rect1, rect2))
    assert len(diff_rects) == 2
    assert Rectangle(0, 0, 20, 10) in diff_rects
    assert Rectangle(0, 10, 10, 10) in diff_rects


def test_subtract_nonintersecting_rectangle():
    rect1 = Rectangle(0, 0, 20, 20)
    rect2 = Rectangle(30, 0, 20, 20)
    diff_rects = list(subtract(rect1, rect2))
    assert len(diff_rects) == 1
    assert diff_rects == [rect1]


def test_another_subtract():
    rect1 = Rectangle(20, 10, 10, 10)
    rect2 = Rectangle(15, 5, 20, 20)
    diff_rects = list(subtract(rect1, rect2))
    assert len(diff_rects) == 0


def test_subtract_rectangle_from_itself():
    rect1 = Rectangle(0, 0, 20, 20)
    rect2 = Rectangle(0, 0, 20, 20)
    assert len(list(subtract(rect1, rect2))) == 0


def test_subtract_rectangle_iterable_from_rectangle():
    rect = Rectangle(10, 10, 20, 20)
    other_rects = [Rectangle(0, 0, 20, 20), Rectangle(15, 5, 20, 20)]
    diff_rects = list(subtract_multiple(rect, other_rects))
    assert len(diff_rects) == 2
    assert Rectangle(10, 20, 5, 5) in diff_rects
    assert Rectangle(10, 25, 20, 5) in diff_rects


def test_subtract_rectangle_iterable_from_rectangle_iterable():
    rects = [Rectangle(0, 0, 20, 20), Rectangle(20, 0, 20, 20)]
    other_rects = [Rectangle(10, 0, 20, 20), Rectangle(35, 0, 20, 20)]
    diff_rects = list(subtract_multiple_from_multiple(rects, other_rects))
    assert Rectangle(0, 0, 10, 20) in diff_rects
    assert Rectangle(30, 0, 5, 20) in diff_rects


def test_union_rectangles():
    rects = [Rectangle(0, 0, 20, 20), Rectangle(10, 10, 20, 20)]
    union_rects = list(union(rects))
    assert len(union_rects) == 3
    assert Rectangle(0, 0, 20, 20) in union_rects
    assert Rectangle(20, 10, 10, 10) in union_rects
    assert Rectangle(10, 20, 20, 10) in union_rects


def test_another_union():
    rects = [
        Rectangle(0, 0, 20, 20),
        Rectangle(20, 0, 20, 20),
        Rectangle(10, 0, 20, 20),
        Rectangle(35, 0, 20, 20),
    ]
    union_rects = list(union(rects))
    assert len(union_rects) == 3
    assert Rectangle(0, 0, 20, 20) in union_rects
    assert Rectangle(20, 0, 20, 20) in union_rects
    assert Rectangle(40, 0, 15, 20) in union_rects


def test_intersect_rectangle_iterables():
    rects = [Rectangle(0, 0, 20, 20), Rectangle(20, 0, 20, 20)]
    other_rects = [Rectangle(10, 0, 20, 20), Rectangle(35, 0, 20, 20)]
    intersection_rects = list(intersect(rects, other_rects))
    assert Rectangle(10, 0, 10, 20) in intersection_rects
    assert Rectangle(20, 0, 10, 20) in intersection_rects
    assert Rectangle(35, 0, 5, 20) in intersection_rects


def test_compute_page_iou_for_rectangle_iterables():
    # There's a 10px-wide overlap between rect1 and rect2; the algorithm for IOU should use the
    # union of the areas of the input rects.
    rects = [Rectangle(0, 0, 20, 20), Rectangle(10, 0, 30, 20)]
    other_rects = [Rectangle(10, 0, 20, 20), Rectangle(35, 0, 20, 20)]
    # Intersection area = 10 x 20 + 10 x 20 + 5 x 20 = 500
    # Union area = 55 x 20 => 1100
    assert iou(rects, other_rects) == float(500) / 1100


def fs(*rects: Rectangle) -> FrozenSet[Rectangle]:
    return frozenset(rects)


def test_compute_iou_per_rectangle_set():
    # There's a 10px-wide overlap between rect1 and rect2; the algorithm for IOU should use the
    # union of the areas of the input rects.
    rects = [
        fs(Rectangle(0, 0, 20, 20)),
        fs(Rectangle(10, 0, 30, 20)),
        fs(Rectangle(40, 0, 10, 10), Rectangle(40, 10, 10, 10)),
    ]
    other_rects = [Rectangle(10, 0, 20, 20), Rectangle(35, 0, 20, 20)]
    ious = iou_per_rectangle(rects, other_rects)
    assert ious[fs(Rectangle(0, 0, 20, 20))] == float(10) / 30
    assert ious[fs(Rectangle(10, 0, 30, 20))] == float(25) / 45
    assert (
        ious[fs(Rectangle(40, 0, 10, 10), Rectangle(40, 10, 10, 10))] == float(10) / 20
    )


def test_rectangle_precision_recall():
    expected = [fs(Rectangle(0, 0, 20, 20)), fs(Rectangle(10, 0, 30, 20))]
    actual = [Rectangle(10, 0, 20, 20), Rectangle(35, 0, 20, 20)]
    # The threshold value is set to the level where rectangle 1 in 'expected' does not have a
    # a match in 'actual', and rectangle 2 in 'expected' only has a match if you consider
    # its overlap with *all* rectangles in 'actual'.
    precision, recall = compute_accuracy(expected, actual, minimum_iou=0.5)
    assert precision == 0.5
    assert recall == 0.5
