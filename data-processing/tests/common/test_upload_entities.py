from unittest.mock import Mock, patch

from common.commands.database import OutputDetails
from common.upload_entities import save_entities


def test_save_entities_with_file():
    output_details = OutputDetails("file", "hi")

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
            assert mock_upload_entities.mock_write_to_file


def test_save_entities_with_db():
    output_details = OutputDetails("db", None)

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
            assert not mock_upload_entities.mock_write_to_file


def test_save_entities_with_both():
    output_details = OutputDetails("both", "bye")

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
            assert mock_upload_entities.mock_write_to_file
