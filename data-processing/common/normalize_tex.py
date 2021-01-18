import logging
import os.path
import posixpath
import re
from dataclasses import dataclass
from enum import Enum, auto
from typing import List, Optional, Union

from common.scan_tex import Pattern, scan_tex
from common.types import CharacterRange, Path


@dataclass(frozen=True)
class Expansion(CharacterRange):
    tex: str


@dataclass(frozen=True)
class EndInput(CharacterRange):
    pass


class FileDiscoveryStrategy(Enum):
    EXACT = auto()
    INPUT = auto()
    " Emulate behavior of \\input macro by appending '.tex' to a file name if it has no extension. "
    INCLUDE = auto()
    " Emulate behavior of \\include macro by appending '.tex' to all file names. "


# Pre-load a template that can be used to expand the '\include' macro.
with open(os.path.join("resources", "include-expansion.tex")) as file_:
    INCLUDE_EXPANSION = file_.read()


def expand_tex(
    tex_dir: Path,
    tex_name: str,
    discover_by: FileDiscoveryStrategy = FileDiscoveryStrategy.EXACT,
    within: Optional[str] = None,
    is_input: bool = False,
) -> Optional[str]:
    """
    Unify the TeX in a file by combining together TeX from the files. The TeX file to be read is
    'tex_name' and it will be looked for in 'tex_dir'.

    Files can be searched for in the tex_dir according to special rules using the 'discover_by'
    parameter. The parameter can tell the method to resolve the TeX filename using the rules that
    are used by the '\\input'' or '\\include'' macros.

    The 'within' parameter makes sure this function doesn't read files it shouldn't. Input files
    are only expanded if their absolute resolved file path is inside the directory specified by
    'within'. If 'within' is not specified, then it will be set to 'tex_dir'.

    Based loosely on the code from the Perl latexpand utility in TeXLive, which is distributed under a
    BSD license: https://ctan.org/pkg/latexpand?lang=en

    Features not supported by this function are:
    * \\includeonly command (which specifies which \\include scripts to process)
    * handling quotation marks around input or included files. In some cases it will work the
      same as LaTeX does, and in some cases it won't. It seems how files are included
      that have quotes differs by LaTeX version https://tex.stackexchange.com/a/515259/198728
    * expanding files that don't use a 'utf-8'-compatible encoding. TeX files can include
      multiple input encodings, even within the same file. However, this function will not expand
      input that fail to open as UTF-8 files.
    """

    # Resolve path to TeX file, and make sure it's in a valid directory.
    within = os.path.abspath(os.path.realpath(within or tex_dir))
    qualified_tex_path = os.path.abspath(
        os.path.realpath(os.path.join(tex_dir, tex_name))
    )
    if os.path.commonpath([within, qualified_tex_path]) != within:
        logging.warning(  # pylint: disable=logging-not-lazy
            "TeX macro attempted to import file %s which is not in %s. This is forbidden. "
            + "This file will not be expanded.",
            qualified_tex_path,
            within,
        )
        return None

    # Add '.tex' extension to the file name if it is being imported using an '\include' macro.
    if discover_by == FileDiscoveryStrategy.INCLUDE:
        qualified_tex_path += ".tex"
    # Add the '.tex' extension to the file name as done for by the '\input' macro. As mentioned in
    # the TeXBook, "TEX automatically supplies the suffix '.tex' if no suffix has been specified."
    elif discover_by == FileDiscoveryStrategy.INPUT:
        if len(os.path.splitext(qualified_tex_path)[1]) == 0:
            qualified_tex_path += ".tex"

    if not os.path.exists(qualified_tex_path):
        logging.warning(  # pylint: disable=logging-not-lazy
            "Could not find file '%s' in directory '%s'. No text will be read from this file.",
            tex_name,
            tex_dir,
        )
        return None

    input_patterns = [
        # Put patterns with braces before those without braces so they have priority in matching.
        Pattern("input_braces", r"\\input\s*{([^}]+)}"),
        Pattern("input_quotes", r'\\input\s+"([^"]+)"'),
        Pattern("input", r"\\input\s+(\S+)"),
    ]
    # Note that while it's supported here, '\include' seem to be pretty rare in research papers.
    # In a specific sample of about 120 conference papers, only 5 had '\include' macros, yet
    # many more had '\input' commands). Only 1 used an '\include' macro to read in text.
    # The rest of the files used '\include' macros to include macros and usepackage statements.
    # XXX(andrewhead): The 'includes' patterns are currently disabled because the TeX that is
    # being inserted in their place is incorrect (i.e., it causes compilation errors).
    include_patterns: List[Pattern] = [
        # Pattern("include_braces", r"\\include\s*{([^}]+)}"),
        # Pattern("include", r"\\include\s+(\S+)"),
    ]
    endinput_pattern = Pattern("endinput", r"\\endinput( |\t|\b|\{.*?\})")
    patterns = input_patterns + include_patterns + [endinput_pattern]

    # Read TeX for a file.
    with open(qualified_tex_path, encoding="utf-8") as tex_file:
        try:
            tex = tex_file.read()
        except Exception as e:  # pylint: disable=broad-except
            logging.warning(  # pylint: disable=logging-not-lazy
                "Could not read file at %s due to error: %s. The TeX for this file will "
                + "not be expanded",
                qualified_tex_path,
                e,
            )
            return None

    replacements: List[Union[Expansion, EndInput]] = []
    endinputs = []
    end_file_at = None

    # Scan file for input macros, expanding them.
    for match in scan_tex(tex, patterns):

        # If a file is being read as input, and the '\endinput' macro is reached, end output
        # the end of the line that \endinput appears on. See the TeXBook for a description of
        # the how \endinput is expanded.
        if is_input and match.pattern is endinput_pattern:

            endinput = EndInput(start=match.start, end=match.end)
            replacements.append(endinput)
            endinputs.append(endinput)

            # Find the newline after the \endinput, after which no more inputs should be expanded
            # and the file should be truncated.
            end_of_line = re.compile("$", flags=re.MULTILINE)
            end_of_line_match = end_of_line.search(tex, pos=match.end)
            if end_of_line_match:
                end_file_at = end_of_line_match.start()
                continue

        # Re-run the pattern against the matched text to extract the path to the file
        # that is meant to be included.
        match_with_groups = re.match(match.pattern.regex, match.text)
        if match_with_groups is None or len(match_with_groups.groups()) < 1:
            logging.warning(  # pylint: disable=logging-not-lazy
                "Unexpected error in extracting path for input / include command %s using "
                + "regular expression %s",
                match.text,
                match.pattern.regex,
            )
            continue
        input_path = match_with_groups.group(1)

        # Clean up the path
        # In TeX, paths are specified in Unix format. Convert to platform-specific path format
        # to let the program search for and read the file.
        input_path = input_path.strip().replace(posixpath.sep, os.path.sep)

        # Expand the input by reading in the expanded text in the input file.
        discovery_strategy = (
            FileDiscoveryStrategy.INCLUDE
            if match.pattern in include_patterns
            else FileDiscoveryStrategy.INPUT
        )
        input_tex = expand_tex(
            # All inputs from expanded files will be resolved relative to the main
            # directory of the project (i.e., the one where the TeX executable is invoked):
            # https://tex.stackexchange.com/a/39084/198728
            tex_dir,
            input_path,
            discover_by=discovery_strategy,
            is_input=True,
            # Specify the 'within' parameter to make sure that all expanded files reside
            # in the directory where the main TeX file was expanded.
            within=within,
        )
        if input_tex is None:
            logging.warning(  # pylint: disable=logging-not-lazy
                "Could not read input TeX file %s included from file %s in directory %s. "
                + "This input macro will not be expanded.",
                input_path,
                tex_name,
                tex_dir,
            )
            continue

        if match.pattern in include_patterns:
            input_tex = INCLUDE_EXPANSION.replace("<CONTENTS>", input_tex)
            input_tex = input_tex.replace("<FILENAME>", input_path)

        replacements.append(Expansion(start=match.start, end=match.end, tex=input_tex))

    # Apply the expansions to the TeX.
    expanded = tex
    if end_file_at is not None:
        expanded = expanded[:end_file_at]

    for replacement in reversed(replacements):
        if end_file_at is not None and replacement.start > end_file_at:
            continue
        if isinstance(replacement, EndInput):
            expanded = expanded[: replacement.start] + "" + expanded[replacement.end :]
            continue
        if isinstance(replacement, Expansion):
            expanded = (
                expanded[: replacement.start]
                + replacement.tex
                + expanded[replacement.end :]
            )

    return expanded
