"""

Functions and script for analyzing normalization output.  Does a lot of comparisons between 05- and 06- outputs.

"""

import os
import subprocess
import difflib
import json


def count_file_lines(infile: str) -> int:
    with open(infile) as f_in:
        lines = f_in.readlines()
        return len(lines)


def recursively_get_all_tex_paths_in_latex_project(indir: str) -> list:
    out = []
    for fname in os.listdir(indir):
        # skip any compilation results
        if os.path.isdir(os.path.join(indir, fname)) and fname.startswith('compilation_results'):
            continue
        if fname == 'compilation_results.csv':
            continue

        # recurse if there's another directory
        if os.path.isdir(os.path.join(indir, fname)):
            fnames = recursively_get_all_tex_paths_in_latex_project(indir=os.path.join(indir, fname))
            out.extend(fnames)
        # if it's a file, then skip specific ones we dont care about
        elif not fname.endswith('.tex') or fname.startswith('xxxpdfpages'):  # these are weird
            continue
        # keep everything remaining (.tex files)
        else:
            out.append(os.path.join(indir, fname))
    return out


def compute_tex_fname_to_lines(indir: str) -> dict:
    tex_file_to_lines = {}
    for tex_path in recursively_get_all_tex_paths_in_latex_project(indir=indir):
        fname = tex_path.replace(indir, '')
        while fname.startswith('/'):
            fname = fname[1:]
        tex_file_to_lines[fname] = count_file_lines(infile=tex_path)
    return tex_file_to_lines


def which_files_changed(before_tex_file_to_lines: dict, after_tex_file_to_lines: dict) -> dict:
    changed_fname_to_diff = {}
    for fname in before_tex_file_to_lines.keys():
        if before_tex_file_to_lines[fname] < after_tex_file_to_lines[fname]:
            changed_fname_to_diff[fname] = f'{before_tex_file_to_lines[fname]} -> {after_tex_file_to_lines[fname]}'
        elif before_tex_file_to_lines[fname] > after_tex_file_to_lines[fname]:
            changed_fname_to_diff[fname] = f'{after_tex_file_to_lines[fname]} -> {before_tex_file_to_lines[fname]}'
        else:
            continue
    return changed_fname_to_diff


def summarize_latex_project(arxiv_id: str, stage_dirname: str):
    """
    summarize_latex_project('1611.00471', BEFORE_DIR)
    summarize_latex_project('1611.00471', AFTER_DIR)

    """
    from pprint import pprint
    tex_file_to_lines = compute_tex_fname_to_lines(os.path.join(stage_dirname, arxiv_id))
    pprint(tex_file_to_lines)


def diff_arxiv_id_before_after(arxiv_id: str, before_dir: str, after_dir: str):
    """
    Useful for debugging.

    For example, let's say I've found an arXiv ID for which:
        len(changed_fname_to_diff) == 1 and len(before_tex_file_to_lines) > 1
    That is, only a single latex file is different within a project that has multiple latex files.
    This should be a successful normalization.

    To see what's going on, execute:
        diff_arxiv_id_before_after('1611.01929', BEFORE_DIR, AFTER_DIR)     >> should be a huge diff

        diff_arxiv_id_before_after('1701.02096', BEFORE_DIR, AFTER_DIR)

    Which will print the diff'ed lines to screen.
    """
    fnames = list(compute_tex_fname_to_lines(indir=os.path.join(before_dir, arxiv_id)).keys())
    for fname in fnames:
        with open(os.path.join(before_dir, arxiv_id, fname)) as f_in:
            before_lines = f_in.readlines()
        with open(os.path.join(after_dir, arxiv_id, fname)) as f_in:
            after_lines = f_in.readlines()
        diff_lines = difflib.unified_diff(a=before_lines, b=after_lines, fromfile=before_dir, tofile=after_dir)
        for diff_line in diff_lines:
            print(diff_line.strip())



