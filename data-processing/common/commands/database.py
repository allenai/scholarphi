from abc import ABC
from argparse import ArgumentParser
from enum import Enum
import logging
from typing import Any, Optional

from common.commands.base import ArxivBatchCommand, I, R
from common.models import setup_database_connections


class OutputForm(Enum):
    DB = "db"
    FILE = "file"
    BOTH = "both"


class OutputDetails:
    def __init__(self, output_form: str, output_dir: Optional[str]):
        OutputDetails.validate(output_form=output_form, output_dir=output_dir)
        self.output_form = OutputForm(output_form)
        self.output_dir = output_dir

    @staticmethod
    def validate(output_form: str, output_dir: Optional[str]):
        msg = "If the output form is 'file' or 'both', an output dir must also be specified."
        cond = (output_form in [OutputForm.FILE.value, OutputForm.BOTH.value]) == \
            (output_dir is not None)
        assert cond, msg

    def save_to_db(self) -> bool:
        return self.output_form in [OutputForm.DB, OutputForm.BOTH]

    def save_to_file(self) -> bool:
        return self.output_form in [OutputFrom.FILE, OutputForm.BOTH]


class DatabaseUploadCommand(ArxivBatchCommand[I, R], ABC):
    """
    A command for a batch job that uploads results to the output database. This command takes
    care of initializing the databases and setting up a new schema in the database for the upload.
    """

    def __init__(self, args: Any) -> None:
        super().__init__(args)

        self.output_details = OutputDetails(
            output_form=args.output_form,
            output_dir=args.output_dir
        )

        if self.output_details.save_to_db():
            logging.info("Setting up db connection as we expect to upload output to the db.")
            setup_database_connections(
                schema_name=args.schema, create_tables=args.create_tables
            )

        if self.output_details.save_to_file():
            logging.info("We will be writing output to files.")
            msg = f"{self.__class__.__name__} does not know how to write to a file."
            assert self.can_write_to_file(), msg

    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        super(DatabaseUploadCommand, DatabaseUploadCommand).init_parser(parser)
        parser.add_argument(
            "--data-version",
            type=int,
            help=(
                "Version number to assign to the uploaded data. Defaults to creating a new version "
                + "number for each paper for each run of the pipeline."
            ),
        )
        parser.add_argument(
            "--schema",
            type=str,
            default="public",
            help=("Name of schema to which data will be output. Defaults to 'public'."),
        )

    def can_write_to_file(self) -> bool:
        """
        Returns true if the upload command can write to a file, false otherwise.
        A way to make sure we are only expecting to write to a file when the rleevant
        command is capable of doing so.
        """
        return False


class DatabaseReadCommand(ArxivBatchCommand[I, R], ABC):
    """
    A command for a batch job that reads from a database.
    """

    def __init__(self, args: Any) -> None:
        super().__init__(args)
        setup_database_connections(schema_name=args.schema)

    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        super(DatabaseReadCommand, DatabaseReadCommand).init_parser(parser)
        parser.add_argument(
            "--schema",
            type=str,
            default="public",
            help=(
                "Name of schema to connect to in the database. Defaults to 'public'."
            ),
        )
