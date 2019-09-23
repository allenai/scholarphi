"""

to compile LaTeX to PDf ->
    Download source from arXiv.
    Run `tar xvzf 1909.08079 --directory input1/`
    `cd input1/`
    `pdflatex -interaction=nonstopmode -shell-escape -output-directory=../output1/ main*.tex`     # first time doesnt render bib entries properly
    `pdflatex -interaction=nonstopmode -shell-escape -output-directory=../output1/ main*.tex`     # second times does. no idea why

Q:  Can we use Grobid?
A:  Not really.  https://grobid.readthedocs.io/en/latest/Coordinates-in-PDF/#coordinates-in-teixml-results
    It explains that you can only get coordinates for the particular structures it supports.
    Might be worth digging into how Grobid retains the PDFBox coordinate information?


"""

from typing import Optional, List

import os
import subprocess
import shutil
import bs4
# from hoptex.demacro import demacro_file

import numpy as np
import cv2
from imageio import imread, imsave
from bounding_box import bbs_for_color, find_connected_components, cluster_close_cc, merge_bbs


def call_pdflatex(src_tex: str, src_dir: str, dest_dir: str, timeout: int = 1200) -> str:
    """
    Call pdflatex on the tex source file src_tex, save its output to dest_dir, and return the path of the
    resulting pdf.
    """
    # Need to be in the same directory as the file to compile it
    os.makedirs(dest_dir, exist_ok=True)
    # Shell-escape required due to https://www.scivision.co/pdflatex-error-epstopdf-output-filename-not-allowed-in-restricted-mode/
    cmd = [
        "pdflatex",
        "-interaction=nonstopmode",
        "-shell-escape",
        "-output-directory=" + dest_dir,
        src_tex,
    ]
    # Run twice so that citations are built correctly
    # Had some issues getting latexmk to work
    try:
        subprocess.run(cmd, stdout=subprocess.PIPE, cwd=src_dir, timeout=timeout)
        res = subprocess.run(cmd, stdout=subprocess.PIPE, cwd=src_dir, timeout=timeout)
    except subprocess.TimeoutExpired:
        raise Exception(" ".join(cmd), -1, "Timeout exception after %d" % timeout)
    if res.returncode != 0:
        log_text = res.stdout.decode("UTF-8")
        if "Fatal error" in log_text:
            raise Exception(" ".join(cmd), res.returncode, log_text)
    src_name = os.path.splitext(os.path.basename(src_tex))[0]
    return dest_dir + src_name + ".pdf"
# call_pdflatex(src_tex='mainRecSys.tex', src_dir='input1/', dest_dir='input1/')


with open('input1/mainRecSys.tex', "rb") as f:
    # Some files may cause a UnicodeDecodeError if read directly as text, e.g. '/net/nfs.corp/s2-research/figure-extraction/data/distant-data/arxiv/src/0001/cond-mat0001356/s10677c.tex'
    text = bs4.UnicodeDammit(f.read()).unicode_markup

# TODO: injection


# test to see if you write it directly, if still renders
if os.path.exists('input1_inject/'):
    shutil.rmtree('input1_inject/')
    shutil.copytree('input1/', 'input1_inject/')
    with open('input1_inject/mainRecSys.tex', 'w') as f_out:
        f_out.write(text)
    shutil.rmtree('output1_inject/')
    os.makedirs('output1_inject/')
    # run pdflatex


# render to PNG
def rasterize_pdf(pdf_path: str, output_dir: str):
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
        pdf_path,
    ]
    subprocess.run(gs_args, check=False)

# rasterize_pdf(pdf_path='output1/mainRecSys.pdf', output_dir='output1_black/')
# rasterize_pdf(pdf_path='output1_color/mainRecSys.pdf', output_dir='output1_inject/')







original_img_filepath = 'output1_black/0003.png'
colorized_img_filepath = 'output1_inject/0003.png'

original_img = imread(original_img_filepath)
colorized_img = imread(colorized_img_filepath)

def im_diff(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Returns a copy of image 'a' with all pixels where 'a' and 'b' are equal set to white."""
    assert np.array_equal(np.shape(a), np.shape(b))
    diff = a - b
    mask = np.any(diff != 0, axis=2)  # Check if any channel is different
    rgb_mask = np.transpose(np.tile(mask, (3, 1, 1)), axes=[1, 2, 0])
    diff_image = np.copy(a)
    diff_image[np.logical_not(rgb_mask)] = 255
    return diff_image

diff_page = im_diff(original_img, colorized_img)

os.makedirs('output1_diff/')
imsave('output1_diff/0003.png', diff_page)


diff_page = imread('output1_diff/0003.png')
# bbs_for_color(diff_page, 0)
bbs = find_connected_components(diff_page, lower=np.array([0, 0, 0]), upper=np.array([180, 255, 125]))
level, clusters, d = cluster_close_cc(bbs)
bbs = [merge_bbs(cluster) for cluster in clusters]


for i, label_bb in enumerate(bbs):
    minX, minY, maxX, maxY = label_bb
    test_img = cv2.rectangle(original_img, (minX, minY), (maxX, maxY), (255, 0, 0))
    imsave(f'{i}.png', test_img)
