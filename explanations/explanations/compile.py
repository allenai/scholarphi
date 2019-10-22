import configparser
import logging
import os
import os.path
import re
import subprocess
from typing import List

from explanations.types import CompilationResult

TEX_CONFIG = "config.ini"
PDF_MESSAGE_PREFIX = b"Generated PDF: "
PDF_MESSAGE_SUFFIX = b"<end of PDF name>"


def _get_generated_pdfs(stdout: bytes) -> List[bytes]:
    pdfs = re.findall(
        PDF_MESSAGE_PREFIX + b"(.*)" + PDF_MESSAGE_SUFFIX, stdout, flags=re.MULTILINE
    )
    return pdfs


def _set_sources_dir_permissions(sources_dir: str) -> None:
    """
    AutoTeX requires permissions to be 0777 or 0775 before attempting compilation.
    """
    COMPILATION_PERMISSIONS = 0o775
    os.chmod(sources_dir, COMPILATION_PERMISSIONS)
    for (dirpath, dirnames, filenames) in os.walk(sources_dir):
        for filename in filenames:
            os.chmod(os.path.join(dirpath, filename), COMPILATION_PERMISSIONS)
        for dirname in dirnames:
            os.chmod(os.path.join(dirpath, dirname), COMPILATION_PERMISSIONS)


def compile_tex(sources_dir: str) -> CompilationResult:
    """
    Compile TeX sources into PDFs. Requires running an external script to attempt to compile
    the TeX. See README.md for dependencies.
    """
    logging.debug("Compiling sources in %s", sources_dir)
    _set_sources_dir_permissions(sources_dir)

    config = configparser.ConfigParser()
    config.read(TEX_CONFIG)
    texlive_path = config["tex"]["texlive_path"]
    texlive_bin_path = config["tex"]["texlive_bin_path"]

    result = subprocess.run(
        [
            os.path.join("perl", "compile_tex.pl"),
            sources_dir,
            texlive_path,
            texlive_bin_path,
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    pdfs = None
    success = False
    if result.returncode == 0:
        pdfs = _get_generated_pdfs(result.stdout)
        success = True

    return CompilationResult(success, pdfs, result.stdout, result.stderr)
