"""

1. Query LateX compilation service
2. Query symbol extraction service
3. Query SPP
4. Merge SPP & symbol data
5. Detect definitions on sentences


"""

from typing import List, Dict

import os
import requests
import json

import argparse
import tempfile
import shutil

import dataclasses



import texcompile.client as texcompile
import texsymdetect.client as texsymdetect
from doc2json.tex2json.tex_to_xml import normalize_latex, norm_latex_to_xml
from doc2json.tex2json.xml_to_json import convert_latex_xml_to_s2orc_json

from utils.tar_utils import unpack_archive
from utils.arxiv_utils import fetch_pdf_from_arxiv, parse_arxiv_id
from utils.s3_utils import download_from_s3


# TODO: reorg dir structure
# TODO: pull PDF from arxiv for SPP
# TOOD: get SPP working
# TODO: get s2orc running



if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--arxiv_id', required=True, help='arXiv ID')
    parser.add_argument('--output_root', required=True, help='path to root dir that stores output')
    parser.add_argument('--config_json', required=True, help='config JSON file')
    args = parser.parse_args()

    class Args:
        pass
    args = Args()
    args.arxiv_id = '1601.00978v1'
    args.output_root = '/Users/kylel/ai2/reader/minimal-pipeline/data/'
    args.config_json = '/Users/kylel/ai2/reader/minimal-pipeline/_config.json'

    # setup config
    with open(args.config_json) as f_in:
        config_dict = json.load(f_in)

    # setup output dir for this arXiv ID
    output_dir = os.path.join(args.output_root, args.arxiv_id)
    os.makedirs(output_dir, exist_ok=True)

    # get PDF for this arXiv ID
    pdf_path = os.path.join(output_dir, f'{args.arxiv_id}.pdf')
    fetch_pdf_from_arxiv(arxiv_id=args.arxiv_id, target_path=pdf_path)
    assert os.path.exists(pdf_path), f'Failed fetching PDF for {args.arxiv_id} to {pdf_path}'

    # get LaTeX .tar.gz package for this arXiv ID from s3
    parsed_arxiv_id = parse_arxiv_id(arxiv_id=args.arxiv_id)
    s3_fname = os.path.join(config_dict['S3_LATEX_SOURCES']['PREFIX'], parsed_arxiv_id['yearmonth'], args.arxiv_id)
    latex_targz_path = os.path.join(output_dir, f'{args.arxiv_id}.tar.gz')
    download_from_s3(s3_bucket_name=config_dict['S3_LATEX_SOURCES']['BUCKET'], s3_fname=s3_fname,
                     target_path=latex_targz_path)

    # unpack LaTeX tarball
    latex_source_dir = os.path.join(output_dir, f'{args.arxiv_id}/source/')
    unpack_archive(archive_path=latex_targz_path, dest_dir=latex_source_dir)

    raise Exception


    # for testing;
    class Args:
        pass
    args = Args()
    args.input_latex_dir = 'data/1601.00978v1/'
    args.output_dir = 'data/1601.00978v1/'

    # call aws s3 cp s3://ai2-s2-scholarphi-pipeline-dev/daq/arxiv-source-data/bymonth/1601/1601.00978v1 data/1601.00978v1/1601.00978v1.tar.gz
    # tar -xzvf data/1601.00978v1/1601.00978v1.tar.gz --directory data/1601.00978v1/


    # Step 1 - Compile LaTeX to PDF
    result: texcompile.Result = texcompile.compile(sources_dir=args.input_tex_dir,
                                                   output_dir=output_dir,
                                                   host='http://s2research-desktop2.corp.ai2',
                                                   port=8000)
    print(f'Finished: {result.success}')
    print(f'Main Tex file: {result.main_tex_files}')    # Output: ['craternn.tex']
    print(f'Main output files: {result.output_files}')  # Output: [{ 'type': 'pdf', 'name': 'craternn.pdf' }]

    if len(result.main_tex_files) > 1:
        raise NotImplementedError(f'Multiple main TeX files: {result.main_tex_files}')
    if len(result.output_files) > 1:
        raise NotImplementedError(f'Multiple output files: {result.output_files}')
    for output_file in result.output_files:
        output_path = os.path.join(args.output_dir, output_file['name'])
        if not os.path.exists(output_path):
            raise FileNotFoundError(f'Cant find {output_path}')


    # Step 2 - Detect symbols from LaTeX
    symbols: List[texsymdetect.Symbol] = texsymdetect.detect_symbols(sources_dir=args.input_tex_dir,
                                                                     host='http://s2research-desktop2.corp.ai2',
                                                                     port=8001)
    print(f'Found {len(symbols)} symbols.')
    print(f'e.g. {symbols[0]}')


    # Step 3 - Get tokens from PDF
    


    #
    # Step 3a.  run S2ORC latex parser on LaTex projects;  do the char-level fuzzy matching
    args.latex_norm_dir = 'data/latex_norm/'
    args.latex_norm_log = 'data/latex_norm/log.txt'
    args.latex_xml_dir = 'data/latex_xml/'
    args.latex_xml_err = 'data/latex_xml/err.txt'
    args.latex_xml_log = 'data/latex_xml/log.txt'
    args.latex_s2orc_dir = 'data/s2orc/'
    args.latex_s2orc_json = 'data/s2orc/s2orc.json'
    os.makedirs(args.latex_norm_dir, exist_ok=True)
    os.makedirs(args.latex_xml_dir, exist_ok=True)
    os.makedirs(args.latex_s2orc_dir, exist_ok=True)
    norm_output_dir = normalize_latex(latex_dir=args.input_latex_dir, norm_dir=args.latex_norm_dir, norm_log_file=args.latex_norm_log, cleanup=False)
    xml_output_path = norm_latex_to_xml(norm_dir=norm_output_dir, xml_dir=args.latex_xml_dir, xml_err_file=args.latex_xml_err, xml_log_file=args.latex_xml_log, cleanup=False)
    s2orc_paper = convert_latex_xml_to_s2orc_json(xml_fpath=xml_output_path, log_dir=args.latex_s2orc_dir)
    paper_dict = s2orc_paper.as_json()
    with open(args.latex_s2orc_json, 'w') as f_out:
        json.dump(paper_dict, f_out, indent=4)


    #
    # Step 4  (format SPP output to be suitable for HEDDEX defs)
    #


    #
    #
    #

    sentences_data: dict = {
        'sents': [
            {"sent_id": 2, "text": "Let $w^t$ denote the $t$-th word in sentence $s$ ."},
            {"sent_id": 3, "text": "Let $w^t$ denote the $t$-th word in sentence $s$ ."},
        ],
        'terms': [
            {"term_id": 0, "sent_id": 2, "start": 4, "end": 9, "text": "$w^t$"},
            {"term_id": 1, "sent_id": 2, "start": 21, "end": 24, "text": "$t$"},
            {"term_id": 2, "sent_id": 2, "start": 45, "end": 48, "text": "$s$"}
        ]
    }

    result = requests.post(url='http://s2research-desktop2.corp.ai2:8080/get_prediction', json=sentences_data)
    result = result.json()

    result = {'message': 'Successfully predicted symbol definitions of input text',
              'output': [{'def_spans': [{'end': 49,
                                         'model_text': 'SYMBOL-th word in sentence SYMBOL',
                                         'sent_id': 2,
                                         'start': 21,
                                         'text': '$t$-th word in sentence $s$ '}],
                          'term_id': 0},
                         {'def_spans': [{'end': 33,
                                         'model_text': 'word',
                                         'sent_id': 2,
                                         'start': 28,
                                         'text': 'word '}],
                          'term_id': 1},
                         {'def_spans': [{'end': 45,
                                         'model_text': 'sentence',
                                         'sent_id': 2,
                                         'start': 36,
                                         'text': 'sentence '}],
                          'term_id': 2}]}


    #
    #   Step -- Upload to DB
    #
