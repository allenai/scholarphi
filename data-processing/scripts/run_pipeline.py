import logging
import os
import sys
import traceback
import uuid
from argparse import ArgumentParser, Namespace
from datetime import datetime
from typing import List

from common import directories, email, file_utils
from common.commands.base import (CommandList, add_arxiv_id_filter_args,
                                  add_one_entity_at_a_time_arg, create_args,
                                  load_arxiv_ids_using_args,
                                  read_arxiv_ids_from_file)
from common.commands.database import DatabaseUploadCommand
from common.commands.fetch_arxiv_sources import (
    DEFAULT_S3_ARXIV_SOURCES_BUCKET, FetchArxivSources)
from common.commands.fetch_new_arxiv_ids import FetchNewArxivIds
from common.commands.store_pipeline_log import StorePipelineLog
from common.commands.store_results import DEFAULT_S3_LOGS_BUCKET, StoreResults
from common.make_digest import make_paper_digest
from common.types import PipelineDigest
from scripts.job_config import fetch_config, load_job_from_s3
from scripts.pipelines import entity_pipelines
from scripts.process import (ENTITY_COMMANDS, TEX_PREPARATION_COMMANDS,
                             commands_by_entity, run_command)


def run_commands_for_arxiv_ids(
    CommandClasses: CommandList,
    arxiv_id_list: List[str],
    process_one_entity_at_a_time: bool,
    pipeline_args: Namespace,
) -> PipelineDigest:
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
        command_args.one_entity_at_a_time = process_one_entity_at_a_time
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
        try:
            run_command(command)
        # Catch-all for unexpected errors from running commands. With the amount of networking
        # and subprocess calls in the commands, it is simply unlikely that we can predict and
        # write exceptions for every possible exception that could be thrown.
        except Exception:  # pylint: disable=broad-except
            logging.error(
                "Unexpected exception processing paper: %s", traceback.format_exc()
            )
        logging.info("Finished running command %s", CommandCls.get_name())

    # Create digest describing the result of running these commands for these papers
    processing_summary: PipelineDigest = {}
    for id_ in arxiv_id_list:
        processing_summary[id_] = make_paper_digest(entity_pipelines, id_)
    return processing_summary


