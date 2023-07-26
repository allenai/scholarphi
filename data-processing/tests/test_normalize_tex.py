import os.path
import posixpath
from tempfile import TemporaryDirectory
from typing import Dict

from common.expand_input import expand_tex
from common.types import Path, RelativePath


def create_temp_files(
    dir_path: Path, contents_by_path: Dict[RelativePath, str]
) -> None:
    for path, contents in contents_by_path.items():
        with open(os.path.join(dir_path, path), "w") as main_tex_file:
            main_tex_file.write(contents)


def test_unify_tex():
    with TemporaryDirectory() as tex_dir:
        create_temp_files(
            tex_dir, {"main.tex": r"\input{other.tex}", "other.tex": "Hello world!"},
        )
        assert expand_tex(tex_dir, "main.tex") == "Hello world!"


def test_unify_tex_with_input_without_tex_extension():
    with TemporaryDirectory() as tex_dir:
        create_temp_files(
            tex_dir, {"main.tex": r"\input{other}", "other.tex": "Hello world!"},
        )
        assert expand_tex(tex_dir, "main.tex") == "Hello world!"


def test_unify_tex_with_input_with_absolute_path():
    with TemporaryDirectory() as tex_dir:
        file_contents = {}
        # TeX paths are expected in Unix convention. This conversion of the path makes it
        # more likely that this test code will run correctly on Windows computers.
        absolute_input_path = os.path.join(tex_dir, "other.tex")
        absolute_posix_input_path = absolute_input_path.replace(os.sep, posixpath.sep)
        file_contents["main.tex"] = rf"\input{{{absolute_posix_input_path}}}"
        file_contents[absolute_input_path] = "Hello world!"
        create_temp_files(tex_dir, file_contents)
        assert expand_tex(tex_dir, "main.tex") == "Hello world!"


def test_unify_tex_with_relative_input():
    with TemporaryDirectory() as tex_dir:
        file_contents = {}
        tex_dir_basename = os.path.basename(tex_dir)
        file_contents["main.tex"] = rf"\input{{../{tex_dir_basename}/other.tex}}"
        file_contents["other.tex"] = "Hello world!"
        create_temp_files(tex_dir, file_contents)
        assert expand_tex(tex_dir, "main.tex") == "Hello world!"


def test_do_not_unify_with_tex_files_outside_of_directory():
    with TemporaryDirectory() as tex_dir, TemporaryDirectory() as other_dir:
        forbidden_input_path = os.path.join(other_dir, "other.tex")
        forbidden_posix_input_path = forbidden_input_path.replace(os.sep, posixpath.sep)
        create_temp_files(other_dir, {"other.tex": "Hello world!"})
        create_temp_files(
            tex_dir, {"main.tex": rf"\input{{{forbidden_posix_input_path}}}"}
        )
        assert (
            expand_tex(tex_dir, "main.tex")
            == rf"\input{{{forbidden_posix_input_path}}}"
        )


def test_unify_with_inputs_from_inputs_in_child_directory():
    with TemporaryDirectory() as tex_dir:
        child_dir = os.path.join(tex_dir, "child_dir")
        os.makedirs(child_dir)
        create_temp_files(
            tex_dir,
            {"main.tex": r"\input{child_dir/other1}", "other2.tex": "Hello world!"},
        )
        create_temp_files(child_dir, {"other1.tex": r"\input{other2.tex}"})
        assert expand_tex(tex_dir, "main.tex") == "Hello world!"


def test_unify_tex_with_input_without_braces():
    with TemporaryDirectory() as tex_dir:
        create_temp_files(
            tex_dir, {"main.tex": r"\input other.tex", "other.tex": "Hello world!"},
        )
        assert expand_tex(tex_dir, "main.tex") == "Hello world!"


def test_unify_tex_leave_reference_to_input_that_was_not_found():
    with TemporaryDirectory() as tex_dir:
        create_temp_files(
            tex_dir,
            {
                # In this test case, there is no other.tex file. So the macro won't be expanded.
                "main.tex": r"\input{other.tex}"
            },
        )
        assert expand_tex(tex_dir, "main.tex") == r"\input{other.tex}"


def test_unify_tex_with_nested_input():
    with TemporaryDirectory() as tex_dir:
        create_temp_files(
            tex_dir,
            {
                "main.tex": r"\input{other1.tex}",
                "other1.tex": r"\input{other2.tex}",
                "other2.tex": "Hello world!",
            },
        )
        assert expand_tex(tex_dir, "main.tex") == "Hello world!"


def test_unify_tex_stop_input_after_line_with_endinput():
    with TemporaryDirectory() as tex_dir:
        create_temp_files(
            tex_dir,
            {
                "main.tex": ("\\input{other.tex}\n" + "Text after input macro."),
                "other.tex": (
                    "Hello world!\n"
                    + "Text before endinput.\\endinput Text after endinput. % Comment\n"
                    + "Text on line after endinput."
                ),
            },
        )
        assert expand_tex(tex_dir, "main.tex") == (
            "Hello world!\n"
            + "Text before endinput.Text after endinput. % Comment\n"
            + "Text after input macro."
        )


def test_expand_input_on_same_line_after_endinput():
    with TemporaryDirectory() as tex_dir:
        create_temp_files(
            tex_dir,
            {
                "main.tex": "\\input{other1.tex}",
                "other1.tex": "other1 content.\\endinput\\input{other2.tex}\\endinput",
                "other2.tex": "other2 content.",
            },
        )
        assert expand_tex(tex_dir, "main.tex") == "other1 content.other2 content."


def test_unify_tex_with_input_with_spaces_in_path():
    with TemporaryDirectory() as tex_dir:
        create_temp_files(
            tex_dir,
            {"main.tex": r"\input{other file.tex}", "other file.tex": "Hello world!"},
        )
        assert expand_tex(tex_dir, "main.tex") == "Hello world!"


# XXX(andrewhead): This test is temporarily disabled while the expansion of
# include commands is fixed. See the implementation of the 'normalize_tex' function for details.
# def test_unify_tex_with_include():
#     with TemporaryDirectory() as tex_dir:
#         create_temp_files(
#             tex_dir, {"main.tex": r"\include{other}", "other.tex": "Hello world!"},
#         )
#         expanded = expand_tex(tex_dir, "main.tex")
#         assert "Hello world!" in expanded
#         assert r"\clearpage" in expanded
#         assert r"\@input{other.aux}" in expanded


def test_unify_tex_with_include_ignore_non_tex_files_with_same_filename():
    with TemporaryDirectory() as tex_dir:
        create_temp_files(
            tex_dir, {"main.tex": r"\include{other}", "other.aux": "Junk contents"},
        )
        assert expand_tex(tex_dir, "main.tex") == r"\include{other}"


def test_file_name_with_spaces_and_quotes():
    with TemporaryDirectory() as tex_dir:
        create_temp_files(
            tex_dir,
            {"main.tex": r'\input "do expand"', "do expand.tex": "Hello world!",},
        )
        assert expand_tex(tex_dir, "main.tex") == "Hello world!"
