import os
from abc import ABC, abstractmethod
from argparse import ArgumentParser
from typing import Any, Generic, Iterator, List, Optional, TypeVar

from explanations.directories import get_arxiv_ids
from explanations.types import ArxivId, Path

I = TypeVar("I")
R = TypeVar("R")


class Command(ABC, Generic[I, R]):
    def __init__(self, args: Any) -> None:
        """
        Default constructor for a command. Saves a reference to the args with which the command was
        invoked (will be a namespace returned by 'ArgumentParser.parse_args').
        """
        self.args = args

    @staticmethod
    @abstractmethod
    def get_name() -> str:
        """
        Get the name for this command for the command line interface.
        """

    @staticmethod
    @abstractmethod
    def get_description() -> str:
        """
        Get a description of this command that can be shown on the command line.
        """

    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        """
        (Optionally) override this method to add provide command line arguments for this command.
        """

    @abstractmethod
    def load(self) -> Iterator[I]:
        """
        Load data to process.
        """

    @abstractmethod
    def process(self, item: I) -> Iterator[R]:
        """
        Process data, yield results.
        """

    @abstractmethod
    def save(self, item: I, result: R) -> None:
        """
        Save results.
        """


class ArxivBatchCommand(Command[I, R], ABC):
    """
    A command for a batch job that will process a number of papers each indexed by arXiv ID.
    This command conveniently loads in a set of arXiv IDs from user input or, or from the
    output directory of a prior job. It makes these arXiv IDs available in the
    'self.arxiv_ids' property when the command is constructed.
    """

    def __init__(self, args: Any) -> None:
        super().__init__(args)
        self.arxiv_ids = self._load_arxiv_ids(args)

    @staticmethod
    def init_parser(parser: ArgumentParser) -> None:
        parser.add_argument(
            "--arxiv-ids", type=str, nargs="+", help="arXiv IDs to process"
        )
        parser.add_argument(
            "--arxiv-ids-file",
            type=str,
            help=(
                "Name of a file containing arXiv IDs to process, with one arXiv ID per line. "
                + "If both this argument and --arxiv-ids is specified, arXiv IDs from both will be loaded"
            ),
        )

    def _load_arxiv_ids(self, args: Any) -> List[ArxivId]:
        arxiv_ids: List[ArxivId] = []

        if args.arxiv_ids is not None:
            arxiv_ids.extend(args.arxiv_ids)

        if args.arxiv_ids_file is not None:
            if not os.path.exists(args.arxiv_ids_file):
                raise SystemExit("Error: arXiv IDs file not found.")
            with open(args.arxiv_ids_file) as arxiv_ids_file:
                arxiv_ids.extend(arxiv_ids_file.readlines())

        if args.arxiv_ids is None and args.arxiv_ids_file is None:
            input_path = self.get_arxiv_ids_dir()
            if input_path is None:
                raise SystemExit(
                    "Error: This command has no arXiv IDs to process. You must provide arXiv IDs"
                    + "with the '--arxiv-ids' or '--arxiv-ids-file' arguments, or the "
                    + "'get_arxiv_ids_dir' method must be specified for this command."
                )
            arxiv_ids.extend(get_arxiv_ids(input_path))

        return arxiv_ids

    @abstractmethod
    def get_arxiv_ids_dir(self) -> Optional[Path]:
        """
        Path to data directory containing folders where each is the name of an arXiv ID to process.
        By defining this value, you provide an easy way for your command to load a list of arXiv
        IDs to process based on the output of a previous job. Return 'None' if you want to require
        a user to specify the arXiv IDs on the command line.
        """
