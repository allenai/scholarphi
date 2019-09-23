"""

This assumes that you already have a LaTeX source directory & it compiles correctly.



"""



from typing import Optional, List

import os
import subprocess
import shutil
import bs4

import numpy as np
import cv2
from imageio import imread, imsave
from explanations.explanations.bounding_box import bbs_for_color, find_connected_components, cluster_close_cc, merge_bbs
from explanations.explanations.image_diff import diff_two_images


def call_pdflatex(input_latex_dir: str, output_latex_dir: str):
    pass

def rasterize_pdf(input_pdf_path: str, output_dir: str):
    """Rasterize a PDF using GhostScript.
    Command:
        gs -dGraphicsAlphaBits=4 -dTextAlphaBits=4 -dNOPAUSE -dBATCH -dSAFER -dQUIET -sDEVICE=png16m -r96 -sOutputFile=output1_inject/%04d.png -dBufferSpace=1000000000 -dBandBufferSpace=500000000 -sBandListStorage=memory -c 1000000000 setvmthreshold -dNOGC -dLastPage=50 -dNumRenderingThreads=4 -f output1_color/mainRecSys.pdf
    """
    # ghostscript requires a template string for the output path
    output_path_template = os.path.join(output_dir, "%04d.png")
    gs_args = [
        "gs",
        "-dGraphicsAlphaBits=4",
        "-dTextAlphaBits=4",
        "-dNOPAUSE",
        "-dBATCH",
        "-dSAFER",
        "-dQUIET",
        "-sDEVICE=png16m",
        "-r96",
        "-sOutputFile=" + output_path_template,
        "-dBufferSpace=%d" % int(1e9),
        "-dBandBufferSpace=%d" % int(5e8),
        "-sBandListStorage=memory",
        "-c",
        "%d setvmthreshold" % int(1e9),
        "-dNOGC",
        "-dLastPage=50",
        "-dNumRenderingThreads=4",
        "-f",
        input_pdf_path,
    ]
    subprocess.run(gs_args, check=False)

def diff_image(input_png_path1: str, input_png_path2: str, output_png_path: str):
    img1 = imread(input_png_path1)
    img2 = imread(input_png_path2)
    diff_img = diff_two_images(img1, img2)
    imsave(output_png_path, diff_img)
    
