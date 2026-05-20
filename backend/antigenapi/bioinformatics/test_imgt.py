"""Unit tests for run_vquest — use mock HTTP responses, no network required."""

import io
import zipfile
from unittest.mock import MagicMock, patch

import pytest

from antigenapi.bioinformatics.imgt import run_vquest

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_HEADER = "sequence_id\tproductive\tsequence_alignment_aa\n"

_AIRR = "vquest_airr.tsv"
_PARAMS = "Parameters.txt"


def _make_zip(files: dict[str, str]) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        for name, content in files.items():
            zf.writestr(name, content)
    return buf.getvalue()


def _airr_row(n: int) -> str:
    return f"seq_{n}\tT\tSEQ{n}\n"


def _mock_zip_response(tsv: str, params: str = "params") -> MagicMock:
    m = MagicMock()
    m.headers = {"Content-Type": "application/zip"}
    m.content = _make_zip({_PARAMS: params, _AIRR: tsv})
    m.raise_for_status.return_value = None
    return m


def _fasta(n: int) -> str:
    """Build a FASTA string with n dummy records."""
    return "\n".join(f"> seq_{i}\nACGTACGT" for i in range(n))


def _airr_lines(result: dict) -> list[str]:
    return [line for line in result[_AIRR].splitlines() if line]


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_empty_input_raises():
    with pytest.raises(ValueError, match="No sequences supplied"):
        run_vquest("")


@patch("antigenapi.bioinformatics.imgt.requests.post")
def test_single_batch(mock_post):
    """Fewer than 50 sequences → one POST, results returned as-is."""
    tsv = _HEADER + _airr_row(0) + _airr_row(1)
    mock_post.return_value = _mock_zip_response(tsv)

    result = run_vquest(_fasta(2))

    mock_post.assert_called_once()
    lines = _airr_lines(result)
    assert lines[0] == _HEADER.strip()
    assert len(lines) == 3  # header + 2 rows


@patch("antigenapi.bioinformatics.imgt.requests.post")
def test_two_batch_merge(mock_post):
    """51 sequences → two POSTs; AIRR rows merged with a single header."""
    batch1 = _HEADER + "".join(_airr_row(i) for i in range(50))
    batch2 = _HEADER + _airr_row(50)
    mock_post.side_effect = [
        _mock_zip_response(batch1),
        _mock_zip_response(batch2),
    ]

    result = run_vquest(_fasta(51))

    assert mock_post.call_count == 2
    lines = _airr_lines(result)
    assert len(lines) == 52  # 1 header + 51 data rows
    assert lines.count(lines[0]) == 1, "header must appear exactly once"


@patch("antigenapi.bioinformatics.imgt.requests.post")
def test_three_batch_merge(mock_post):
    """101 sequences → three POSTs; rows from all batches correctly joined."""
    batch1 = _HEADER + "".join(_airr_row(i) for i in range(50))
    batch2 = _HEADER + "".join(_airr_row(i) for i in range(50, 100))
    batch3 = _HEADER + _airr_row(100)
    mock_post.side_effect = [
        _mock_zip_response(batch1),
        _mock_zip_response(batch2),
        _mock_zip_response(batch3),
    ]

    result = run_vquest(_fasta(101))

    assert mock_post.call_count == 3
    lines = _airr_lines(result)
    assert len(lines) == 102  # 1 header + 101 data rows
    assert lines.count(lines[0]) == 1, "header must appear exactly once"
    # Verify no row corruption at batch boundaries
    for row in lines[1:]:
        assert "\t" in row, f"Row appears corrupted: {row!r}"


@patch("antigenapi.bioinformatics.imgt.requests.post")
def test_html_error_response_raises(mock_post):
    """An HTML response from IMGT (e.g. validation error) raises ValueError."""
    html = b"<html><div class='form_error'>Bad species</div></html>"
    m = MagicMock()
    m.headers = {"Content-Type": "text/html; charset=utf-8"}
    m.content = html
    m.raise_for_status.return_value = None
    mock_post.return_value = m

    with pytest.raises(ValueError, match="Bad species"):
        run_vquest(_fasta(1))


@patch("antigenapi.bioinformatics.imgt.requests.post")
def test_bad_zip_response_raises(mock_post):
    """A non-ZIP, non-HTML response raises a meaningful ValueError."""
    m = MagicMock()
    m.headers = {"Content-Type": "application/octet-stream"}
    m.content = b"not a zip"
    m.raise_for_status.return_value = None
    mock_post.return_value = m

    with pytest.raises(ValueError, match="non-ZIP"):
        run_vquest(_fasta(1))


@patch("antigenapi.bioinformatics.imgt.requests.post")
def test_missing_zip_key_raises(mock_post):
    """A ZIP missing expected output files raises a meaningful ValueError."""
    m = MagicMock()
    m.headers = {"Content-Type": "application/zip"}
    m.content = _make_zip({"SomeOtherFile.txt": "data"})
    m.raise_for_status.return_value = None
    mock_post.return_value = m

    with pytest.raises(ValueError, match="missing expected file"):
        run_vquest(_fasta(1))


@patch("antigenapi.bioinformatics.imgt.requests.post")
def test_output_always_ends_with_newline(mock_post):
    """The returned AIRR TSV always ends with a newline regardless of batch count."""
    tsv = _HEADER.rstrip("\n") + "\n" + _airr_row(0).rstrip("\n")
    mock_post.return_value = _mock_zip_response(tsv)

    result = run_vquest(_fasta(1))
    assert result[_AIRR].endswith("\n")


@patch("antigenapi.bioinformatics.imgt.requests.post")
def test_timeout_passed_to_requests(mock_post):
    """requests.post must be called with a timeout to protect worker threads."""
    mock_post.return_value = _mock_zip_response(_HEADER + _airr_row(0))

    run_vquest(_fasta(1))

    _, kwargs = mock_post.call_args
    assert "timeout" in kwargs, "timeout must be passed to requests.post"


@patch("antigenapi.bioinformatics.imgt.requests.post")
def test_molecule_type_default_sent(mock_post):
    """moleculeType=Unknown is included in the POST data by default."""
    mock_post.return_value = _mock_zip_response(_HEADER + _airr_row(0))

    run_vquest(_fasta(1))

    _, kwargs = mock_post.call_args
    assert kwargs.get("data", {}).get("moleculeType") == "Unknown"


@patch("antigenapi.bioinformatics.imgt.requests.post")
def test_molecule_type_override(mock_post):
    """molecule_type kwarg is forwarded to the POST data."""
    mock_post.return_value = _mock_zip_response(_HEADER + _airr_row(0))

    run_vquest(_fasta(1), molecule_type="cDNA")

    _, kwargs = mock_post.call_args
    assert kwargs.get("data", {}).get("moleculeType") == "cDNA"
