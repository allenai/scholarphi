from unittest.mock import call, patch

import pytest

from common.upload_entities import OutputDetails, save_entities
from common.types import BoundingBox, EntityUploadInfo


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
                filename="something.json"
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
                filename="something.json"
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
                filename="something.json"
            )

            assert mock_upload_entities.called
            assert mock_write_to_file.called


def test_save_entities_considers_boundingboxless_arg():
    output_details = OutputDetails(["file", "db"], "bye")

    item_with_bb = EntityUploadInfo(
        id_="hi",
        type_="citation",
        bounding_boxes=[
            BoundingBox(
                left=0.1,
                top=0.2,
                width=0.3,
                height=0.4,
                page=5,
            )
        ],
        data={"key": "hello"},
    )
    item_without_bb = EntityUploadInfo(
        id_="bye",
        type_="citation",
        bounding_boxes=[],
        data={"key": "goodbye"},
    )
    items = [item_with_bb, item_without_bb]

    with patch("common.upload_entities.upload_entities") as mock_upload_entities:
        with patch("common.upload_entities.write_to_file") as mock_write_to_file:
            s2_id = "s2id"
            arxiv_id = "arxivid"
            data_version = None
            filename = "something.json"

            # do_not_save_boundingboxless_to_db=False
            save_entities(
                s2_id=s2_id,
                arxiv_id=arxiv_id,
                entity_infos=items,
                data_version=None,
                output_details=output_details,
                filename=filename,
                do_not_save_boundingboxless_to_db=False,
            )

            # do_not_save_boundingboxless_to_db=True
            save_entities(
                s2_id=s2_id,
                arxiv_id=arxiv_id,
                entity_infos=items,
                data_version=None,
                output_details=output_details,
                filename=filename,
                do_not_save_boundingboxless_to_db=True,
            )

            upload_entity_call_false = call(
                s2_id=s2_id,
                arxiv_id=arxiv_id,
                entities=items,
                data_version=data_version,
            )
            upload_entity_call_true = call(
                s2_id=s2_id,
                arxiv_id=arxiv_id,
                entities=[item_with_bb],
                data_version=data_version,
            )
            write_to_file_call_false = call(
                entity_infos=items,
                output_file_name=filename,
            )
            write_to_file_call_true = call(
                entity_infos=items,
                output_file_name=filename,
            )

            mock_upload_entities.assert_has_calls(
                [
                    upload_entity_call_false,
                    upload_entity_call_true,
                ]
            )
            mock_write_to_file.assert_has_calls(
                [
                    write_to_file_call_false,
                    write_to_file_call_true,
                ]
            )

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


def test_output_details_can_save_to_db():
    assert OutputDetails(["db"], None).can_save_to_db()
    assert not OutputDetails(["file"], "hi").can_save_to_db()
    assert OutputDetails(["file", "db"], "bye").can_save_to_db()


def test_output_details_can_save_to_file():
    assert not OutputDetails(["db"], None).can_save_to_file()
    assert OutputDetails(["file"], "hi").can_save_to_file()
    assert OutputDetails(["file", "db"], "bye").can_save_to_file()
