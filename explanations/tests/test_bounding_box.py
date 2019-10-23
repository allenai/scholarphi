import os.path

import cv2

from explanations.bounding_box import find_boxes_of_color
from tests.util import get_test_path


def test_find_bounding_box():
    image = cv2.imread(get_test_path(os.path.join("images", "rectangle_hue_40.png")))
    boxes = find_boxes_of_color(image, (40 / 360.0))
    assert len(boxes) == 1
    assert boxes[0].left == 10
    assert boxes[0].top == 10
    assert boxes[0].width == 10
    assert boxes[0].height == 10


def test_split_into_lines():
    image = cv2.imread(get_test_path(os.path.join("images", "two_lines_hue_40.png")))
    boxes = find_boxes_of_color(image, (40 / 360.0))
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
