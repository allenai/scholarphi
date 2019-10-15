from abc import ABC, abstractmethod
from argparse import ArgumentParser
from typing import Generic, Iterator, TypeVar

I = TypeVar("I")
R = TypeVar("R")


class Command(ABC, Generic[I, R]):
    @property
    @abstractmethod
    def name(self) -> str:
        """
        Get the name for this command for the command line interface.
        """

    @property
    @abstractmethod
    def description(self) -> str:
        """
        Get a description of this command that can be shown on the command line.
        """

    def init_parser(self, parser: ArgumentParser) -> str:
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
