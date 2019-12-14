import logging
import os
import sys
import uuid
from argparse import ArgumentParser
from datetime import datetime

from explanations import directories
from scripts.command import (
    add_arxiv_id_filter_args,
    create_args,
    load_arxiv_ids_using_args,
    read_arxiv_ids_from_file,
)
from scripts.fetch_new_arxiv_ids import FetchNewArxivIds
from scripts.process import (
    DATABASE_UPLOAD_COMMANDS,
    MAIN_PIPELINE_COMMANDS,
    STORE_RESULTS_COMMANDS,
    run_command,
)
from scripts.store_pipeline_log import StorePipelineLog

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
        "--skip-store-results",
        action="store_true",
        help="Don't upload results to S3 when data processing is complete.",
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
            + " '--upload-to-database' must be set if this is option is set."
        ),
    )

    args = parser.parse_args()
    if args.database_schema is not None and not args.upload_to_database:
        parser.error(
            "argument '--database-schema' requires '--upload-to-database' to be set."
        )

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
        if args.upload_to_database:
            command_args.schema = args.database_schema

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
