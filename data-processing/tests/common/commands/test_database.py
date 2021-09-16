import pytest

from common.commands.database import OutputDetails


def test_output_details_validation_db_no_dir():
    # just check this doesn't throw an error
    OutputDetails.validate("db", None)
    OutputDetails("db", None)


def test_output_details_validation_db_with_dir():
    with pytest.raises(AssertionError):
       OutputDetails.validate("db", "hi")
    with pytest.raises(AssertionError):
       OutputDetails("db", "hi")


def test_output_details_validation_file_no_dir():
    with pytest.raises(AssertionError):
       OutputDetails.validate("file", None)
    with pytest.raises(AssertionError):
       OutputDetails("file", None)


def test_output_details_validation_file_with_dir():
    # just check this doesn't throw an error
    OutputDetails.validate("file", "there")
    OutputDetails("file", "there")


def test_output_details_validation_both_no_dir():
    with pytest.raises(AssertionError):
       OutputDetails.validate("both", None)
    with pytest.raises(AssertionError):
       OutputDetails("both", None)


def test_output_details_validation_both_with_dir():
    # just check this doesn't throw an error
    OutputDetails.validate("both", "bye")
    OutputDetails("both", "bye")


def test_output_details_construction_not_a_form():
    with pytest.raises(ValueError):
        OutputDetails("not a form", None)


def test_output_details_save_to_db():
    assert OutputDetails("db", None).save_to_db()
    assert not OutputDetails("file", "hi").save_to_db()
    assert OutputDetails("both", "bye").save_to_db()


def test_output_details_save_to_file():
    assert not OutputDetails("db", None).save_to_file()
    assert OutputDetails("file", "hi").save_to_file()
    assert OutputDetails("both", "bye").save_to_file()
