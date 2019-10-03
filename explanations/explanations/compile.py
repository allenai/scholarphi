import configparser
import logging
import os
import re
import subprocess
from typing import List

TEX_CONFIG = "config.ini"
PDF_MESSAGE_PREFIX = "Generated PDF: "
PDF_MESSAGE_SUFFIX = "<end of PDF name>"


def _get_generated_pdfs(stdout: str) -> List[str]:
    pdfs = re.findall(
        PDF_MESSAGE_PREFIX + "(.*)" + PDF_MESSAGE_SUFFIX, stdout, flags=re.MULTILINE
    )
    return pdfs


def _clean_sources_dir(sources_dir: str):
    """
    AutoTeX doesn't compile a sources directory if it includes certain files from a past
    compilation. Clean the directory of those files.
    """
    for filename in os.listdir(sources_dir):
        if filename.endswith(".synctex.gz"):
            path = os.path.join(sources_dir, filename)
            if os.path.isfile(path) and not os.path.islink(path):
                os.remove(path)


def compile_tex(sources_dir: str) -> List[str]:
    """
    Compile TeX sources into PDFs. Requires running an external script to attempt to compile
    the TeX. See README.md for dependencies.
    """
    logging.debug("Compiling sources in %s", sources_dir)

    _clean_sources_dir(sources_dir)

    config = configparser.ConfigParser()
    config.read(TEX_CONFIG)
    texlive_path = config["tex"]["texlive_path"]
    texlive_bin_path = config["tex"]["texlive_bin_path"]

    result = subprocess.run(
        ["./compile_tex.pl", sources_dir, texlive_path, texlive_bin_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        encoding="utf-8",
    )

    pdfs: List[str] = []
    if result.returncode == 0:
        stdout = result.stdout
        pdfs = _get_generated_pdfs(stdout)
        logging.debug("Successfully compiled TeX. Generated PDFs %s", str(pdfs))
    else:
        logging.error(
            "Failed to compile TeX.\nStdout from compilation:\n%s\n\nStderr from compilation:\n%s",
            result.stdout,
            result.stderr,
        )

    return pdfs
