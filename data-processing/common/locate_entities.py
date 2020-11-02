import logging
import os.path
from collections import defaultdict
from dataclasses import dataclass
from typing import Dict, List, Optional, Set

import cv2
import numpy as np

from common import directories
from common.bounding_box import extract_bounding_boxes
from common.compile import get_output_files
from common.types import ArxivId, BoundingBox, RelativePath


@dataclass(frozen=True)
class LocationResult:
    locations: Dict[str, List[BoundingBox]]
    shifted_entities: List[str]
    black_pixels_found: bool


def locate_entities(
    arxiv_id: ArxivId,
    modified_images_dir: RelativePath,
    diffed_images_dir: RelativePath,
    entity_hues: Dict[str, float],
) -> Optional[LocationResult]:

    # Get output file names from results of compiling the uncolorized TeX sources.
    output_files = get_output_files(
        directories.arxiv_subdir("compiled-normalized-sources", arxiv_id)
    )
    output_paths = [f.path for f in output_files]

    black_pixels_found = False
    shifted_entity_ids: Set[str] = set()
    entity_locations: Dict[str, List[BoundingBox]] = defaultdict(list)

    for relative_file_path in output_paths:
        diffed_images_file_path = os.path.join(diffed_images_dir, relative_file_path)

        # Locate bounding boxes for each hue in the diffs.
        diff_images = {}
        if not os.path.exists(diffed_images_file_path):
            logging.warning(  # pylint: disable=logging-not-lazy
                "Expected but could not find a directory %s from the image diffs. "
                + "This suggests that the colorized paper failed to compile. Hues "
                + "will not be searched for in this diff directory.",
                diffed_images_file_path,
            )
            return None

        for img_name in os.listdir(diffed_images_file_path):
            img_path = os.path.join(diffed_images_file_path, img_name)
            page_image = cv2.imread(img_path)

            if contains_black_pixels(page_image):
                logging.warning("Black pixels found in image diff %s", img_path)
                black_pixels_found = True

            page_number = int(os.path.splitext(img_name)[0].replace("page-", "")) - 1
            diff_images[page_number] = page_image

        for entity_id, hue in entity_hues.items():
            for page_number, image in diff_images.items():
                boxes = extract_bounding_boxes(image, page_number, hue)
                for box in boxes:
                    entity_locations[entity_id].append(box)

        shifted_entity_ids.update(
            find_shifted_entities(
                arxiv_id, modified_images_dir, relative_file_path, entity_hues
            )
        )

    return LocationResult(
        locations=entity_locations,
        shifted_entities=list(shifted_entity_ids),
        black_pixels_found=black_pixels_found,
    )


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


def find_shifted_entities(
    arxiv_id: ArxivId,
    modified_images_base_dir: RelativePath,
    output_path: RelativePath,
    entity_hues: Dict[str, float],
) -> List[str]:
    original_images_dir = os.path.join(
        directories.arxiv_subdir("paper-images", arxiv_id), output_path
    )
    if not os.path.exists(original_images_dir):
        logging.warning(  # pylint: disable=logging-not-lazy
            "Could not open up images from the compilation of the clean TeX sources at "
            + "%s. It will not be possible to detect which entities shifted during colorization.",
            original_images_dir,
        )
        return []

    modified_images_dir = os.path.join(modified_images_base_dir, output_path)
    if not os.path.exists(original_images_dir):
        logging.warning(  # pylint: disable=logging-not-lazy
            "Could not open up images from the compilation of the colorized TeX sources at "
            + "%s. It will not be possible to detect which entities shifted during colorization.",
            modified_images_dir,
        )
        return []

    shifted_entity_ids = set()
    for img_name in os.listdir(original_images_dir):
        original_img_path = os.path.join(original_images_dir, img_name)
        modified_img_path = os.path.join(modified_images_dir, img_name)
        if not os.path.exists(modified_img_path):
            logging.warning(  # pylint: disable=logging-not-lazy
                "A colorized image %s could not be found to compare to a non-colorized image "
                + "%s. This pair of images will not be searched for shifting entities."
            )
            continue

        original = cv2.imread(original_img_path)
        modified = cv2.imread(modified_img_path)

        for entity_id, hue in entity_hues.items():
            if has_hue_shifted(original, modified, hue):
                shifted_entity_ids.add(entity_id)

    return list(shifted_entity_ids)


def has_hue_shifted(
    before: np.ndarray, after: np.ndarray, hue: float, tolerance: float = 0.02
) -> bool:
    """
    Detect whether pixels of a specified 'hue' have shifted away from where pixels were in a
    baseline image. Used to detect whether rasters of pages with colorized images had
    contain accidental layout changes. See 'extract_bounding_boxes' for a description of the 'hue'
    and 'tolerance' arguments.
    """

    CV2_MAXIMUM_HUE = 180

    # A pixel with a value above 230 and a saturation below 10 is considered blank.
    VALUE_THRESHOLD = 230  # out of 255
    SATURATION_THRESHOLD = 10  # out of 255

    # Detect which pixels in 'after' have changed from not filled to filled.
    before_hsv = cv2.cvtColor(before, cv2.COLOR_BGR2HSV)
    after_hsv = cv2.cvtColor(after, cv2.COLOR_BGR2HSV)

    SATURATION_CHANNEL = 1
    VALUE_CHANNEL = 2
    blank_before = np.logical_and(
        before_hsv[:, :, SATURATION_CHANNEL] < SATURATION_THRESHOLD,
        before_hsv[:, :, VALUE_CHANNEL] > VALUE_THRESHOLD,
    )
    blank_after = np.logical_and(
        after_hsv[:, :, SATURATION_CHANNEL] < SATURATION_THRESHOLD,
        after_hsv[:, :, VALUE_CHANNEL] > VALUE_THRESHOLD,
    )
    fill_changes = np.logical_xor(blank_before, blank_after)

    # Compute hues at all location where saturation changed.
    HUE_CHANNEL = 0
    after_hues = after_hsv[:, :, HUE_CHANNEL]

    # Determine whether the hue at any of the locations matches the input hue.
    cv2_hue = hue * CV2_MAXIMUM_HUE
    cv2_tolerance = tolerance * CV2_MAXIMUM_HUE
    distance_to_hue = np.abs(after_hues.astype(np.int16) - cv2_hue)
    abs_distance_to_hue = np.minimum(distance_to_hue, CV2_MAXIMUM_HUE - distance_to_hue)
    return bool(np.any((abs_distance_to_hue <= cv2_tolerance) & fill_changes))
