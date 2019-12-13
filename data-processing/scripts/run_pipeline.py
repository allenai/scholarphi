import logging
import sys
from argparse import ArgumentParser

from scripts.command import (add_arxiv_id_filter_args, create_args,
                             load_arxiv_ids_using_args,
                             read_arxiv_ids_from_file)
from scripts.fetch_new_arxiv_ids import FetchNewArxivIds
from scripts.process import MAIN_PIPELINE_COMMANDS, run_command

if __name__ == "__main__":

    parser = ArgumentParser(
        description="Run pipeline to extract entities from arXiv papers."
    )
    parser.add_argument("-v", help="print debugging information", action="store_true")
    add_arxiv_id_filter_args(parser)
    parser.add_argument(
        "--days",
        type=int,
        default=1,
        help="Number of days in the past for which to fetch arXiv papers. Cannot be used with "
        + "arguments that specify which arXiv IDs to process)",
    )
    command_names = [c.get_name() for c in MAIN_PIPELINE_COMMANDS]
    parser.add_argument(
        "--start",
        help="Command to start running the pipeline at.",
        choices=command_names,
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
        "--end", help="Command to stop running the pipeline at.", choices=command_names
    )

    args = parser.parse_args()
    if args.v:
        logging.basicConfig(level=logging.DEBUG)

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

    for CommandClass in MAIN_PIPELINE_COMMANDS:

        if args.start is not None and CommandClass.get_name() == args.start:
            reached_start_command = True

        if not reached_start_command:
            logging.info(
                "Start command not yet reached. Skipping %s", CommandClass.get_name()
            )
            continue

        # Initialize arguments for each command to defaults.
        command_args_parser = ArgumentParser()
        CommandClass.init_parser(command_args_parser)
        command_args = command_args_parser.parse_known_args("")[0]

        # Pass pipeline arguments to command.
        command_args.arxiv_ids = arxiv_ids
        command_args.arxiv_ids_file = None
        command_args.v = args.v
        command_args.source = args.source

        logging.debug(
            "Creating command %s with args %s",
            CommandClass.get_name(),
            vars(command_args),
        )
        command = CommandClass(command_args)
        logging.debug("Launching command %s", CommandClass.get_name())
        run_command(command)

        if args.end is not None and CommandClass.get_name() == args.end:
            logging.info("Finished the end command. Skipping the rest of the commands.")
            break
