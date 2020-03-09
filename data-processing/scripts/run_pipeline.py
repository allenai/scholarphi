import logging
import os
import sys
import uuid
from argparse import ArgumentParser, Namespace
from datetime import datetime
from typing import List

from common import directories, email, file_utils
from common.commands.base import (
    CommandList,
    add_arxiv_id_filter_args,
    add_one_entity_at_a_time_arg,
    create_args,
    load_arxiv_ids_using_args,
    read_arxiv_ids_from_file,
)
from common.commands.database import DatabaseUploadCommand
from common.commands.fetch_arxiv_sources import (
    DEFAULT_S3_ARXIV_SOURCES_BUCKET,
    FetchArxivSources,
)
from common.commands.fetch_new_arxiv_ids import FetchNewArxivIds
from common.commands.store_pipeline_log import StorePipelineLog
from common.commands.store_results import DEFAULT_S3_LOGS_BUCKET, StoreResults
from scripts.pipelines import entity_pipelines
from scripts.process import (
    ENTITY_COMMANDS,
    TEX_PREPARATION_COMMANDS,
    commands_by_entity,
    run_command,
)


def run_commands_for_arxiv_ids(
    CommandClasses: CommandList, arxiv_id_list: List[str], pipeline_args: Namespace
) -> None:
    " Run a sequence of pipeline commands for a list of arXiv IDs. "

    for CommandCls in CommandClasses:

        # Initialize arguments for each command to defaults.
        command_args_parser = ArgumentParser()
        CommandCls.init_parser(command_args_parser)
        command_args = command_args_parser.parse_known_args("")[0]

        # Pass pipeline arguments to command.
        command_args.arxiv_ids = arxiv_id_list
        command_args.arxiv_ids_file = None
        command_args.v = pipeline_args.v
        command_args.source = pipeline_args.source
        command_args.log_names = [log_filename]
        command_args.one_entity_at_a_time = pipeline_args.one_entity_at_a_time
        command_args.schema = pipeline_args.database_schema
        if CommandCls == FetchArxivSources:
            command_args.s3_bucket = pipeline_args.s3_arxiv_sources_bucket
        if CommandCls in [StorePipelineLog, StoreResults]:
            command_args.s3_bucket = pipeline_args.s3_output_bucket

        if CommandCls == StorePipelineLog:
            logging.debug("Flushing file log before storing pipeline logs.")
            file_log_handler.flush()

        logging.debug(
            "Creating command %s with args %s",
            CommandCls.get_name(),
            vars(command_args),
        )
        command = CommandCls(command_args)
        logging.info("Launching command %s", CommandCls.get_name())
        run_command(command)
        logging.info("Finished running command %s", CommandCls.get_name())


if __name__ == "__main__":

    PIPELINE_COMMANDS = TEX_PREPARATION_COMMANDS + ENTITY_COMMANDS
    ENTITY_NAMES = [p.entity_name for p in entity_pipelines]

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
    command_names = [c.get_name() for c in PIPELINE_COMMANDS]
    parser.add_argument(
        "--entities",
        help=(
            "What type of entities to process. Commands that do not process the specified entities "
            + "will be skipped. Defaults to all entities. You can specify multiple entity types. "
            + "If specifying multiple entity types, use the format '--entities <type1> <type2> "
            + "without an equal sign after '--entities'."
        ),
        choices=ENTITY_NAMES,
        nargs="+",
        default=ENTITY_NAMES,
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
        + "arguments that specify which arXiv IDs to process.",
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
        "--one-paper-at-a-time",
        action="store_true",
        help=(
            "Process one paper at a time. The data folders for a processed paper will be deleted "
            + "once the paper has been processed. This mode has two advantages. First, the host "
            + "computer will only need enough storage space to process one paper at a time. "
            + "Second, the pipeline will upload results for papers as each paper is processed, "
            + "instead of waiting until after all papers is processed."
        ),
    )
    parser.add_argument(
        "--keep-data",
        action="store_true",
        help="If '--one-paper-at-a-time' is set, keep a paper's data after it is processed.",
    )
    parser.add_argument(
        "--store-results",
        action="store_true",
        help="Upload key results to S3 when data processing is complete.",
    )
    parser.add_argument(
        "--store-log",
        action="store_true",
        help="Upload log to S3 when data processing is complete.",
    )
    parser.add_argument(
        "--s3-output-bucket",
        type=str,
        default=DEFAULT_S3_LOGS_BUCKET,
        help="S3 bucket to upload results and logs to.",
    )
    parser.add_argument(
        "--notify-emails",
        type=str,
        nargs="+",
        help=(
            "Email addresses that will receive a digest of processing results. The pipeline "
            + "must have Internet access and must be able to connect to Gmail's SMTP server."
        ),
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

    command_classes = PIPELINE_COMMANDS

    # Store pipeline logs after results, so that we can include the result storage in the pipeline logs.
    if args.store_results:
        command_classes.append(StoreResults)
    if args.store_log:
        command_classes.append(StorePipelineLog)

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
            # Skip over irrelevant entity-processing commands
            if CommandClass in ENTITY_COMMANDS:
                skip_command = True
                for entity_type in args.entities:
                    if CommandClass in commands_by_entity[entity_type]:
                        skip_command = False
                        break
                if skip_command:
                    continue
            # Optionally skip over database upload commands
            if issubclass(CommandClass, DatabaseUploadCommand):
                if not args.upload_to_database:
                    continue
            filtered_commands.append(CommandClass)
            if args.end is not None and command_name == args.end:
                break

    logging.debug(
        "The following commands will be run, in this order: %s",
        [CommandClass.get_name() for CommandClass in filtered_commands],
    )

    # Run the pipeline one paper at a time, or one command at a time, depending on arguments.
    if args.one_paper_at_a_time:
        for arxiv_id in arxiv_ids:
            logging.info("Running pipeline for paper %s", arxiv_id)
            run_commands_for_arxiv_ids(filtered_commands, [arxiv_id], args)
            if not args.keep_data:
                file_utils.delete_data(arxiv_id)
    else:
        logging.info("Running pipeline for papers %s", arxiv_ids)
        run_commands_for_arxiv_ids(filtered_commands, arxiv_ids, args)

    # If requested, send email with paper-processing summaries.
    if args.notify_emails is not None:
        digest = file_utils.create_pipeline_digest(entity_pipelines, arxiv_ids)
        log_location = None
        if args.store_log:
            log_preview_url = (
                "https://s3.console.aws.amazon.com/s3/object/"
                + args.s3_output_bucket
                + "/master/logs/"
                + log_filename
            )

        email.send_digest_email(digest, args.notify_emails, log_preview_url)
