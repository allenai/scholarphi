from abc import ABC
from argparse import ArgumentParser
import dataclasses
import json
import logging
import os
from typing import Any, List, Optional

from common.commands.base import ArxivBatchCommand, I, R
from common.models import setup_database_connections
from common.types import ArxivId, EntityUploadInfo, S2Id
from common.upload_entities import upload_entities


class DatabaseUploadCommand(ArxivBatchCommand[I, R], ABC):
    """
    A command for a batch job that uploads results to the output database. This command takes
    care of initializing the databases and setting up a new schema in the database for the upload.
    """

    def __init__(self, args: Any) -> None:
        super().__init__(args)
        if args.output_dir is None:
            print("Setting up db connection because there is no output dir.")
            setup_database_connections(
                schema_name=args.schema, create_tables=args.create_tables
            )
        else:
            print(f"Not setting up a db connection because an output dir was provided: {args.output_dir}.")

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

    def _write_to_file(self, entity_infos: List[EntityUploadInfo], output_file_name: str) -> None:
        format_version = "v0"

        logging.info(
            "About to write %d entity infos to %s (version: %s).",
            len(entity_infos),
            output_file_name,
            format_version
        )
        to_write = {
            "version": format_version,
            "data": [dataclasses.asdict(entity_info) for entity_info in entity_infos]
        }
        if os.path.exists(output_file_name):
            # TODO: maybe throw an error instead?
            logging.warning("File %s already exists. Not overwriting. Entity infos will not be written.", output_file_name)
        else:
            with open(output_file_name, 'w') as output_file:
                json.dump(to_write, output_file)

    def save_to_file_or_upload_entities(
        self,
        entity_infos: List[EntityUploadInfo],
        s2_id: S2Id,
        arxiv_id: ArxivId,
        data_version: Optional[int],
        filename: str
    ) -> None:
        if self.args.output_dir is None:
            upload_entities(s2_id, arxiv_id, entity_infos, data_version)
        else:
            output_file_name = os.path.join(self.args.output_dir, filename)
            self._write_to_file(entity_infos=entity_infos, output_file_name=output_file_name)


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
