import cv2

from explanations.bounding_box import find_box_of_color


def test_find_bounding_box():
    # This script expects to be run from the root directory, for paths to resolve correctly.
    image = cv2.imread("tests/images/rectangle_hue_40.png")
    rectangle = find_box_of_color(image, (40 / 360.0))
    assert rectangle.left == 10
    assert rectangle.top == 10
    assert rectangle.width == 10
    assert rectangle.height == 10