if __name__ == '__main__':
    BEFORE_DIR = '/data-processing/data/05-compiled-sources/'
    AFTER_DIR = '/data-processing/data/06-normalized-sources/'

    OUTFILE = '/data-processing/data/arxiv_id_to_filename.json'

    before_arxiv_ids = sorted(os.listdir(BEFORE_DIR))
    after_arxiv_ids = sorted(os.listdir(AFTER_DIR))
    assert before_arxiv_ids == after_arxiv_ids

    normalization_situation_to_arxiv_ids = {
        'multiple_tex_files_multiple_changed': [],
        'multiple_tex_files_only_1_changed': [],
        'multiple_tex_files_and_no_change': [],
        'single_tex_file_and_it_changed': [],
        'single_tex_file_and_no_change': [],
    }

    arxiv_id_to_main_tex_filepath = {}

    for arxiv_id in before_arxiv_ids:
        before_tex_file_to_lines = compute_tex_fname_to_lines(indir=os.path.join(BEFORE_DIR, arxiv_id))
        after_tex_file_to_lines = compute_tex_fname_to_lines(indir=os.path.join(AFTER_DIR, arxiv_id))

        # check if same number of files
        if len(before_tex_file_to_lines) != len(after_tex_file_to_lines):
            print(f'{arxiv_id} different number files after normalization')
            print(f'\t{set(before_tex_file_to_lines.keys()).difference(set(after_tex_file_to_lines.keys()))} lost from Before --> After')
            print(f'\t{set(after_tex_file_to_lines.keys()).difference(set(before_tex_file_to_lines.keys()))} gained when Before --> After')

        # check which files have different number of lines
        changed_fname_to_diff = which_files_changed(before_tex_file_to_lines, after_tex_file_to_lines)

        # multiple files changed.  why?  weird...
        if len(changed_fname_to_diff) > 1:
            normalization_situation_to_arxiv_ids['multiple_tex_files_multiple_changed'].append(arxiv_id)
            print(f'For {arxiv_id}, {len(changed_fname_to_diff)} .tex files changed: {changed_fname_to_diff}')
            # TODO; not sure how to identify main one

        # exactly one file is different.  this makes things easier.
        elif len(changed_fname_to_diff) == 1:
            # there were multiple tex files in project; yet only one was different. should be a straightforward way of identifying the 'main' file.
            if len(before_tex_file_to_lines) > 1:
                normalization_situation_to_arxiv_ids['multiple_tex_files_only_1_changed'].append(arxiv_id)
                print(f'For {arxiv_id}, among {len(before_tex_file_to_lines)} files, normalization properly resulted in only 1 diff file: {changed_fname_to_diff}')
            # there was only a single tex file in this project, so it's kinda trivial to identify 'main' file.  somehow still a difference before/after normalization though... why?
            # biggest reason is probably directory structure.  for example 1611.09842 has latex files in `section/` directory.
            else:
                normalization_situation_to_arxiv_ids['single_tex_file_and_it_changed'].append(arxiv_id)
                print(f'For {arxiv_id}, only had a single .tex file.  Yet normalization resulted in a diff: {changed_fname_to_diff}')

            # if there's only one file diff, take it as the main one
            arxiv_id_to_main_tex_filepath[arxiv_id] = list(changed_fname_to_diff.keys())[0]

        # if there's no change, check this is because only one file, so no need to normalize
        elif len(changed_fname_to_diff) < 1:
            if len(before_tex_file_to_lines) == 1:
                normalization_situation_to_arxiv_ids['single_tex_file_and_no_change'].append(arxiv_id)
                print(f'For {arxiv_id}, no changes after normalization.  But only had 1 .tex file anyways, so makes sense.')

                # if there's only one file diff, take it as the main one
                arxiv_id_to_main_tex_filepath[arxiv_id] = list(before_tex_file_to_lines.keys())[0]

            else:
                normalization_situation_to_arxiv_ids['multiple_tex_files_and_no_change'].append(arxiv_id)
                print(f'For {arxiv_id}, weird.  No changes after normalization despite {len(before_tex_file_to_lines)} .tex files.')
                # TODO; not sure what to do, just skip


    for k, v in normalization_situation_to_arxiv_ids.items():
        print(f'{k}: {len(v)}\t\tSample: {v[:5]}')

    # output mapping between arxiv ID to the "main" tex file
    with open(OUTFILE, 'w') as f_out:
        json.dump(arxiv_id_to_main_tex_filepath, f_out, indent=4)
