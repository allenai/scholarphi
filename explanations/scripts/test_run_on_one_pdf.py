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


