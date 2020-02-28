import configparser
import csv
import logging
import os
import os.path
import re
import subprocess
from typing import Iterator, List

from common import file_utils
from common.types import CompilationResult, OutputFile

COMPILE_CONFIG = "config.ini"
PDF_MESSAGE_PREFIX = b"Generated PDF: "
PDF_MESSAGE_SUFFIX = b"<end of PDF name>"
POSTSCRIPT_MESSAGE_PREFIX = b"Generated PostScript: "
POSTSCRIPT_MESSAGE_SUFFIX = b"<end of PostScript name>"


def _get_generated_pdfs(stdout: bytes) -> List[str]:
    pdfs = re.findall(
        PDF_MESSAGE_PREFIX + b"(.*)" + PDF_MESSAGE_SUFFIX, stdout, flags=re.MULTILINE
    )
    return [pdf_name_bytes.decode("utf-8") for pdf_name_bytes in pdfs]


def _get_generated_postscript_filenames(stdout: bytes) -> List[str]:
    postscript_filenames = re.findall(
        POSTSCRIPT_MESSAGE_PREFIX + b"(.*)" + POSTSCRIPT_MESSAGE_SUFFIX,
        stdout,
        flags=re.MULTILINE,
    )
    return [
        postscript_name_bytes.decode("utf-8")
        for postscript_name_bytes in postscript_filenames
    ]


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
    config.read(COMPILE_CONFIG)
    texlive_path = config["tex"]["texlive_path"]
    texlive_bin_path = config["tex"]["texlive_bin_path"]
    if "perl" in config and "binary" in config["perl"]:
        perl_binary = config["perl"]["binary"]
    else:
        perl_binary = "perl"

    result = subprocess.run(
        [
            perl_binary,
            os.path.join("perl", "compile_tex.pl"),
            sources_dir,
            texlive_path,
            texlive_bin_path,
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )

    output_files: List[OutputFile] = []
    success = False
    if result.returncode == 0:
        for pdf_filename in _get_generated_pdfs(result.stdout):
            output_files.append(OutputFile("pdf", pdf_filename))
        for postscript_filename in _get_generated_postscript_filenames(result.stdout):
            output_files.append(OutputFile("ps", postscript_filename))
        success = True

    return CompilationResult(success, output_files, result.stdout, result.stderr)


def get_output_files(compiled_tex_dir: str) -> List[OutputFile]:
    """
    Get a list of output files for a directory of compiled TeX.
    """
    compilation_results_dir = os.path.join(compiled_tex_dir, "compilation_results")
    result_path = os.path.join(compilation_results_dir, "result")
    with open(result_path) as result_file:
        result = result_file.read().strip()
        if result == "True":
            output_files_path = os.path.join(
                compilation_results_dir, "output_files.csv"
            )
            output_files = list(file_utils.load_from_csv(output_files_path, OutputFile))
            return output_files

    return []


def get_errors(tex_engine_output: bytes, context: int = 5) -> Iterator[bytes]:
    """
    Extract a list of TeX errors from the TeX compiler's output. 'context' is the number of
    lines to extract after each error symbol ('!'). The list of errors produced by this method may
    be inaccurate and incomplete.
    """
    lines = tex_engine_output.splitlines()
    for i, line in enumerate(lines):
        if line.startswith(b"!"):
            yield b"\n".join(lines[i : i + context])


def is_driver_unimplemented(tex_engine_output: bytes) -> bool:
    # This string should be exactly the same as the one that we program the color command to emit
    # when no driver is found, in 'color_commands.tex'.
    return br"Coloring not implemented for driver" in tex_engine_output
