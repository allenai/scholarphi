from abc import ABC, abstractmethod
from argparse import ArgumentParser
from typing import Any, Generic, Iterator, TypeVar

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
