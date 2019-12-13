import datetime
import logging
import os
import re
import shutil
import subprocess
from tempfile import TemporaryDirectory
from typing import List

import requests

from explanations import directories
from explanations.types import ArxivId
from models.models import Metadata

USER_AGENT = "Andrew Head, for academic research on dissemination of scientific insight <head.andrewm@gmail.com>"
S3_BUCKET = "s2-arxiv-sources"


def save_source_archive(arxiv_id: ArxivId, content: bytes) -> None:
    if not os.path.exists(directories.SOURCE_ARCHIVES_DIR):
        os.makedirs(directories.SOURCE_ARCHIVES_DIR)
    archive_path = directories.source_archives(arxiv_id)
    with open(archive_path, "wb") as archive:
        archive.write(content)


def fetch_from_arxiv(arxiv_id: ArxivId) -> None:
    logging.debug("Fetching sources for arXiv paper %s from arXiv.", arxiv_id)
    uri = "https://arxiv.org/e-print/%s" % (arxiv_id,)
    response = requests.get(uri, headers={"User-Agent": USER_AGENT})
    save_source_archive(arxiv_id, response.content)


def fetch_from_s3(arxiv_id: ArxivId) -> None:
    logging.debug("Fetching sources for arXiv paper %s from s3 storage.", arxiv_id)
    arxiv_id_tokens = arxiv_id.split(".")
    year_month_match = re.match(r"\d{4}", arxiv_id_tokens[0])
    if not year_month_match:
        logging.warning(  # pylint: disable=logging-not-lazy
            (
                "Unexpected arXiv ID format %s; This method only works for fetching arXiv IDs"
                + " whose IDs start with YYMM. Skipping this paper."
            ),
            arxiv_id,
        )
        return

    year_month = year_month_match.group(0)
    s3_path = f"s3://{S3_BUCKET}/bymonth/{year_month}"
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
        logging.debug("Fetching sources with command %s", command_args)
        result = subprocess.run(
            command_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
        )
        logging.debug(
            "Finished running command to fetch S3 sources for arXiv ID %s", arxiv_id
        )
        if result.returncode != 0:
            logging.warning(
                "Error fetching files from S3 for arXiv ID %s: %s",
                arxiv_id,
                result.stderr,
            )

        logging.debug(
            "Moving files downloaded to %s for arXiv ID %s to %s",
            download_dir_path,
            arxiv_id,
            directories.source_archives(arxiv_id),
        )
        downloaded_files = os.listdir(download_dir_path)
        if len(downloaded_files) == 0:
            logging.warning(  # pylint: disable=logging-not-lazy
                (
                    "No files fetched for arXiv ID %s. It's possible there are no files for this "
                    + "paper on S3."
                ),
                arxiv_id,
            )
            return
        if len(downloaded_files) > 1:
            logging.warning(
                "Unexpectedly downloaded more than one source archive file for arXiv ID %s",
                arxiv_id,
            )
        downloaded_file_path = os.path.join(download_dir_path, downloaded_files[0])
        shutil.move(downloaded_file_path, directories.source_archives(arxiv_id))


def fetch_new_arxiv_ids(days: int = 1) -> List[ArxivId]:
    threshold_timestamp = datetime.datetime.now() - datetime.timedelta(days=days)
    metadata_models = Metadata.select(Metadata.metadata_id).where(
        Metadata.created_ts > threshold_timestamp
    )
    arxiv_ids = [m.metadata_id for m in metadata_models]
    return arxiv_ids
