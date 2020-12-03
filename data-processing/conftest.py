from typing import Any, List

import pytest


def pytest_addoption(parser: Any) -> None:
    parser.addoption(
        "--all",
        action="store_true",
        default=False,
        help="Run all tests, including slow tests.",
    )


def pytest_collection_modifyitems(
    config: Any, items: List[pytest.Item]  # pylint: disable=unused-argument
) -> None:

    # If the caller indicated specific tests they want to run with markers or keywords, use
    # the default behavior for filtering tests.
    if config.option.markexpr or config.option.keyword:
        return

    # If running all tests, skip slow tests unless the '--all' flag is provided.
    if not config.getoption("--all"):
        for item in items:
            skip_marker = pytest.mark.skip(
                reason="slow tests are run only with 'slow' marker or '--all' flag."
            )
            if "slow" in item.keywords:
                item.add_marker(skip_marker)
