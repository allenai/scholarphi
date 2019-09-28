import argparse
import logging
import os
import re
import subprocess
from typing import List

import cv2
import numpy as np
from imageio import imread, imsave

from explanations.bounding_box import PdfBoundingBox, get_bounding_boxes
from explanations.compile import compile_tex
from explanations.directories import ANNOTATED_PDFS_DIR, colorized_sources, sources
from explanations.fetch_arxiv import fetch
from explanations.file_utils import get_common_pdfs
from explanations.image_processing import annotate_pdf_with_bounding_boxes
from explanations.instrument_tex import colorize_tex
from explanations.unpack import unpack
from models.models import BoundingBox, Paper, create_tables


def save_bounding_boxes(arxiv_id: str, bounding_boxes: List[PdfBoundingBox]):
    try:
        paper = Paper.get(Paper.arxiv_id == arxiv_id)
    except Paper.DoesNotExist:
        paper = Paper.create(arxiv_id=arxiv_id)
    for box in bounding_boxes:
        BoundingBox.create(
            paper=paper,
            page=box.page,
            left=box.left,
            top=box.top,
            width=box.width,
            height=box.height,
        )


if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="Extract bounding boxes for symbols for arXiv papers"
    )
    parser.add_argument(
        "arxiv_ids", help="name of file that contains an arXiv ID on every line"
    )
    parser.add_argument("-v", action="store_true", help="show all logging statements")
    parser.add_argument(
        "--annotate-pdf",
        action="store_true",
        help="generate a PDF with annotations for the bounding boxes in %s"
        % (ANNOTATED_PDFS_DIR,),
    )
    args = parser.parse_args()

    if args.v:
        logging.basicConfig(level=logging.DEBUG)

    # Create database tables if they don't yet exist
    create_tables()

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
            common_pdfs = get_common_pdfs(original_pdfs, colorized_pdfs)
            for pdf_name in common_pdfs:
                bounding_boxes = get_bounding_boxes(arxiv_id, pdf_name)
                save_bounding_boxes(arxiv_id, bounding_boxes)

                if args.annotate_pdf:
                    annotate_pdf_with_bounding_boxes(arxiv_id, pdf_name, bounding_boxes)
