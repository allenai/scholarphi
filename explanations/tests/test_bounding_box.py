import os.path

import cv2

from explanations.bounding_box import find_box_of_color
from tests.util import get_test_path


def test_find_bounding_box():
    image = cv2.imread(get_test_path(os.path.join("images", "rectangle_hue_40.png")))
    rectangle = find_box_of_color(image, (40 / 360.0))
    assert rectangle.left == 10
    assert rectangle.top == 10
    assert rectangle.width == 10
    assert rectangle.height == 10
