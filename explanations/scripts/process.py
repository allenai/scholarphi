import argparse
from typing import Any

from scripts.command import Command
from scripts.extract_equations import ExtractEquations

command_classes = [ExtractEquations]


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Process arXiv papers.")
    subparsers = parser.add_subparsers(help="data processing commands")

    for CommandClass in command_classes:
        command: Command[Any, Any] = CommandClass()
        command_parser = subparsers.add_parser(command.name, help=command.description)
        command_parser.set_defaults(command=command)
        command.init_parser(command_parser)

    args = parser.parse_args()
    if not hasattr(args, "command"):
        parser.print_help()
        raise SystemExit

    command = args.command
    for item in command.load():
        for result in command.process(item):
            command.save(item, result)
