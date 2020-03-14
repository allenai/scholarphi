import json
import logging
import os
import subprocess
from tempfile import TemporaryDirectory
from typing import Optional

from common.types import PipelineJob


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


def load_job_from_s3(s3_object_path: str) -> Optional[PipelineJob]:
    " Read list of arXiv IDs from a job file stored on S3. "

    s3_url = f"s3://scholarphi-work-requests/{s3_object_path}"

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
            try:
                job_data = json.load(jobs_file)
                arxiv_ids = job_data["arxiv_ids"]
                logging.debug(
                    "%d arXiv ID(s) to process have been read from jobs file",
                    len(arxiv_ids),
                )
                email = job_data.get("email", None)
            except (KeyError, ValueError) as error:
                logging.error("Error parsing JSON job config: %s", error)
                return None

            return PipelineJob(email=email, arxiv_ids=arxiv_ids)
