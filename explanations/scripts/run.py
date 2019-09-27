import argparse
import logging
import os
import re
import subprocess
from collections import namedtuple
from pprint import pprint
from typing import List

import cv2
import numpy as np
from imageio import imread, imsave

from explanations.bounding_box import (
    cluster_nearby_connected_components,
    find_connected_components,
    merge_bbs,
)
from explanations.compile import compile_tex
from explanations.directories import (
    colorized_sources,
    get_colorized_pdf_path,
    get_original_pdf_path,
    sources,
)
from explanations.fetch_arxiv import fetch
from explanations.file_utils import get_shared_pdfs
from explanations.image_processing import diff_image_lists, get_cv2_images
from explanations.instrument_tex import colorize_tex
from explanations.unpack import unpack


def compute_bounding_boxes(image_diff: np.array):
    connected_components = find_connected_components(
        image_diff, lower=np.array([0, 0, 0]), upper=np.array([180, 255, 125])
    )
    level, clusters, d = cluster_nearby_connected_components(connected_components)
    bounding_boxes = [merge_bbs(cluster) for cluster in clusters]
    pprint(bounding_boxes)


if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="Extract bounding boxes for symbols for arXiv papers"
    )
    parser.add_argument(
        "arxiv_ids", help="name of file that contains an arXiv ID on every line"
    )
    parser.add_argument("-v", action="store_true", help="show all logging statements")

    args = parser.parse_args()

    if args.v:
        logging.basicConfig(level=logging.DEBUG)

    arxiv_ids_filename = args.arxiv_ids
    with open(arxiv_ids_filename, "r") as arxiv_ids_file:
        for line in arxiv_ids_file:
            arxiv_id = line.strip()
            logging.debug("Processing arXiv document %s", arxiv_id)
            # fetch(arxiv_id)
            unpack(arxiv_id)
            colorize_tex(arxiv_id)
            original_pdfs = compile_tex(sources(arxiv_id))
            colorized_pdfs = compile_tex(colorized_sources(arxiv_id))
            shared_pdfs = get_shared_pdfs(original_pdfs, colorized_pdfs)
            for pdf in shared_pdfs:
                original_pdf_path = get_original_pdf_path(arxiv_id, pdf)
                colorized_pdf_path = get_colorized_pdf_path(arxiv_id, pdf)
                original_images = get_cv2_images(original_pdf_path)
                colorized_images = get_cv2_images(colorized_pdf_path)
                image_diffs = diff_image_lists(original_images, colorized_images)
                for image_diff in image_diffs:
                    compute_bounding_boxes(image_diff)
