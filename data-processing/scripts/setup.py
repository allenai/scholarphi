import logging
import os
import subprocess
from tempfile import TemporaryDirectory
from typing import List, Optional

from common.types import ArxivId


def fetch_config(s3_url: str) -> bool:
    """
    Fetch 'config.ini' pipeline configuration from S3. Returns True if the config file was
    successfully fetched from S3.
    """

    command_args = ["aws", "s3", "cp", s3_url, "config.ini"]
    logging.debug("Fetching config.ini file with command %s", command_args)
    result = subprocess.run(
        command_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
    )
    logging.debug("Finished running command to fetch config.ini from S3.")
    if result.returncode != 0:
        logging.warning("Error fetching job file from S3: %s", result.stderr)
        return False

    return True


def load_job_arxiv_ids_from_s3(s3_url: str) -> Optional[List[ArxivId]]:
    " Read list of arXiv IDs from a job file stored on S3. "

    with TemporaryDirectory() as jobs_dir_path:
        jobs_file_path = os.path.join(jobs_dir_path, "s3-work-request")
        command_args = ["aws", "s3", "cp", s3_url, jobs_file_path]
        logging.debug("Fetching jobs file with command %s", command_args)
        result = subprocess.run(
            command_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
        )
        logging.debug("Finished running command to fetch S3 job file")
        if result.returncode != 0:
            logging.warning("Error fetching job file from S3: %s", result.stderr)

        with open(jobs_file_path) as jobs_file:
            arxiv_ids = [l.strip() for l in jobs_file]
            logging.debug(
                "%d arXiv ID(s) to process have been read from jobs file",
                len(arxiv_ids),
            )

        return arxiv_ids
