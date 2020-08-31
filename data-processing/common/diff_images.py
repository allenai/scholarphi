import logging
import os.path
from typing import List

import cv2
import numpy as np

from common import directories
from common.types import ArxivId, OutputFile, RelativePath


def diff_images(image0: np.ndarray, image1: np.ndarray) -> np.ndarray:
    """Returns a copy of 'image0' with all pixels where 'image0' and 'image1' are equal set to white."""
    assert np.array_equal(np.shape(image0), np.shape(image1))
    diff = image0 - image1
    mask = np.any(diff != 0, axis=2)  # Check if any channel is different
    rgb_mask = np.transpose(np.tile(mask, (3, 1, 1)), axes=[1, 2, 0])
    diff_image = np.copy(image0)
    diff_image[np.logical_not(rgb_mask)] = 255
    return diff_image


def diff_images_in_raster_dirs(
    compilation_output_files: List[OutputFile],
    comparison_rasters_base_dir: RelativePath,
    diffs_output_dir: RelativePath,
    arxiv_id: ArxivId
) -> bool:
    """
    Diff images from a modified rendering of TeX files versus the original rendering.
    """

    # Get output file names from results of compiling the uncolorized TeX sources.
    if len(compilation_output_files) == 0:
        logging.warning(  # pylint: disable=logging-not-lazy
            "Could not find any compiled files for arXiv ID %s. "
            + "Skipping differencing of images for this paper.",
            arxiv_id,
        )
        return False

    original_images_dir = directories.arxiv_subdir("paper-images", arxiv_id)

    for output_file in compilation_output_files:
        relative_file_path = output_file.path
        original_images_path = os.path.join(original_images_dir, relative_file_path)
        for img_name in os.listdir(original_images_path):
            original_img_path = os.path.join(original_images_path, img_name)
            modified_img_path = os.path.join(
                comparison_rasters_base_dir, relative_file_path, img_name
            )
            if not os.path.exists(modified_img_path):
                logging.warning(
                    "Could not find expected image %s. Skipping diff for this paper.",
                    modified_img_path,
                )
                return False

            original_img = cv2.imread(original_img_path)
            modified_img = cv2.imread(modified_img_path)

            # Colorized images is the first parameter: this means that original_images will be
            # subtracted from colorized_images where the two are the same.
            result = diff_images(modified_img, original_img)

            image_path = os.path.join(diffs_output_dir, relative_file_path, img_name)
            image_dir = os.path.dirname(image_path)
            if not os.path.exists(image_dir):
                os.makedirs(image_dir)
            cv2.imwrite(image_path, result)
            logging.debug("Diffed images and stored result at %s", image_path)

    return True


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
