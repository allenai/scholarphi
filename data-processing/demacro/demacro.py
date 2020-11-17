PAPER_LATEX_DIRNAME = 'data-processing/'
NEW_STY_FILENAME = 'something-private.sty'
DEMACRO_BIN_PATH = ''

from typing import List, Optional

import os
from glob import glob
from shutil import copyfile

import subprocess


def find_macro_lines(lines: List[str]) -> List[int]:
    out = []
    for i, line in enumerate(lines):
        is_comment = line.startswith('%')
        is_command = 'newcommand' in line or 'renewcommand' in line  or 'newenvironment' in line or 'renewenvironment' in line
        if not is_comment and is_command:
            out.append(i)
    return out



def prep_demacro_tex_file(infile: str) -> None:
    """Written sorta assuming a single *.tex file"""
    #
    #  backup original
    #
    copyfile(src=infile, dst=f"{infile}.backup")
    #
    #  read original
    #
    with open(infile) as f_in:
        old_lines = [line for line in f_in]
        index_macro_lines = find_macro_lines(lines=old_lines)
    #
    #  create new tex file
    #
    inserted_sty_import = False
    new_lines = []
    for i, old_line in enumerate(old_lines):
        if i in index_macro_lines:
            new_lines.append('%' + old_line)    # comment out old commands
        else:
            new_lines.append(old_line)
        if inserted_sty_import is False and old_line.startswith('\\usepackage{'):
            new_lines.append("\\usepackage{" + os.path.splitext(NEW_STY_FILENAME)[0] + "}")     # insert after first \usepackage
            inserted_sty_import = True
    with open(infile, 'w') as f_out:
        for new_line in new_lines:
            f_out.write(new_line)
    #
    #  create new sty file; append (handles multi TeX directories)
    #
    sty_file = os.path.join(os.path.dirname(infile), NEW_STY_FILENAME)
    with open(sty_file, 'a+') as f_out:
        for j in index_macro_lines:
            f_out.write(old_lines[j])



def run_demacro(infile: str) -> str:
    result = subprocess.run(
        [
            os.path.join(DEMACRO_BIN_PATH, 'de-macro'),
            infile
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    outfile = infile.replace('.tex', '-clean.tex')
    if result.returncode == 0:
        if os.path.exists(outfile):
            return outfile
        raise Exception(f'De-macro ran fine, but cant find {outfile}')
    else:
        raise Exception(f'De-macro failed with return code {result.returncode}')




def validate_worked(infile: str) -> bool:
    return os.path.exists(infile.replace('.tex', '.pdf'))


def validate_same_pdf(original_pdf: str, new_pdf: str) -> bool:
    pass


if __name__ == '__main__':
    for infile in glob(os.path.join(PAPER_LATEX_DIRNAME, '*/*.tex')):
        prep_demacro_tex_file(infile=infile)
        new_infile = run_demacro(infile=infile)
        validate_worked(infile=new_infile)

