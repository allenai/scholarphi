"""



"""

from typing import Dict, List

import os
import requests
import re

USER_AGENT = "Andrew Head, for academic research on dissemination of scientific insight <head.andrewm@gmail.com>"

def fetch_pdf_from_arxiv(arxiv_id: str, target_path: str) -> None:
    uri = "https://arxiv.org/pdf/%s.pdf" % (arxiv_id,)
    response = requests.get(uri, headers={"User-Agent": USER_AGENT})
    if response.ok:
        if not os.path.exists(os.path.dirname(target_path)):
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
        with open(target_path, 'wb') as destfile:
            destfile.write(response.content)
    elif response.status_code == 404:
        raise FileNotFoundError(f"PDF doesn't exist in ArXiv for {arxiv_id}")


def parse_arxiv_id(arxiv_id: str) -> Dict:
    match = re.match(pattern=r'([0-9]{4}).([0-9]+)v([0-9]+)', string=arxiv_id)
    if not match:
        raise ValueError(f'arxiv ID {arxiv_id} not match regex patterns')
    else:
        yearmonth = match.group(1)
        id = match.group(2)
        version = match.group(3)
        return {'yearmonth': yearmonth, 'id': id, 'version': version}

