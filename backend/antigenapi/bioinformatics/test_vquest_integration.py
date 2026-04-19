"""Integration tests for run_vquest — hit the real IMGT/V-QUEST API.

Run with:
    DJANGO_SECRET_KEY=test DJANGO_USE_SQLITE=1 \\
    pytest antigenapi/bioinformatics/test_vquest_integration.py \\
           -m integration --no-cov -p no:mypy -o "addopts=" -v
"""

from pathlib import Path

import pytest

from antigenapi.bioinformatics.imgt import as_fasta_files, load_sequences, run_vquest

EXAMPLE_ZIP = Path(__file__).parents[3] / "docs/example-data/smCD1-sequencing-data.zip"


@pytest.mark.integration
def test_run_vquest_multi_batch():
    """run_vquest correctly merges results across two API batches (51 sequences).

    The example zip contains 8 real alpaca VHH sequences.  We replicate them
    under unique names to reach 51, which forces two POST requests to IMGT
    (batch of 50, then batch of 1).  The returned AIRR TSV must have exactly
    51 data rows and a single header line.
    """
    base_seqs = load_sequences(EXAMPLE_ZIP)
    assert len(base_seqs) == 8, "Expected 8 sequences in example zip"

    # Build 51 sequences with unique names by cycling through base_seqs
    seq_cycle = list(base_seqs.items())
    sequences = {
        f"{name}_r{i}": seq
        for i, (name, seq) in enumerate(
            seq_cycle[j % len(seq_cycle)] for j in range(51)
        )
    }
    assert len(sequences) == 51

    fasta = as_fasta_files(sequences, max_file_size=None)[0]
    result = run_vquest(fasta)

    assert "Parameters.txt" in result
    assert "vquest_airr.tsv" in result

    airr_lines = [
        line for line in result["vquest_airr.tsv"].splitlines() if line.strip()
    ]
    header = airr_lines[0]
    data_rows = airr_lines[1:]

    assert len(data_rows) == 51, f"Expected 51 data rows, got {len(data_rows)}"
    # Header must appear exactly once (not duplicated at the batch boundary)
    assert airr_lines.count(header) == 1, "AIRR header duplicated across batches"
