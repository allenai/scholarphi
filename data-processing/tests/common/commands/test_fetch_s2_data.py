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

references_fields = ["authors", "title", "externalIds", "venue", "year"]
fields_query = "fields=references." + ",references.".join(references_fields)


@dataclass
class Args:
    arxiv_ids: List[str]
    arxiv_ids_file = None


def test_makes_request_over_public_api_in_absence_of_partner_token():
    with patch("common.commands.fetch_s2_data.os.getenv") as mock_getenv:
        mock_getenv.return_value = None

        with patch("common.commands.fetch_s2_data.requests") as mock_requests:
            mock_requests.get.return_value = Mock()

            command = FetchS2Metadata(Args(arxiv_ids=['fakeid']))
            command._mk_api_request("fakeid")
            mock_requests.get.assert_called_with(
                f"https://api.semanticscholar.org/graph/v1/paper/arXiv:fakeid?{fields_query}",
                headers=None
            )


def test_makes_request_over_partner_api_when_token_present():
    with patch("common.commands.fetch_s2_data.os.getenv") as mock_getenv:
        mock_getenv.side_effect = lambda x, y: "some_token" if x == 'S2_PARTNER_API_TOKEN' else None

        with patch("common.commands.fetch_s2_data.requests") as mock_requests:
            mock_requests.get.return_value = Mock()

            command = FetchS2Metadata(Args(arxiv_ids=['fakeid']))
            command._mk_api_request("fakeid")
            mock_requests.get.assert_called_with(
                f"https://partner.semanticscholar.org/graph/v1/paper/arXiv:fakeid?{fields_query}",
                headers={"x-api-key": "some_token"}
            )


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
