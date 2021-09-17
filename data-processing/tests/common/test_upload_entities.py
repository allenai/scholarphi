from unittest.mock import patch

import pytest

from common.upload_entities import OutputDetails, save_entities


def test_save_entities_with_file():
    output_details = OutputDetails(["file"], "hi")

    with patch("common.upload_entities.upload_entities") as mock_upload_entities:
        with patch("common.upload_entities.write_to_file") as mock_write_to_file:
            save_entities(
                s2_id="s2id",
                arxiv_id="arxivid",
                entity_infos=[],
                data_version=None,
                output_details=output_details,
                filename="something.jsonl"
            )

            assert not mock_upload_entities.called
            assert mock_write_to_file.called


def test_save_entities_with_db():
    output_details = OutputDetails(["db"], None)

    with patch("common.upload_entities.upload_entities") as mock_upload_entities:
        with patch("common.upload_entities.write_to_file") as mock_write_to_file:
            save_entities(
                s2_id="s2id",
                arxiv_id="arxivid",
                entity_infos=[],
                data_version=None,
                output_details=output_details,
                filename="something.jsonl"
            )

            assert mock_upload_entities.called
            assert not mock_write_to_file.called


def test_save_entities_with_both():
    output_details = OutputDetails(["file", "db"], "bye")

    with patch("common.upload_entities.upload_entities") as mock_upload_entities:
        with patch("common.upload_entities.write_to_file") as mock_write_to_file:
            save_entities(
                s2_id="s2id",
                arxiv_id="arxivid",
                entity_infos=[],
                data_version=None,
                output_details=output_details,
                filename="something.jsonl"
            )

            assert mock_upload_entities.called
            assert mock_write_to_file.called


def test_output_details_validation_db_no_dir():
    # just check this doesn't throw an error
    OutputDetails.validate(["db"], None)
    OutputDetails(["db"], None)


def test_output_details_validation_db_with_dir():
    with pytest.raises(AssertionError):
        OutputDetails.validate(["db"], "hi")
    with pytest.raises(AssertionError):
        OutputDetails(["db"], "hi")


def test_output_details_validation_file_no_dir():
    with pytest.raises(AssertionError):
        OutputDetails.validate(["file"], None)
    with pytest.raises(AssertionError):
        OutputDetails(["file"], None)


def test_output_details_validation_file_with_dir():
    # just check this doesn't throw an error
    OutputDetails.validate(["file"], "there")
    OutputDetails(["file"], "there")


def test_output_details_validation_both_no_dir():
    with pytest.raises(AssertionError):
        OutputDetails.validate(["file", "db"], None)
    with pytest.raises(AssertionError):
        OutputDetails(["file", "db"], None)


def test_output_details_validation_both_with_dir():
    # just check this doesn't throw an error
    OutputDetails.validate(["db", "file"], "bye")
    OutputDetails(["db", "file"], "bye")


def test_output_details_construction_not_a_form():
    with pytest.raises(ValueError):
        OutputDetails(["not a form"], None)


def test_output_details_save_to_db():
    assert OutputDetails(["db"], None).save_to_db()
    assert not OutputDetails(["file"], "hi").save_to_db()
    assert OutputDetails(["file", "db"], "bye").save_to_db()


def test_output_details_save_to_file():
    assert not OutputDetails(["db"], None).save_to_file()
    assert OutputDetails(["file"], "hi").save_to_file()
    assert OutputDetails(["file", "db"], "bye").save_to_file()
