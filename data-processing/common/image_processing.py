from typing import List

import cv2
import numpy as np


def contains_black_pixels(img: np.ndarray) -> bool:

    # Black pixels will have value and saturation near 0. Still consider pixels with
    # a value above 0 because of aliasing in images, where black letters in an image
    # may appear as a group of grey pixels.
    SATURATION_THRESHOLD = 20  # out of 255
    VALUE_THRESHOLD = 150  # out of 255

    img_hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    return bool(
        np.any(
            np.logical_and(
                img_hsv[:, :, 1] < SATURATION_THRESHOLD,
                img_hsv[:, :, 2] < VALUE_THRESHOLD,
            )
        )
    )


def diff_image_lists(
    image_list_0: List[np.ndarray], image_list_1: List[np.ndarray]
) -> List[np.ndarray]:
    """
    Difference two lists of CV2 images, with pairwise comparisons at each index.
    """
    assert len(image_list_0) == len(image_list_1)
    diffs = []
    for i in range(0, len(image_list_0)):  # pylint: disable=consider-using-enumerate
        diff = diff_images(image_list_0[i], image_list_1[i])
        diffs.append(diff)
    return diffs


def diff_images(image0: np.ndarray, image1: np.ndarray) -> np.ndarray:
    """Returns a copy of 'image0' with all pixels where 'image0' and 'image1' are equal set to white."""
    assert np.array_equal(np.shape(image0), np.shape(image1))
    diff = image0 - image1
    mask = np.any(diff != 0, axis=2)  # Check if any channel is different
    rgb_mask = np.transpose(np.tile(mask, (3, 1, 1)), axes=[1, 2, 0])
    diff_image = np.copy(image0)
    diff_image[np.logical_not(rgb_mask)] = 255
    return diff_image
