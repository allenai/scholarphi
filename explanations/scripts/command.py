from abc import ABC, abstractmethod
from argparse import ArgumentParser
from typing import Generic, Iterator, TypeVar

I = TypeVar("I")
R = TypeVar("R")


class Command(ABC, Generic[I, R]):
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
    def init_parser(parser: ArgumentParser) -> str:
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
