import os

import time
from argparse import ArgumentParser
import logging
from typing import Iterator, Optional

from shutil import copyfile

from common import directories
from common.commands.base import ArxivBatchCommand
from common.fetch_arxiv import FetchFromArxivPDFException, fetch_pdf_from_arxiv
from common.compile import get_output_files, get_compiled_tex_files
from common.types import ArxivId, AbsolutePath


"""Constants for dealing with retries and delays between call attempts"""
DEFAULT_FETCH_DELAY = 10  # seconds
BACKOFF_FETCH_DELAY = 60  # seconds
MAX_FETCH_ATTEMPTS = 3


logger = logging.getLogger(__name__)


class FetchArxivPdf(ArxivBatchCommand[ArxivId, None]):
    @staticmethod
    def get_name() -> str:
        return "fetch-arxiv-pdf"

    @staticmethod
    def get_description() -> str:
        return "Fetch PDF for arXiv papers (from local compilation output)."

    def get_arxiv_ids_dirkey(self) -> Optional[str]:
        return 'compiled-normalized-sources'

    def load(self) -> Iterator[ArxivId]:
        for arxiv_id in self.arxiv_ids:
            yield arxiv_id

    # def process(
    #     self,
    #     item: ArxivId
    # ) -> Iterator[None]:
    #     attempt = 0
    #
    #     while True:
    #         try:
    #             result = fetch_pdf_from_arxiv(item, dest=os.path.join(
    #                 directories.arxiv_subdir(dirkey='arxiv-pdfs', arxiv_id=item), f'{item}.pdf'
    #             ))
    #             yield result
    #             break
    #         except FetchFromArxivPDFException as e:
    #             if attempt < MAX_FETCH_ATTEMPTS - 1:
    #                 logger.warning("Trouble getting data from ArXiv. Backing off and trying again.")
    #                 attempt += 1
    #                 time.sleep(BACKOFF_FETCH_DELAY)
    #             else:
    #                 logger.warning("Exceed maximum retries to ArXiv.")
    #                 time.sleep(BACKOFF_FETCH_DELAY)
    #                 raise e
    #
    #     # This method of delaying fetches assumes that calls to 'process' will be made sequentially
    #     # and not in parallel. Delay mechanisms will need to be more sophisticated if we transition
    #     # to parallel data fetching.
    #     time.sleep(DEFAULT_FETCH_DELAY)
    #     yield None

    def process(self, item: ArxivId) -> Iterator[AbsolutePath]:
        arxiv_id = item

        output_files = get_output_files(directories.arxiv_subdir("compiled-normalized-sources", arxiv_id))
        output_pdf_fnames = [f.path for f in output_files if f.output_type == 'pdf']
        if len(output_pdf_fnames) == 0:
            raise FileNotFoundError(f'No PDF found in normalized compilation dir for {arxiv_id}')

        elif len(output_pdf_fnames) == 1:
            pdf_path = os.path.join(directories.arxiv_subdir("compiled-normalized-sources", arxiv_id), output_pdf_fnames[0])
            yield pdf_path

        else:
            grouped_pdf_paths = [p for p in output_pdf_fnames if p.startswith('xxxpdfpages')]
            if len(grouped_pdf_paths) == 1:
                pdf_path = os.path.join(directories.arxiv_subdir("compiled-normalized-sources", arxiv_id), grouped_pdf_paths[0])
                yield pdf_path

            elif len(grouped_pdf_paths) == 0:
                raise FileNotFoundError(f'Multiple output files detected, but no xxxpdfpages file: {arxiv_id}')

            else:
                raise Exception(f'Too many xxxpdfpages found for {arxiv_id}')

    def save(self, item: ArxivId, result: AbsolutePath) -> None:
        arxiv_id = item
        pdf_path = result

        target_path = os.path.join(directories.arxiv_subdir(dirkey='arxiv-pdfs', arxiv_id=item), f'{arxiv_id}.pdf')

        if not os.path.exists(os.path.dirname(target_path)):
            os.makedirs(os.path.dirname(target_path))

        copyfile(src=pdf_path, dst=target_path)

        if os.path.exists(target_path):
            pass
        else:
            raise FileNotFoundError(f'After copying attempt, not finding paper in right location for {arxiv_id}.pdf')

