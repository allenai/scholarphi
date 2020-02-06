import os.path

import cv2

from explanations.image_processing import contains_black_pixels
from tests.util import get_test_path


def test_detect_black_pixels():
    image = cv2.imread(get_test_path(os.path.join("images", "black_letter_40.png")))
    assert contains_black_pixels(image)


def test_no_detect_black_pixels_in_blank_image():
    image = cv2.imread(get_test_path(os.path.join("images", "blank_40.png")))
    assert not contains_black_pixels(image)


def test_no_detect_saturated_pixels_as_black():
    image = cv2.imread(get_test_path(os.path.join("images", "yellow_letter_40.png")))
    assert not contains_black_pixels(image)
