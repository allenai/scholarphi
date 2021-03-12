from unittest.mock import Mock, patch
import urllib3

import pytest
import requests

from common.fetch_arxiv import FetchFromArxivException, fetch_from_arxiv


def test_raises_appropriate_exception_if_request_fails_outright():
    with patch("common.fetch_arxiv.save_source_archive") as mock_save_source:
        with patch("common.fetch_arxiv.requests") as mock_requests:
            mock_requests.get.side_effect = urllib3.exceptions.ProtocolError()

            with pytest.raises(FetchFromArxivException):
                fetch_from_arxiv("fakeid")

            assert not mock_save_source.called

        with patch("common.fetch_arxiv.requests") as mock_requests:
            mock_requests.get.side_effect = requests.exceptions.HTTPError()

            with pytest.raises(FetchFromArxivException):
                fetch_from_arxiv("fakeid")

            assert not mock_save_source.called


def test_raises_regular_error_in_case_of_404():
    with patch("common.fetch_arxiv.save_source_archive") as _:
        with patch("common.fetch_arxiv.requests") as mock_requests:
            mock_resp = Mock()
            mock_resp.ok = False
            mock_resp.status_code = 404
            mock_requests.get.return_value = mock_resp

            try:
                fetch_from_arxiv("fakeid")
            except Exception as e:
                assert not isinstance(e, FetchFromArxivException)
            else:
                assert False, "Expected to receive an exception"


def test_raises_appropriate_exception_if_other_non_ok_response():
    with patch("common.fetch_arxiv.save_source_archive") as _:
        with patch("common.fetch_arxiv.requests") as mock_requests:
            mock_resp = Mock()
            mock_resp.ok = False
            mock_resp.status_code = 403
            mock_requests.get.return_value = mock_resp

            with pytest.raises(FetchFromArxivException):
                fetch_from_arxiv("fakeid")


def test_saves_source_if_all_good():
    with patch("common.fetch_arxiv.save_source_archive") as mock_save_source:
        with patch("common.fetch_arxiv.requests") as mock_requests:
            mock_resp = Mock()
            mock_resp.ok = True
            mock_resp.status_code = 200
            mock_resp.content = "i am some content"
            mock_resp.headers = {"Content-Type": "application/x-eprint-tar"}
            mock_requests.get.return_value = mock_resp

            fetch_from_arxiv("fakeid")

            mock_save_source.assert_called_with("fakeid", "i am some content", None)


def test_raises_fetch_exception_if_content_is_pdf():
    with patch("common.fetch_arxiv.save_source_archive") as _:
        with patch("common.fetch_arxiv.requests") as mock_requests:
            mock_resp = Mock()
            mock_resp.ok = True
            mock_resp.status_code = 200
            mock_resp.content = "some pdf content"
            mock_resp.headers = {"Content-Type": "application/pdf"}
            mock_requests.get.return_value = mock_resp

            with pytest.raises(FetchFromArxivException):
                fetch_from_arxiv("fakeid")
