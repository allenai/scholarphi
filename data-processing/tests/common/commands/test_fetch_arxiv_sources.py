from dataclasses import dataclass
from typing import List, Optional
from unittest.mock import call, patch

import pytest

from common.commands.fetch_arxiv_sources import (
    BACKOFF_FETCH_DELAY,
    DEFAULT_FETCH_DELAY,
    FetchArxivSources,
    MAX_FETCH_ATTEMPTS
)
from common.fetch_arxiv import FetchFromArxivException
from scripts.commands import run_command


@dataclass
class Args:
    arxiv_ids: List[str]
    arxiv_ids_file: Optional[str]
    source: str
    s3_bucket: Optional[str]


def test_makes_up_to_k_attempts_to_fetch_from_arxiv():
    with patch("common.commands.fetch_arxiv_sources.time.sleep") as mock_sleep:
        with patch("common.commands.fetch_arxiv_sources.fetch_from_arxiv") as mock_fetch:
            mock_fetch.side_effect = FetchFromArxivException()
            args = Args(
                arxiv_ids=["fakeid"],
                arxiv_ids_file=None,
                source="arxiv",
                s3_bucket=None
            )
            command = FetchArxivSources(args)

            with pytest.raises(FetchFromArxivException):
                run_command(command)

            assert mock_fetch.call_count == MAX_FETCH_ATTEMPTS
            assert mock_sleep.call_args_list == [
                call(BACKOFF_FETCH_DELAY,),
                call(BACKOFF_FETCH_DELAY,),
                call(BACKOFF_FETCH_DELAY,),
            ]


def test_breaks_retry_loop_as_soon_as_successful_fetch_from_arxiv():
    with patch("common.commands.fetch_arxiv_sources.time.sleep") as mock_sleep:
        with patch("common.commands.fetch_arxiv_sources.fetch_from_arxiv") as mock_fetch:
            mock_fetch.return_value = "Some result"
            args = Args(
                arxiv_ids=["fakeid"],
                arxiv_ids_file=None,
                source="arxiv",
                s3_bucket=None
            )
            command = FetchArxivSources(args)

            run_command(command)

            assert mock_fetch.call_count == 1
            assert mock_sleep.call_count == 1