if __name__ == "__main__":

    PIPELINE_COMMANDS = TEX_PREPARATION_COMMANDS + ENTITY_COMMANDS
    ENTITY_NAMES = [p.entity_name for p in entity_pipelines]

    parser = ArgumentParser(
        description="Run pipeline to extract entities from arXiv papers."
    )
    parser.add_argument("-v", help="print debugging information", action="store_true")
    parser.add_argument(
        "--config",
        type=str,
        help=(
            "Path to a pipeline config on S3 that should be downloaded before the pipeline is run. "
            + "The only paths currently accepted are S3 addressed (prefixed with 's3://'). The "
            + "fetched file will be written to 'config.ini'. Any existing files at 'config.ini' "
            + "will be overwritten."
        ),
    )
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
        default=None,
        help="Number of days in the past for which to fetch arXiv papers. Cannot be used with"
        + "'--arxiv-ids' or '--arxiv-ids-file'",
    )
    parser.add_argument(
        "--s3-job-spec",
        type=str,
        help=(
            "Path to an object within the 'scholarphi-work-requests' S3 bucket that contains a "
            + "JSON spec for a job. See 'job_config.py' for a list of supported properties.'"
            + "Command line options (e.g., '--arxiv-ids', '--one-entity-at-a-time') take "
            + "precedence over the job configuration."
        ),
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
    parser.add_argument(
        "--max-papers",
        type=int,
        help=(
            "Maximum number of papers to process. This flag can be useful if you're using the "
            + "'--days' flag to process recent papers, but only want to process a small number "
            + "of those papers (i.e. if you are debugging the daily pipeline)."
        ),
    )
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
    add_one_entity_at_a_time_arg(parser)
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
        default=[],
        help=(
            "Email addresses that will receive a digest of processing results. The pipeline "
            + "must have Internet access and must be able to connect to Gmail's SMTP server."
        ),
    )
    parser.add_argument(
        "--notify-bcc",
        type=str,
        nargs="+",
        default=[],
        help=(
            "Email address that will be bcc'd with a digest of processing results. The pipeline "
            + "must have Internet access and must be able to connect to Gmail's SMTP server. "
            + " Also see '--notify-emails'."
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Do not save extracted entities to the database.",
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

    # Fetch pipeline config (includes credentials for accessing services).
    if args.config:
        fetch_config(args.config)

    # Load arXiv IDs from arguments or by fetching recent arXiv IDs from a database.
    arxiv_ids = load_arxiv_ids_using_args(args)
    if arxiv_ids is None and args.days is not None:
        logging.debug("Fetching new arXiv IDs for the last %d day(s).", args.days)
        arxiv_ids_path = "arxiv_ids.txt"
        fetch_command_args = create_args(
            v=args.v, days=args.days, output_file=arxiv_ids_path
        )
        fetch_arxiv_ids_command = FetchNewArxivIds(fetch_command_args)
        run_command(fetch_arxiv_ids_command)
        arxiv_ids = read_arxiv_ids_from_file(arxiv_ids_path)

    # Load options for the job from. Command line options for jobs take precedence over properties
    # defined in the job spec downloaded from S3.
    s3_job_spec = load_job_from_s3(args.s3_job_spec) if args.s3_job_spec else None
    arxiv_ids = s3_job_spec.arxiv_ids if (not arxiv_ids) and s3_job_spec else arxiv_ids

    # If the list of arXiv IDs still hasn't been defined, set it to an empty list. This will
    # allow the rest of this script to run, and provide hopefully useful debugging messages.
    if arxiv_ids is None:
        arxiv_ids = []
    if len(arxiv_ids) == 0:
        logging.warning(  # pylint: disable=logging-not-lazy
            "There are no arXiv IDs to process. To process papers, update the arguments for "
            + "arXiv IDs, the job spec file, or the criteria for arXiv IDs from the database."
        )

    dry_run = False
    if args.dry_run:
        dry_run = True
    elif s3_job_spec and (s3_job_spec.dry_run is not None):
        dry_run = s3_job_spec.dry_run

    emails = args.notify_emails
    if s3_job_spec and s3_job_spec.email:
        emails.append(s3_job_spec.email)

    one_entity_at_a_time = False
    if args.one_entity_at_a_time:
        one_entity_at_a_time = True
    elif s3_job_spec and (s3_job_spec.one_entity_at_a_time is not None):
        one_entity_at_a_time = s3_job_spec.one_entity_at_a_time

    logging.debug("Assembling the list of commands to be run.")
    command_classes = PIPELINE_COMMANDS

    # Store pipeline logs after results, so that we can include the result storage in the pipeline logs.
    if args.store_results:
        command_classes.append(StoreResults)
    if args.store_log:
        command_classes.append(StorePipelineLog)

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
            # Skip over irrelevant entity-processing commands.
            if CommandClass in ENTITY_COMMANDS:
                skip_command = True
                for entity_type in args.entities:
                    if CommandClass in commands_by_entity[entity_type]:
                        skip_command = False
                        break
                if skip_command:
                    continue
            # Optionally skip over database upload commands.
            if issubclass(CommandClass, DatabaseUploadCommand):
                if dry_run:
                    continue
            filtered_commands.append(CommandClass)
            if args.end is not None and command_name == args.end:
                break

    if args.max_papers is not None:
        logging.debug(
            "'--max-papers' flag is set. Only the first %d paper(s) will be processed.",
            args.max_papers,
        )
        arxiv_ids = arxiv_ids[: args.max_papers]

    logging.debug(
        "The following commands will be run, in this order: %s",
        [CommandClass.get_name() for CommandClass in filtered_commands],
    )

    # Run the pipeline one paper at a time, or one command at a time, depending on arguments.
    pipeline_digest: PipelineDigest = {}
    if args.one_paper_at_a_time:
        for arxiv_id in arxiv_ids:
            logging.info("Running pipeline for paper %s", arxiv_id)
            digest_for_paper = run_commands_for_arxiv_ids(
                filtered_commands, [arxiv_id], one_entity_at_a_time, args
            )
            # The pipeline digest must be updated after each arXiv ID is processed, because the
            # digest for a paper cannot be computed once the paper's data is deleted.
            pipeline_digest.update(digest_for_paper)
            if not args.keep_data:
                file_utils.delete_data(arxiv_id)
    else:
        logging.info("Running pipeline for papers %s", arxiv_ids)
        digest_for_papers = run_commands_for_arxiv_ids(
            filtered_commands, arxiv_ids, one_entity_at_a_time, args
        )
        pipeline_digest.update(digest_for_papers)

    # If requested, send email with paper-processing summaries.
    if len(emails) > 0 or len(args.notify_bcc) > 0:
        log_location = None
        if args.store_log:
            log_preview_url = (
                "https://s3.console.aws.amazon.com/s3/object/"
                + args.s3_output_bucket
                + "/master/logs/"
                + log_filename
            )
        else:
            log_preview_url = None

        email.send_digest_email(
            pipeline_digest, emails, args.notify_bcc, log_preview_url
        )
