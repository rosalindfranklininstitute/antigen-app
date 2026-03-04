import numpy as np
import pandas as pd
import pytest

from antigenapi.parsers import parse_elisa_file


def test_parse_elisa_file_returns_96_flattened_values(monkeypatch):
    """OD values are read from the expected cell range and returned flat."""
    source = pd.DataFrame(np.arange(22 * 13).reshape(22, 13))
    expected = source.iloc[14:22, 1:13].astype(float).values.ravel()

    monkeypatch.setattr("antigenapi.parsers.pd.read_excel", lambda _: source)

    values = parse_elisa_file("ignored.xlsx")

    assert len(values) == 96
    assert np.array_equal(values, expected)


def test_parse_elisa_file_raises_when_source_spreadsheet_has_too_few_rows(monkeypatch):
    """Files that are shorter than expected yield fewer than 96 cells after slicing."""
    source = pd.DataFrame(np.arange(20 * 13).reshape(20, 13))
    monkeypatch.setattr("antigenapi.parsers.pd.read_excel", lambda _: source)

    with pytest.raises(AssertionError):
        parse_elisa_file("ignored.xlsx")


def test_parse_elisa_file_raises_when_well_values_are_not_numeric(monkeypatch):
    """Non-numeric cell contents (e.g. text in the OD range) raise on conversion."""
    source = pd.DataFrame(np.full((22, 13), "x"))
    monkeypatch.setattr("antigenapi.parsers.pd.read_excel", lambda _: source)

    with pytest.raises((ValueError, TypeError)):
        parse_elisa_file("ignored.xlsx")
