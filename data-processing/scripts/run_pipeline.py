import argparse
import logging

from scripts.command import (
    add_arxiv_id_filter_args,
    create_args,
    load_arxiv_ids_using_args,
    read_arxiv_ids_from_file,
)
from scripts.fetch_new_arxiv_ids import FetchNewArxivIds
from scripts.process import MAIN_PIPELINE_COMMANDS, run_command

if __name__ == "__main__":

    parser = argparse.ArgumentParser(
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

    for CommandClass in MAIN_PIPELINE_COMMANDS:
        command_args = create_args(v=args.v, arxiv_ids=arxiv_ids, arxiv_ids_file=None)
        command = CommandClass(command_args)
        logging.debug("Launching command %s", CommandClass.get_name())
        run_command(command)
