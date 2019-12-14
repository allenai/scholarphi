import logging
import subprocess
from argparse import ArgumentParser
from typing import Iterator

from explanations import directories
from scripts.command import Command
from scripts.store_results import S3_BUCKET


class StorePipelineLog(Command[None, None]):  # pylint: disable=unsubscriptable-object
    @staticmethod
    def get_name() -> str:
        return "store-pipeline-log"

    @staticmethod
    def get_description() -> str:
        return "Upload log from running the pipeline"

    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        parser.add_argument(
            "--log-names",
            type=str,
            nargs="+",
            help=(
                "Names of log files to upload. Logs with these names must be found in the "
                + "'"
                + directories.LOGS_DIR
                + "' directory. If this argument is not provided, this command will upload all "
                + "logs in the log directory."
            ),
        )
        parser.add_argument(
            "--s3-prefix",
            type=str,
            default="master",
            help="Prefix for path to which to upload logs in the S3 bucket.",
        )

    def load(self) -> Iterator[None]:
        yield None

    def process(self, _: None) -> Iterator[None]:
        yield None

    def save(self, item: None, _: None) -> None:

        upload_path = f"s3://{S3_BUCKET}/{self.args.s3_prefix}/logs/"
        command_args = [
            "aws",
            "s3",
            "cp",
            directories.LOGS_DIR,
            upload_path,
            "--recursive",
        ]

        if self.args.log_names is not None:
            logging.debug(
                "Filtering logs to upload to S3 to set provided by command caller."
            )
            command_args.extend(
                ["--exclude", "*",]
            )
            for log_name in self.args.log_names:
                command_args.extend(["--include", f"{log_name}"])

        logging.debug("Uploading logs to S3 with command %s", command_args)
        result = subprocess.run(
            command_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
        )
        if len(result.stdout) == 0:
            logging.warning(  # pylint: disable=logging-not-lazy
                (
                    "There was no console output from uploading logs to S3. You may want to check that "
                    + "your S3 bucket is configured correctly, as the upload was not successful."
                ),
            )
        logging.debug("Finished uploading logs to S3.")
        if result.returncode != 0:
            logging.warning(
                "Error uploading logs to S3: %s", result.stderr,
            )
