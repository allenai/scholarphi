import logging
import os
import sys
import uuid
from argparse import ArgumentParser
from datetime import datetime

from command.command import (
    add_arxiv_id_filter_args,
    add_one_entity_at_a_time_arg,
    create_args,
    load_arxiv_ids_using_args,
    read_arxiv_ids_from_file,
)
from command.fetch_arxiv_sources import (
    DEFAULT_S3_ARXIV_SOURCES_BUCKET,
    FetchArxivSources,
)
from command.fetch_new_arxiv_ids import FetchNewArxivIds
from command.process import (
    DATABASE_UPLOAD_COMMANDS,
    MAIN_PIPELINE_COMMANDS,
    STORE_RESULTS_COMMANDS,
    run_command,
)
from command.store_pipeline_log import StorePipelineLog
from command.store_results import DEFAULT_S3_LOGS_BUCKET, StoreResults
from common import directories

if __name__ == "__main__":

    parser = ArgumentParser(
        description="Run pipeline to extract entities from arXiv papers."
    )
    parser.add_argument("-v", help="print debugging information", action="store_true")
    parser.add_argument(
        "--log-prefix",
        type=str,
        default="pipeline",
        help=(
            "Prefix to place at the beginning of the log file name. The log will be output to "
            + "<prefix>-<timestamp>-<uuid>.log. Prefix should be an ASCII string. A UUID is "
            + "in the file name to distinguish it from other logs created at the same time."
        ),
    )
    command_names = [c.get_name() for c in MAIN_PIPELINE_COMMANDS]
    parser.add_argument(
        "--entities",
        help=(
            "What type of entities to process. Commands that do not process the specified entities "
            + "will be skipped. Defaults to 'all'. You can specify multiple entity types."
        ),
        choices=["all", "citations", "symbols"],
        nargs="+",
        default="all",
    )
    parser.add_argument(
        "--start",
        help="Command to start running the pipeline at.",
        choices=command_names,
    )
    parser.add_argument(
        "--end", help="Command to stop running the pipeline at.", choices=command_names
    )
    add_arxiv_id_filter_args(parser)
    parser.add_argument(
        "--days",
        type=int,
        default=1,
        help="Number of days in the past for which to fetch arXiv papers. Cannot be used with "
        + "arguments that specify which arXiv IDs to process)",
    )
    parser.add_argument(
        "--source",
        default="arxiv",
        choices=["arxiv", "s3"],
        help=(
            "Where to download sources from. If 'arxiv', download sources from arXiv.org. If "
            + "'s3', download from S2's S3 bucket for arXiv sources."
        ),
    )
    parser.add_argument(
        "--s3-arxiv-sources-bucket",
        type=str,
        default=DEFAULT_S3_ARXIV_SOURCES_BUCKET,
        help="If '--source' is 's3', arXiv sources will be downloaded from this S3 bucket.",
    )
    add_one_entity_at_a_time_arg(parser)
    parser.add_argument(
        "--skip-store-results",
        action="store_true",
        help="Don't upload results to S3 when data processing is complete.",
    )
    parser.add_argument(
        "--s3-output-bucket",
        type=str,
        default=DEFAULT_S3_LOGS_BUCKET,
        help="S3 bucket to upload results and logs to.",
    )
    parser.add_argument(
        "--upload-to-database",
        action="store_true",
        help="Save results of running the pipeline to the database.",
    )
    parser.add_argument(
        "--database-schema",
        type=str,
        default=f"schema_{datetime.utcnow().strftime('%Y%m%d_%M%H%S')}",
        help=(
            "Name of the Postgres schema into which to upload results. To upload into the live "
            + "database, set this to 'public' (though this is not recommended). Schema names must "
            + "follow the naming rules for Postgres identifiers "
            + "(see https://www.postgresql.org/docs/9.2/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS)."
        ),
    )
    args = parser.parse_args()

    # Set up logging
    console_log_handler = logging.StreamHandler(sys.stdout)
    console_log_level = logging.DEBUG if args.v else logging.INFO
    console_log_handler.setLevel(console_log_level)

    timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    log_filename = f"{args.log_prefix}-{timestamp}-{uuid.uuid4()}.log"
    if not os.path.exists(directories.LOGS_DIR):
        os.makedirs(directories.LOGS_DIR)
    log_file_path = os.path.join(directories.LOGS_DIR, log_filename)
    file_log_handler = logging.FileHandler(log_file_path, mode="w", encoding="utf-8")
    file_log_handler.setLevel(logging.DEBUG)

    logging.basicConfig(
        format="%(asctime)s [%(levelname)s]: %(message)s",
        level=logging.DEBUG,
        handlers=[console_log_handler, file_log_handler],
    )

    # Load arXiv IDs either from arguments or by fetching recent arXiv IDs.
    arxiv_ids = load_arxiv_ids_using_args(args)
    if arxiv_ids is None:
        logging.debug("Fetching new arXiv IDs for the last %d day(s).", args.days)
        arxiv_ids_path = "arxiv_ids.txt"
        fetch_command_args = create_args(
            v=args.v, days=args.days, output_file=arxiv_ids_path
        )
        fetch_arxiv_ids_command = FetchNewArxivIds(fetch_command_args)
        run_command(fetch_arxiv_ids_command)
        arxiv_ids = read_arxiv_ids_from_file(arxiv_ids_path)

    reached_start_command = False
    if args.start is None:
        reached_start_command = True

    command_classes = MAIN_PIPELINE_COMMANDS
    if args.upload_to_database:
        logging.debug(
            "Registering commands to be run for uploading results to the database."
        )
        command_classes += DATABASE_UPLOAD_COMMANDS
    if not args.skip_store_results:
        command_classes += STORE_RESULTS_COMMANDS

    logging.debug("Assembling the list of commands to be run.")
    filtered_commands = []
    start_reached = True if args.start is None else False
    for CommandClass in command_classes:
        command_name = CommandClass.get_name()
        if not start_reached and args.start is not None:
            if command_name == args.start:
                start_reached = True
            else:
                continue
        if start_reached:
            if "all" not in args.entities:
                entity_type = CommandClass.get_entity_type()
                if entity_type != "all" and entity_type not in args.entities:
                    continue
            filtered_commands.append(CommandClass)
            if args.end is not None and command_name == args.end:
                break

    logging.debug(
        "The following commands will be run, in this order: %s",
        [CommandClass.get_name() for CommandClass in filtered_commands],
    )

    for CommandClass in filtered_commands:

        # Initialize arguments for each command to defaults.
        command_args_parser = ArgumentParser()
        CommandClass.init_parser(command_args_parser)
        command_args = command_args_parser.parse_known_args("")[0]

        # Pass pipeline arguments to command.
        command_args.arxiv_ids = arxiv_ids
        command_args.arxiv_ids_file = None
        command_args.v = args.v
        command_args.source = args.source
        command_args.log_names = [log_filename]
        command_args.one_entity_at_a_time = args.one_entity_at_a_time
        command_args.schema = args.database_schema
        if CommandClass == FetchArxivSources:
            command_args.s3_bucket = args.s3_arxiv_sources_bucket
        if CommandClass in [StorePipelineLog, StoreResults]:
            command_args.s3_bucket = args.s3_output_bucket

        if CommandClass == StorePipelineLog:
            logging.debug("Flushing file log before storing pipeline logs.")
            file_log_handler.flush()

        logging.debug(
            "Creating command %s with args %s",
            CommandClass.get_name(),
            vars(command_args),
        )
        command = CommandClass(command_args)
        logging.info("Launching command %s", CommandClass.get_name())
        run_command(command)
