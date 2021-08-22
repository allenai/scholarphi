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

from mmda.types.annotation import SpanGroup
from mmda.types.document import Document
from mmda.parsers.symbol_scraper_parser import SymbolScraperParser
from utils.mmda_utils import tokens_to_words

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


    # call aws s3 cp s3://ai2-s2-scholarphi-pipeline-dev/daq/arxiv-source-data/bymonth/1601/1601.00978v1 data/1601.00978v1/1601.00978v1.tar.gz
    # tar -xzvf data/1601.00978v1/1601.00978v1.tar.gz --directory data/1601.00978v1/


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
    assert os.path.exists(latex_targz_path), f'Failed fetching LaTeX package for {args.arxiv_id} to {latex_targz_path}'

    # unpack LaTeX tarball
    latex_source_dir = os.path.join(output_dir, f'{args.arxiv_id}/source/')
    unpack_archive(archive_path=latex_targz_path, dest_dir=latex_source_dir)
    assert os.path.exists(latex_source_dir), f'Failed unpacking LaTeX package {latex_targz_path} to {latex_source_dir}'

    ################################################################################################################

    # Step 1 - Compile LaTeX package.  We don't need the resulting PDF, but we need the LaTeX to be compile-able.
    result: texcompile.Result = texcompile.compile(sources_dir=latex_source_dir,
                                                   output_dir=latex_source_dir,
                                                   host=config_dict['TEXCOMPILE']['HOST'],
                                                   port=config_dict['TEXCOMPILE']['PORT'])
    assert result.success, f'Failed compiling LateX package {latex_source_dir}'
    assert len(result.main_tex_files) == 1, f'Multiple main TeX files: {result.main_tex_files}'
    assert len(result.output_files) == 1, f'Multiple output files: {result.output_files}'
    for output_file in result.output_files:
        output_path = os.path.join(latex_source_dir, output_file.name)
        assert os.path.exists(output_path), f'Cant find {output_path}'

    # Step 2 - Detect symbols from LaTeX package.
    symbols: List[texsymdetect.Symbol] = texsymdetect.detect_symbols(sources_dir=latex_source_dir,
                                                                     host=config_dict['TEXSYMDETECT']['HOST'],
                                                                     port=config_dict['TEXSYMDETECT']['PORT'])
    print(f'Found {len(symbols)} symbols.')
    print(f'e.g. {symbols[0]}')


    # Step 3 - Get words from PDF using Sscraper
    sscraper_dir = os.path.join(output_dir, 'sscraper/')
    os.makedirs(sscraper_dir, exist_ok=True)
    sscraper_json_path = os.path.join(sscraper_dir, f'{args.arxiv_id}.json')
    parser = SymbolScraperParser(sscraper_bin_path=config_dict['SSCRAPER']['BINARY'])
    doc: Document = parser.parse(input_pdf_path=pdf_path, output_json_path=sscraper_json_path, tempdir=sscraper_dir)
    words: List[SpanGroup] = tokens_to_words(tokens=doc.tokens)
    print(f'Found {len(words)} words')
    print(f'e.g. {[word.text for word in words[:10]]}')


    # Step 4 -  run S2ORC latex parser on LaTex projects;  do the char-level fuzzy matching
    s2orc_latex_dir = os.path.join(output_dir, 's2orc/')
    s2orc_latex_norm_dir = os.path.join(s2orc_latex_dir,  'norm/')
    s2orc_latex_norm_log = os.path.join(s2orc_latex_norm_dir, 'log.txt')
    s2orc_latex_xml_dir = os.path.join(s2orc_latex_dir,  'xml/')
    s2orc_latex_xml_err = os.path.join(s2orc_latex_xml_dir, 'err.txt')
    s2orc_latex_xml_log = os.path.join(s2orc_latex_xml_dir, 'log.txt')
    s2orc_latex_json_path = os.path.join(s2orc_latex_dir, 's2orc.json')
    os.makedirs(s2orc_latex_dir, exist_ok=True)
    os.makedirs(s2orc_latex_norm_dir, exist_ok=True)
    os.makedirs(s2orc_latex_xml_dir, exist_ok=True)
    norm_output_dir = normalize_latex(latex_dir=latex_source_dir,
                                      norm_dir=s2orc_latex_norm_dir,
                                      norm_log_file=s2orc_latex_norm_log, cleanup=False)
    xml_output_path = norm_latex_to_xml(norm_dir=norm_output_dir,
                                        xml_dir=s2orc_latex_xml_dir,
                                        xml_err_file=s2orc_latex_xml_err,
                                        xml_log_file=s2orc_latex_xml_log, cleanup=False)
    s2orc_paper = convert_latex_xml_to_s2orc_json(xml_fpath=xml_output_path,
                                                  log_dir=s2orc_latex_dir)
    s2orc_paper_dict = s2orc_paper.as_json()
    with open(s2orc_latex_json_path, 'w') as f_out:
        json.dump(s2orc_paper_dict, f_out, indent=4)


    #
    # Step 5  (format SPP output to be suitable for HEDDEX defs)
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
