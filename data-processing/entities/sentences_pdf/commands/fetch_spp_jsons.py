import os

import json
import time
from argparse import ArgumentParser
import logging
from typing import Iterator, Optional
from dataclasses import dataclass

from common import file_utils
from common import directories
from common.commands.base import ArxivBatchCommand
from common.fetch_arxiv import FetchFromArxivException, fetch_from_arxiv, fetch_from_s3
from common.types import ArxivId, RelativePath


import requests

#  TODO - dont need
# DEFAULT_S3_ARXIV_SOURCES_BUCKET = "s2-arxiv-sources"

"""Constants for dealing with retries and delays between call attempts"""
DEFAULT_FETCH_DELAY = 10  # seconds
BACKOFF_FETCH_DELAY = 60  # seconds
MAX_FETCH_ATTEMPTS = 3


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class SppJsonTask:
    arxiv_id: ArxivId
    pdf_path: RelativePath
    spp_host: str


class FetchSppJsons(ArxivBatchCommand[ArxivId, None]):
    @staticmethod
    def get_name() -> str:
        return "fetch-spp-jsons"

    @staticmethod
    def get_description() -> str:
        return "Send a PDF to SPP to get back a JSON"

    def get_arxiv_ids_dirkey(self) -> Optional[str]:
        return 'arxiv-pdfs'

    def load(self) -> Iterator[SppJsonTask]:
        for arxiv_id in self.arxiv_ids:
            yield SppJsonTask(
                arxiv_id=arxiv_id,
                pdf_path=os.path.join(directories.arxiv_subdir('arxiv-pdfs', arxiv_id=arxiv_id), f'{arxiv_id}.pdf'),
                # TODO -- change to real one
                spp_host='http://pdf-layout-detection-service-dev.us-west-2.elasticbeanstalk.com/detect'
            )

    def process(self, item: SppJsonTask) -> Iterator[dict]:
        # f = open(item.pdf_path, 'rb')
        # files = {"pdf_file": (f.name, f, "multipart/form-data")}
        # r = requests.post(item.spp_host, files=files)
        # spp_json = r.json()
        with open(f'/data-processing/scienceparseplus/jsons/{item.arxiv_id}.json') as f_in:
            spp_json = json.load(f_in)
        yield spp_json


    def save(self, item: SppJsonTask, result: dict) -> None:
        results_dir = directories.arxiv_subdir('fetched-spp-jsons', item.arxiv_id)
        if not os.path.exists(results_dir):
            os.makedirs(results_dir)
        spp_json_path = os.path.join(results_dir, f"spp.json")
        with open(spp_json_path, 'w') as f_out:
            json.dump(result, f_out)

