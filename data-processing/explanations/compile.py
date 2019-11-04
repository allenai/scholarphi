import configparser
import csv
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


def _get_generated_pdfs(stdout: bytes) -> List[str]:
    pdfs = re.findall(
        PDF_MESSAGE_PREFIX + b"(.*)" + PDF_MESSAGE_SUFFIX, stdout, flags=re.MULTILINE
    )
    return [pdf_name_bytes.decode("utf-8") for pdf_name_bytes in pdfs]


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


def get_compiled_pdfs(compiled_tex_dir: str) -> List[str]:
    """
    Get a list of paths to compiled PDFs in a directory of compiled TeX.
    Returned paths are relative to the working directory of compilation. In most cases, this will
    either be relative to <data-directory>/<arxiv-id>, or to <data-directory>/<arxiv-id>/<iteration>/
    """
    compilation_results_dir = os.path.join(compiled_tex_dir, "compilation_results")
    result_path = os.path.join(compilation_results_dir, "result")
    with open(result_path) as result_file:
        result = result_file.read().strip()
        if result == "True":
            pdf_paths = []
            pdf_names_path = os.path.join(compilation_results_dir, "pdf_names.csv")
            with open(pdf_names_path) as pdf_names_file:
                reader = csv.reader(pdf_names_file)
                for row in reader:
                    pdf_paths.append(row[1])
            return pdf_paths

    return []
