import numpy as np

def diff_two_images(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Returns a copy of image 'a' with all pixels where 'a' and 'b' are equal set to white."""
    assert np.array_equal(np.shape(a), np.shape(b))
    diff = a - b
    mask = np.any(diff != 0, axis=2)  # Check if any channel is different
    rgb_mask = np.transpose(np.tile(mask, (3, 1, 1)), axes=[1, 2, 0])
    diff_image = np.copy(a)
    diff_image[np.logical_not(rgb_mask)] = 255
    return diff_image