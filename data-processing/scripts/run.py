import argparse
import logging
import os
import re
import subprocess
from typing import List

import cv2
import numpy as np
from imageio import imread, imsave

from explanations.bounding_box import LocalizedEquation, extract_bounding_boxes
from explanations.compile import compile_tex
from explanations.directories import (
    ANNOTATED_PDFS_DIR,
    COLORIZED_PAPER_IMAGES_DIR,
    DIFF_PAPER_IMAGES_DIR,
    PAPER_IMAGES_DIR,
    colorized_sources,
    sources,
)
from explanations.fetch_arxiv import fetch
from explanations.file_utils import get_common_pdfs
from explanations.image_processing import annotate_pdf
from explanations.instrument_tex import colorize_equations
from explanations.unpack import unpack
from models.models import Equation, Paper, create_tables


def save_localized_equations(arxiv_id: str, equations: List[LocalizedEquation]):
    try:
        paper = Paper.get(Paper.arxiv_id == arxiv_id)
    except Paper.DoesNotExist:
        paper = Paper.create(arxiv_id=arxiv_id)
    for equation in equations:
        Equation.create(
            paper=paper,
            page=equation.box.page,
            tex=equation.tex,
            left=equation.box.left,
            top=equation.box.top,
            width=equation.box.width,
            height=equation.box.height,
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
    parser.add_argument(
        "--save-images",
        action="store_true",
        help="output images from intermediate stages of the pipeline to %s, %s, and %s"
        % (PAPER_IMAGES_DIR, COLORIZED_PAPER_IMAGES_DIR, DIFF_PAPER_IMAGES_DIR),
    )
    parser.add_argument(
        "--skip-fetch",
        action="store_true",
        help="don't fetch the arXiv sources. Use this flag the second time you run the script "
        + "for the same set of papers, to avoid making unnecessary requests to arXiv.",
    )
    parser.add_argument(
        "--skip-database",
        action="store_true",
        help="skip initializing and saving results to the database. Use for development if the "
        + "database server is down.",
    )
    args = parser.parse_args()

    if args.v:
        logging.basicConfig(level=logging.DEBUG)

    # Create database tables if they don't yet exist
    if not args.skip_database:
        create_tables()

    arxiv_ids_filename = args.arxiv_ids
    with open(arxiv_ids_filename, "r") as arxiv_ids_file:
        for line in arxiv_ids_file:
            arxiv_id = line.strip()
            logging.debug("Processing arXiv document %s", arxiv_id)

            if not args.skip_fetch:
                fetch(arxiv_id)

            unpack(arxiv_id)
            colorized_tex = colorize_equations(arxiv_id)
            original_pdfs = compile_tex(sources(arxiv_id))
            colorized_pdfs = compile_tex(colorized_sources(arxiv_id))
            common_pdfs = get_common_pdfs(original_pdfs, colorized_pdfs)
            for pdf_name in common_pdfs:
                localized_equations = extract_bounding_boxes(
                    arxiv_id, pdf_name, colorized_tex.equations, args.save_images
                )
                if not args.skip_database:
                    save_localized_equations(arxiv_id, localized_equations)

                if args.annotate_pdf:
                    annotate_pdf(arxiv_id, pdf_name, localized_equations)
