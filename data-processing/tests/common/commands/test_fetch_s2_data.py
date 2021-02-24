from typing import List
from dataclasses import dataclass
from unittest.mock import Mock, patch

import pytest
import requests

from common.commands.fetch_s2_data import (
    FetchS2Metadata,
    S2ApiException,
    S2ApiRateLimitingException,
    S2PaperNotFoundException,
    S2ReferencesNotFoundException
)
from scripts.commands import run_command


@dataclass
class Args:
    arxiv_ids: List[str]
    arxiv_ids_file = None


def test_no_s2_paper_raises_exception():
    with patch("common.commands.fetch_s2_data.requests") as mock_requests:
        mock_resp = Mock()
        mock_requests.get.return_value = mock_resp
        mock_resp.ok = False
        mock_resp.status_code = 404

        command = FetchS2Metadata(Args(arxiv_ids=['fakeid']))
        with pytest.raises(S2PaperNotFoundException):
            run_command(command)


def test_no_s2_paper_references_raises_exeption():
    with patch("common.commands.fetch_s2_data.requests") as mock_requests:
        mock_resp = Mock()
        mock_requests.get.return_value = mock_resp
        mock_resp.ok = True
        mock_resp.json.return_value = {"references": []}

        command = FetchS2Metadata(Args(arxiv_ids=['fakeid']))
        with pytest.raises(S2ReferencesNotFoundException):
            run_command(command)


def test_reports_5xx_series_responses():
    with patch("common.commands.fetch_s2_data.requests") as mock_requests:
        mock_requests.get.side_effect = requests.exceptions.HTTPError()

        command = FetchS2Metadata(Args(arxiv_ids=['fakeid']))
        with pytest.raises(S2ApiException):
            run_command(command)


def test_reports_timeout_errors():
    with patch("common.commands.fetch_s2_data.requests") as mock_requests:
        mock_requests.get.side_effect = requests.exceptions.Timeout()

        command = FetchS2Metadata(Args(arxiv_ids=['fakeid']))
        with pytest.raises(S2ApiException):
            run_command(command)


def test_reports_rate_limiting():
    with patch("common.commands.fetch_s2_data.requests") as mock_requests:
        mock_resp = Mock()
        mock_requests.get.return_value = mock_resp
        mock_resp.ok = False
        mock_resp.status_code = 429

        command = FetchS2Metadata(Args(arxiv_ids=['fakeid']))
        with pytest.raises(S2ApiRateLimitingException):
            run_command(command)


def test_reports_generic_exception_for_unhandled_non_2xxs():
    with patch("common.commands.fetch_s2_data.requests") as mock_requests:
        mock_resp = Mock()
        mock_requests.get.return_value = mock_resp
        mock_resp.ok = False
        mock_resp.status_code = 499

        command = FetchS2Metadata(Args(arxiv_ids=['fakeid']))
        with pytest.raises(S2ApiException):
            run_command(command)
