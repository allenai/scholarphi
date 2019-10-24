import os.path

import cv2

from explanations.bounding_box import find_boxes_with_color
from explanations.types import Rectangle
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
