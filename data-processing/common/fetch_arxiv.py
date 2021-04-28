import datetime
import logging
import os
import re
import shutil
import subprocess
from tempfile import TemporaryDirectory
from typing import List, Optional

import requests

from common import directories, file_utils
from common.models import Metadata
from common.types import ArxivId, Path
from common.compile import get_output_files

USER_AGENT = "Andrew Head, for academic research on dissemination of scientific insight <head.andrewm@gmail.com>"
ARXIV_ASSET_URL_PREFIX = "https://export.arxiv.org/src/"


logger = logging.getLogger(__name__)


class FetchFromArxivException(Exception):
    pass

class FetchFromArxivPDFException(Exception):
    pass


def save_source_archive(
    arxiv_id: ArxivId, content: bytes, dest: Optional[Path] = None
) -> None:
    if not dest:
        dest = directories.arxiv_subdir("sources-archives", arxiv_id)
    if not os.path.exists(os.path.dirname(dest)):
        os.makedirs(os.path.dirname(dest))
    with open(dest, "wb") as archive:
        archive.write(content)


def fetch_from_arxiv(arxiv_id: ArxivId, dest: Optional[Path] = None) -> None:
    logging.debug("Fetching sources for arXiv paper %s from arXiv.", arxiv_id)
    uri = ARXIV_ASSET_URL_PREFIX + arxiv_id

    try:
        response = requests.get(uri, headers={"User-Agent": USER_AGENT})

    except Exception:
        msg = f"Request to ArXiv for paper {arxiv_id} failed"
        logger.exception(msg)
        raise FetchFromArxivException(msg)

    else:
        if response.ok:
            if response.headers["Content-Type"] == "application/x-eprint-tar":
                save_source_archive(arxiv_id, response.content, dest)
            elif response.headers["Content-Type"] == "application/pdf":
                msg = f"{arxiv_id} is a pdf, but might become a tarball later. Raising exception to trigger retry."
                raise FetchFromArxivException(msg)
            else:
                msg = f"Unexpected content type for {arxiv_id}. Content type is {response.headers['Content-Type']}."
                raise Exception(msg)
        elif response.status_code == 404:
            raise Exception(f"Paper assets don't exist in ArXiv for {arxiv_id}")
        else:
            status_code = response.status_code
            msg = f"Failed to fetch assets for {arxiv_id} from ArXiv with code {status_code}"
            raise FetchFromArxivException(msg)


def fetch_pdf_from_arxiv(arxiv_id: ArxivId, dest: Path) -> None:
    logging.debug("Fetching PDF for arXiv paper %s from arXiv.", arxiv_id)
    uri = "https://export.arxiv.org/pdf/%s.pdf" % (arxiv_id,)

    try:
        response = requests.get(uri, headers={"User-Agent": USER_AGENT})

    except Exception:
        msg  = f"Request to ArXiv for paper {arxiv_id} failed"
        logger.exception(msg)
        raise FetchFromArxivPDFException(msg)

    else:
        if response.ok:
            if not os.path.exists(os.path.dirname(dest)):
                os.makedirs(os.path.dirname(dest))
            with open(dest, 'wb') as destfile:
                destfile.write(response.content)

        elif response.status_code == 404:
            raise Exception(f"PDF doesn't exist in ArXiv for {arxiv_id}")
        else:
            status_code = response.status_code
            msg = f"Failed to fetch PDF for {arxiv_id} from ArXiv with code {status_code}"
            raise FetchFromArxivPDFException(msg)


def fetch_from_s3(arxiv_id: ArxivId, bucket: str) -> None:
    logger.debug("Fetching sources for arXiv paper %s from s3 storage.", arxiv_id)
    arxiv_id_tokens = arxiv_id.split(".")
    year_month_match = re.match(r"\d{4}", arxiv_id_tokens[0])
    if not year_month_match:
        logger.warning(  # pylint: disable=logger-not-lazy
            (
                "Unexpected arXiv ID format %s; This method only works for fetching arXiv IDs"
                + " whose IDs start with YYMM. Skipping this paper."
            ),
            arxiv_id,
        )
        return

    year_month = year_month_match.group(0)
    s3_path = f"s3://{bucket}/bymonth/{year_month}"
    with TemporaryDirectory() as download_dir_path:
        command_args = [
            "aws",
            "s3",
            "cp",
            s3_path,
            download_dir_path,
            # Each paper should have a file on S3---though the extension of that file is unknown.
            # For example, files could have, at least, a '.gz' or '.pdf' extension. To copy a file
            # with an unknown extension, copy recursively, including files that match the arXiv ID.
            "--recursive",
            "--exclude",
            "*",
            "--include",
            f"{arxiv_id}*",
        ]
        logger.debug("Fetching sources with command %s", command_args)
        result = subprocess.run(
            command_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
        )
        logger.debug(
            "Finished running command to fetch S3 sources for arXiv ID %s", arxiv_id
        )
        if result.returncode != 0:
            logger.warning(
                "Error fetching files from S3 for arXiv ID %s: %s",
                arxiv_id,
                result.stderr,
            )

        logger.debug(
            "Moving files downloaded to %s for arXiv ID %s to %s",
            download_dir_path,
            arxiv_id,
            directories.arxiv_subdir("sources-archives", arxiv_id),
        )
        downloaded_files = os.listdir(download_dir_path)
        if len(downloaded_files) == 0:
            logger.warning(  # pylint: disable=logger-not-lazy
                (
                    "No files fetched for arXiv ID %s. It's possible there are no files for this "
                    + "paper on S3."
                ),
                arxiv_id,
            )
            return
        if len(downloaded_files) > 1:
            logger.warning(
                "Unexpectedly downloaded more than one source archive file for arXiv ID %s",
                arxiv_id,
            )
        downloaded_file_path = os.path.join(download_dir_path, downloaded_files[0])
        save_path = directories.arxiv_subdir("sources-archives", arxiv_id)
        if not os.path.exists(os.path.dirname(save_path)):
            os.makedirs(os.path.dirname(save_path))
        shutil.move(downloaded_file_path, save_path)


def fetch_new_arxiv_ids(days: int = 1) -> List[ArxivId]:
    threshold_timestamp = datetime.datetime.now() - datetime.timedelta(days=days)
    metadata_models = Metadata.select(Metadata.metadata_id).where(
        Metadata.created_ts > threshold_timestamp
    )
    arxiv_ids = [m.metadata_id for m in metadata_models]
    return arxiv_ids
