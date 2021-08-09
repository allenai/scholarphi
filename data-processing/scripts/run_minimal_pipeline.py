"""

1. Query LateX compilation service
2. Query symbol extraction service
3. Query SPP
4. Merge SPP & symbol data
5. Detect definitions on sentences


"""

from typing import List

import os
import requests

import argparse
import tempfile
import shutil

import dataclasses

import texcompile.client as texcompile
import texsymdetect.client as texsymdetect


if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--input_latex_dir', required=True, help='path to directory of latex project')
    parser.add_argument('--output_dir', required=True, help='path to output dir')
    parser.add_argument('--temp_dir', required=True, help='path to directory to hold temp processing output')
    parser.add_argument('--config_json', required=True, help='config JSON file')
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)
    os.makedirs(args.temp_dir, exist_ok=True)
    shutil.copytree(src=args.input_latex_dir, dst=args.temp_dir)

    # Step 1 - Compile LaTeX to PDF
    result: texcompile.Result = texcompile.compile(sources_dir=args.input_tex_dir,
                                                   output_dir=args.output_dir,
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
