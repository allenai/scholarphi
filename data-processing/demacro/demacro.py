PAPER_LATEX_DIRNAME = '/data-processing/data/06-normalized-sources/'
NEW_STY_FILENAME = 'something-private.sty'
DEMACRO_BIN_PATH = '/de-macro/de-macro'

LATEX_COMMAND_NAMES = ['newcommand', 'renewcommand']  #or 'newenvironment' in line or 'renewenvironment' in line

from typing import List, Optional

import os
from glob import glob
from shutil import copyfile

from collections import defaultdict
import subprocess


# TODO: doesnt catch:
# \DeclareMathOperator*{\argmax}{arg\,max}
# \DeclareMathOperator*{\argmin}{arg\,min}
def find_macro_lines(lines: List[str]) -> List[int]:
    out = []
    for i, line in enumerate(lines):
        is_comment = line.startswith('%')
        is_command = any([cmd in line for cmd in LATEX_COMMAND_NAMES])
        if not is_comment and is_command:
            out.append(i)
    return out


def _find_multiline_command(lines: List[str], index_search_start: int, index_search_stop: int) -> List[int]:
    """
    # input
    lines = [
        'bla',
        '',
        '\\newcommand{\\udensdot}[1]',
            '{',
                '\\tikz[baseline=(todotted.base)]{',
                '\\node[inner sep=1pt,outer sep=0pt] (todotted) {#1};',
                '\\draw[gray, densely dotted] (todotted.south west) -- (todotted.south east);',
            '}',
        '}',
        '',
        'blaa'
        '\\newcommand{\\other}[][]{'
    ]
    index_search_start, index_search_stop = 2, 11               this should be a reasonable guess for the bounds of a \command

    # output
    span = [2,8]

    for each `\newcommand` line:
   search forward & see if the first character is `{`.  if so, then:
      parentheses = stack('{')
      while parentheses is not empty:
          scan forward.
          if read '{' or '}':
               check stack.top() if closes it up.  if so, pop both
               else, add to stack
    """
    one_long_string = '\n'.join([line for line in lines[index_search_start:index_search_stop]])
    stack = list()

    # check if this is beginning of a command (e.g. \newcommand)
    line = lines[index_search_start]
    cmds_in_line = [cmd for cmd in LATEX_COMMAND_NAMES if cmd in line]
    if not cmds_in_line:
        raise Exception(f'These lines {lines} dont begin with one of the latex commands {LATEX_COMMAND_NAMES}')
    elif len(cmds_in_line) > 1:
        raise Exception(f'Why are there multiple commands appearing in this first line: {lines}')
    elif len(cmds_in_line) == 1:
        index_char_start = line.index(cmds_in_line[0])
        index_char_stop = index_char_start + len(cmds_in_line[0])
        assert line[index_char_start:index_char_stop] == cmds_in_line[0]
    else:
        raise Exception(f'Wats happening here?')


    # scan forward, consuming first set of curly braces, which defines the macro
    for line in lines:


    stack = list()




    for cmd in LATEX_COMMAND_NAMES:
        if cmd in one_long_string:
            one_long_string.index()

    # scan forward until find '{'
    for c in one_long_string:




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
            new_lines.append("\\usepackage{" + os.path.splitext(NEW_STY_FILENAME)[0] + "}\n")     # insert after first \usepackage
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
            DEMACRO_BIN_PATH,
            infile
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
        cwd=os.path.dirname(infile)
    )
    outfile = infile.replace('.tex', '-clean.tex')
    if result.returncode == 0:
        if os.path.exists(outfile):
            return outfile
        raise Exception(f'De-macro ran fine, but cant find {outfile}')
    else:
        raise Exception(f'De-macro failed with return code {result.returncode}: {result}')




def validate_worked(infile: str) -> bool:
    return os.path.exists(infile)
    # return os.path.exists(infile.replace('.tex', '.pdf'))


def validate_same_pdf(original_pdf: str, new_pdf: str) -> bool:
    pass


def inspect(indir: str):
    print(f'====== Macros ======')
    with open(os.path.join(indir, 'something-private.sty')) as f_in:
        for line in f_in:
            print(line)
    print()
    print()


# if __name__ == '__main__':
succeeded = set()
fail_to_errors = defaultdict(list)
for infile in glob(os.path.join(PAPER_LATEX_DIRNAME, '*/*.tex')):
    arxiv_id = os.path.basename(os.path.dirname(infile))
    prep_demacro_tex_file(infile=infile)
    try:
        new_infile = run_demacro(infile=infile)
        if validate_worked(infile=new_infile):
            succeeded.add(arxiv_id)
            print(f'Demacro success on {infile}')
        else:
            fail_to_errors[arxiv_id].append(f'Demacro ran but no output on {infile}')
    except Exception as e:
        fail_to_errors[arxiv_id].append(f'Demacro failed on {infile} with error {e}')

print(f'Num all success: {len(succeeded)}')
print(f'Num failed: {len(fail_to_errors)}')
