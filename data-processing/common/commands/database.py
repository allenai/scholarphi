from abc import ABC
from argparse import ArgumentParser
from enum import Enum
from typing import Any

from common.commands.base import ArxivBatchCommand, I, R
from common.models import setup_database_connections


class OutputForm(Enum):
    DB = "db"
    FILE = "file"
    BOTH = "both"


class DatabaseUploadCommand(ArxivBatchCommand[I, R], ABC):
    """
    A command for a batch job that uploads results to the output database. This command takes
    care of initializing the databases and setting up a new schema in the database for the upload.
    """

    def __init__(self, args: Any) -> None:
        super().__init__(args)
        if args.output_form in [OutputForm.DB.value, OutputForm.BOTH.value]:
            print("Setting up db connection as we expect to upload output to the db.")
            setup_database_connections(
                schema_name=args.schema, create_tables=args.create_tables
            )

        if args.output_form in [OutputForm.FILE.value, OutputForm.BOTH.value]:
            msg = "We expect to write output to a file, but no output dir has been specified."
            assert args.output_dir is not None, msg


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
