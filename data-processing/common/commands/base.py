import os
from abc import ABC, abstractmethod
from argparse import ArgumentParser
from typing import Any, Generic, Iterator, List, Optional, Type, TypeVar

from common import directories
from common.types import ArxivId, Path

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


CommandList = List[Type[Command[Any, Any]]]  # pylint: disable=unsubscriptable-object


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
        add_arxiv_id_filter_args(parser)

    def _load_arxiv_ids(self, args: Any) -> List[ArxivId]:
        arxiv_ids = load_arxiv_ids_using_args(args)
        if arxiv_ids is None:
            input_dirkey = self.get_arxiv_ids_dirkey()
            if input_dirkey is None:
                raise SystemExit(
                    "Error: This command has no arXiv IDs to process. You must provide arXiv IDs "
                    + "with the '--arxiv-ids' or '--arxiv-ids-file' arguments, or the "
                    + "'get_arxiv_ids_dir' method must be specified for this command."
                )
            arxiv_ids = list(directories.get_arxiv_ids(input_dirkey))

        return arxiv_ids

    @abstractmethod
    def get_arxiv_ids_dirkey(self) -> Optional[str]:
        """
        Directory key for the input directory where each folder is an arXiv ID to process. By
        defining this value, you provide an easy way for your command to load a list of arXiv
        IDs to process based on the output of a previous job. Return 'None' if you want to require
        a user to specify the arXiv IDs on the command line.
        """


def add_arxiv_id_filter_args(parser: ArgumentParser) -> None:
    parser.add_argument("--arxiv-ids", type=str, nargs="+", help="arXiv IDs to process")
    parser.add_argument(
        "--arxiv-ids-file",
        type=str,
        help=(
            "Name of a file containing arXiv IDs to process, with one arXiv ID per line. "
            + "Each line can also optionally include a comment after the arXiv ID, starting "
            + "with a hash '#' sign; everything after the hash sign will be ignored."
            + "If both this argument and --arxiv-ids is specified, arXiv IDs from both will be loaded"
        ),
    )


def load_arxiv_ids_using_args(args: Any) -> Optional[List[ArxivId]]:
    if args.arxiv_ids is None and args.arxiv_ids_file is None:
        return None

    arxiv_ids: List[ArxivId] = []
    if args.arxiv_ids is not None:
        arxiv_ids.extend(args.arxiv_ids)

    if args.arxiv_ids_file is not None:
        arxiv_ids.extend(read_arxiv_ids_from_file(args.arxiv_ids_file))

    return arxiv_ids


def read_arxiv_ids_from_file(path: Path) -> List[ArxivId]:
    if not os.path.exists(path):
        raise SystemExit("Error: arXiv IDs %s file not found." % (path,))
    with open(path) as arxiv_ids_file:
        arxiv_ids = []
        for l in arxiv_ids_file:
            comment_start = l.index("#")
            if comment_start != -1:
                arxiv_ids.append(l[:comment_start].strip())
            else:
                arxiv_ids.append(l.strip())

        return arxiv_ids


class Args:
    """
    Empty object on which arbitrary attributes can be set.
    """


def create_args(**kwargs: Any) -> Args:
    """
    Create an artificial set of args that can be passed to a command.
    """
    arguments = Args()
    for key, value in kwargs.items():
        setattr(arguments, key, value)
    return arguments
