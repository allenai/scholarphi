import configparser
import logging
import os
import os.path
import re
import subprocess
from typing import Iterator, List, Optional

from common import file_utils
from common.types import CompilationResult, CompiledTexFile, OutputFile, RelativePath

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
    logging.debug("Compiling sources in %s.", sources_dir)
    tex_files = [f for f in os.listdir(sources_dir) if f.endswith(".tex")]
    if not tex_files:
        logging.warning("No .tex files found in %s.", sources_dir)

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

    compiled_tex_files: List[CompiledTexFile] = []
    output_files: List[OutputFile] = []
    success = False
    if result.returncode == 0:
        for pdf_filename in _get_generated_pdfs(result.stdout):
            output_files.append(OutputFile("pdf", pdf_filename))
        for postscript_filename in _get_generated_postscript_filenames(result.stdout):
            output_files.append(OutputFile("ps", postscript_filename))
        compiled_tex_files = get_compiled_tex_files_from_autotex_output(result.stdout)
        success = True

    logging.debug(
        "Finished compilation attempt for sources in %s. Success? %s.",
        sources_dir,
        success,
    )

    return CompilationResult(
        success, compiled_tex_files, output_files, result.stdout, result.stderr
    )


def get_compiled_tex_files_from_autotex_output(
    tex_engine_output: bytes,
) -> List[CompiledTexFile]:
    processed_tex_files = re.findall(
        rb"\[verbose\]:  ~~~~~~~~~~~ Processing file '(.*?)'", tex_engine_output
    )
    failed_tex_files = re.findall(
        rb"<(.*?)> appears to be tex-type, but was neither included nor processable:",
        tex_engine_output,
    )
    return [
        CompiledTexFile(filename.decode("utf-8"))
        for filename in processed_tex_files
        if filename not in failed_tex_files and not filename.endswith(b".dvi")
    ]


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


COMPILER_RUNNING_PATTERN = re.compile(r"[~]+ Running (.*?) for the first time [~]+")


def get_last_autotex_compiler(autotex_log: str) -> Optional[str]:
    compiler_names = COMPILER_RUNNING_PATTERN.findall(autotex_log)
    if compiler_names and isinstance(compiler_names[-1], str):
        return compiler_names[-1]
    return None


def get_compilation_logs(autotex_log: str, compiler_name: str) -> List[str]:
    """
    Get AutoTeX logs for a specific TeX compiler that was attempted.
    May return multiple logs, one for each pass of that compiler. There may be multiple
    passes of a compiler as AutoTeX may run a compiler multiple times to resolve citations
    and other references in the document.
    """

    current_compiler = None
    log_start = None
    logs: List[str] = []

    for match in COMPILER_RUNNING_PATTERN.finditer(autotex_log):
        if log_start is not None and current_compiler == compiler_name:
            logs.append(autotex_log[log_start : match.start()])

        log_start = match.end()
        current_compiler = match.group(1)

    if current_compiler == compiler_name:
        logs.append(autotex_log[log_start : len(autotex_log)])

    return logs


def did_compilation_fail(autotex_log: str, compiler_name: str) -> bool:
    EMERGENCY_STOP_PATTERN = re.compile(r"^! Emergency stop.", flags=re.MULTILINE)
    for log in get_compilation_logs(autotex_log, compiler_name):
        if EMERGENCY_STOP_PATTERN.search(log) is not None:
            return True
    return False


EntityId = str


def get_last_colorized_entity_id(
    autotex_log: str, compiler_name: str
) -> Optional[EntityId]:
    logs = get_compilation_logs(autotex_log, compiler_name)
    if len(logs) == 0:
        return None

    # Only search for colorization commands in the logs for the last pass of the compiler.
    entity_ids = re.findall(r"S2: Colorized entity '(.*?)'\.", logs[-1])
    if entity_ids and isinstance(entity_ids[-1], str):
        return entity_ids[-1]

    return None


"""
Below are helpers for inspecting summaries of compilation results saved by the pipeline.
"""


def _get_compilation_results_dir(compiled_tex_dir: RelativePath) -> RelativePath:
    return os.path.join(compiled_tex_dir, "compilation_results")


def _did_compilation_succeed(compiled_tex_dir: RelativePath) -> bool:
    result_path = os.path.join(_get_compilation_results_dir(compiled_tex_dir), "result")
    if not os.path.exists(result_path):
        return False
    with open(result_path) as result_file:
        result = result_file.read().strip()
        return result == "True"


def get_output_files(compiled_tex_dir: RelativePath) -> List[OutputFile]:
    " Get a list of output files for a directory of compiled TeX. "
    if _did_compilation_succeed(compiled_tex_dir):
        output_files_path = os.path.join(
            _get_compilation_results_dir(compiled_tex_dir), "output_files.csv"
        )
        if not os.path.exists(output_files_path):
            logging.warning(  # pylint: disable=logging-not-lazy
                "Although compilation succeeded for TeX compilation in directory %s, no "
                + "output files were produced. Something unexpected must have happened during "
                + "compilation of the TeX.",
                compiled_tex_dir,
            )
            return []
        output_files = list(file_utils.load_from_csv(output_files_path, OutputFile))
        return output_files

    return []


def get_compiled_tex_files(compiled_tex_dir: RelativePath) -> List[CompiledTexFile]:
    " Get a list of TeX files that were successfully compiled. "
    if _did_compilation_succeed(compiled_tex_dir):
        compiled_tex_files_path = os.path.join(
            _get_compilation_results_dir(compiled_tex_dir), "compiled_tex_files.csv"
        )
        if not os.path.exists(compiled_tex_files_path):
            logging.warning(  # pylint: disable=logging-not-lazy
                "Although compilation succeeded for TeX compilation in directory %s, no "
                + "specific TeX files were logged as having been compiled. Something "
                + "unexpected must have happened during compilation of the TeX.",
                compiled_tex_dir,
            )
            return []
        compiled_tex_files = list(
            file_utils.load_from_csv(compiled_tex_files_path, CompiledTexFile)
        )
        return compiled_tex_files

    return []
