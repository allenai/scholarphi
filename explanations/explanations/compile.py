import configparser
import logging
import re
import subprocess
from typing import List

CONFIG_FILE = "config.ini"
PDF_MESSAGE_PREFIX = "Generated PDF: "
PDF_MESSAGE_SUFFIX = "<end of PDF name>"


def _get_generated_pdfs(stdout: str) -> List[str]:
    pdfs = re.findall(
        PDF_MESSAGE_PREFIX + "(.*)" + PDF_MESSAGE_SUFFIX, stdout, flags=re.MULTILINE
    )
    return pdfs


def compile_tex(sources_dir: str) -> List[str]:
    """
    Compile TeX sources into PDFs. Requires running an external script to attempt to compile
    the TeX. See README.md for dependencies.
    """
    logging.debug("Compiling sources in %s", sources_dir)
    config = configparser.ConfigParser()
    config.read(CONFIG_FILE)
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
            "Failed to compile TeX. Stderr from compilation:\n%s", result.stderr
        )

    return pdfs
