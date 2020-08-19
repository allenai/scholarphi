import os.path

import cv2

from common.locate_entities import contains_black_pixels, has_hue_shifted
from tests.util import get_test_path


YELLOW_HUE = 40 / 360.0


def test_detect_black_pixels():
    image = cv2.imread(get_test_path(os.path.join("images", "black_letter_40.png")))
    assert contains_black_pixels(image)


def test_no_detect_black_pixels_in_blank_image():
    image = cv2.imread(get_test_path(os.path.join("images", "blank_40.png")))
    assert not contains_black_pixels(image)


def test_no_detect_saturated_pixels_as_black():
    image = cv2.imread(get_test_path(os.path.join("images", "yellow_letter_40.png")))
    assert not contains_black_pixels(image)


def test_no_detect_shift_when_pixels_aligned():
    black = cv2.imread(get_test_path(os.path.join("images", "black_letter_40.png")))
    yellow = cv2.imread(get_test_path(os.path.join("images", "yellow_letter_40.png")))
    assert not has_hue_shifted(black, yellow, YELLOW_HUE)


def test_detect_shift():
    black = cv2.imread(get_test_path(os.path.join("images", "black_letter_40.png")))
    yellow_shifted = cv2.imread(
        get_test_path(os.path.join("images", "yellow_letter_40_shifted.png"))
    )
    assert has_hue_shifted(black, yellow_shifted, YELLOW_HUE)


def test_no_detect_shift_for_other_hue():
    black = cv2.imread(get_test_path(os.path.join("images", "black_letter_40.png")))
    pink_shifted = cv2.imread(
        get_test_path(os.path.join("images", "pink_letter_40_shifted.png"))
    )
    assert not has_hue_shifted(black, pink_shifted, YELLOW_HUE)
