import json
from types import SimpleNamespace

import pandas as pd
import pytest

from antigenapi.bioinformatics import blast


def _blast_payload(*, query_title, query_len, hits):
    return json.dumps(
        {
            "BlastOutput2": [
                {
                    "report": {
                        "results": {
                            "search": {
                                "query_title": query_title,
                                "query_len": query_len,
                                "hits": hits,
                            }
                        }
                    }
                }
            ]
        }
    )


def test_parse_blast_results_filters_self_hits_alignment_and_evalue():
    hits = [
        {
            "description": [{"title": "Query A"}],
            "hsps": [
                {
                    "align_len": 95,
                    "evalue": 1e-10,
                    "num": 1,
                    "qseq": "AAAA",
                    "hseq": "MADE",
                    "midline": "....",
                    "bit_score": 150,
                    "identity": 90,
                }
            ],
        },
        {
            "description": [{"title": "Subject B"}],
            "hsps": [
                {
                    "align_len": 80,
                    "evalue": 1e-10,
                    "num": 1,
                    "qseq": "AAAA",
                    "hseq": "CCCC",
                    "midline": "....",
                    "bit_score": 100,
                    "identity": 70,
                },  # below default 90% alignment threshold
                {
                    "align_len": 95,
                    "evalue": 0.5,
                    "num": 2,
                    "qseq": "AAAA",
                    "hseq": "DDDD",
                    "midline": "....",
                    "bit_score": 95,
                    "identity": 88,
                },  # above default e-value threshold
                {
                    "align_len": 95,
                    "evalue": 1e-20,
                    "num": 3,
                    "qseq": "AAAA",
                    "hseq": "EEEE",
                    "midline": "....",
                    "bit_score": 180,
                    "identity": 91,
                },
            ],
        },
    ]
    airr_df = pd.DataFrame({"cdr3_aa": ["CASS"]}, index=["Query A"])

    parsed = blast.parse_blast_results(
        _blast_payload(query_title="Query A", query_len=100, hits=hits),
        query_type="full",
        airr_df=airr_df,
    )

    assert len(parsed) == 1
    assert parsed[0]["query_title"] == "Query A"
    assert parsed[0]["query_cdr3"] == "CASS"
    assert parsed[0]["subject_title"] == "Subject B"
    assert parsed[0]["submatch_no"] == 3
    assert parsed[0]["align_perc"] == 95.0
    assert parsed[0]["ident_perc"] == 95.79


def test_parse_blast_results_uses_cdr3_from_query_title_and_sorts():
    hits = [
        {
            "description": [{"title": "Subject C"}],
            "hsps": [
                {
                    "align_len": 95,
                    "evalue": 1e-10,
                    "num": 1,
                    "qseq": "AAAA",
                    "hseq": "MADE",
                    "midline": "....",
                    "bit_score": 110,
                    "identity": 90,
                },
                {
                    "align_len": 99,
                    "evalue": 1e-12,
                    "num": 2,
                    "qseq": "AAAA",
                    "hseq": "CCCC",
                    "midline": "....",
                    "bit_score": 120,
                    "identity": 95,
                },
            ],
        }
    ]

    parsed = blast.parse_blast_results(
        _blast_payload(query_title="CDR3: CARDR", query_len=100, hits=hits),
        query_type="cdr3",
    )

    assert len(parsed) == 2
    assert parsed[0]["query_cdr3"] == "CARDR"
    assert parsed[0]["align_perc"] >= parsed[1]["align_perc"]


def test_get_db_fasta_uses_run_filter_and_disambiguates_duplicate_names(monkeypatch):
    df = pd.DataFrame(
        {
            "sequence_id": ["s1_A01", "s2_A01", "s3_A01"],
            "sequence_alignment_aa": ["AA..", "MK..", "CC.."],
            "cdr3_aa": ["AAA", "MKD", "CCC"],
            "nanobody_autoname": ["NB", "NB", "n/a (index not found)"],
            "sequencing_run": [1, 2, 3],
        }
    )

    calls = {}

    def _fake_read_seqrun_results(pk, usecols):
        calls["pk"] = pk
        calls["usecols"] = usecols
        return df

    def _fake_as_fasta_files(seq_data, max_file_size=None):
        calls["seq_data"] = seq_data
        calls["max_file_size"] = max_file_size
        return ["FASTA-OK"]

    monkeypatch.setattr(blast, "read_seqrun_results", _fake_read_seqrun_results)
    monkeypatch.setattr(blast, "as_fasta_files", _fake_as_fasta_files)

    result = blast.get_db_fasta(include_run=7, query_type="full")

    assert result == "FASTA-OK"
    assert calls["pk"] == 7
    assert calls["usecols"] == ("sequence_id", "sequence_alignment_aa")
    assert calls["max_file_size"] is None
    assert calls["seq_data"] == {
        "NB.SR1": "AA",
        "NB.SR2": "MK",
        "s3_A01": "CC",
    }


def test_get_db_fasta_raises_on_conflicting_duplicate_sequence_name(monkeypatch):
    df = pd.DataFrame(
        {
            "sequence_id": ["s1_A01", "s2_A01"],
            "sequence_alignment_aa": ["AAAA", "MADE"],
            "cdr3_aa": ["AAA", "MKD"],
            "nanobody_autoname": ["NB", "NB"],
            "sequencing_run": [1, 1],
        }
    )

    monkeypatch.setattr(blast, "read_seqrun_results", lambda *args, **kwargs: df)
    monkeypatch.setattr(blast, "as_fasta_files", lambda *args, **kwargs: ["unused"])

    with pytest.raises(ValueError, match="Different sequences with same name"):
        blast.get_db_fasta(include_run=1, query_type="full")


def test_run_blastp_seq_run_returns_none_for_empty_query(monkeypatch):
    monkeypatch.setattr(blast, "get_sequencing_run_fasta", lambda *args, **kwargs: "")

    assert blast.run_blastp_seq_run(1, query_type="cdr3") is None


def test_run_blastp_seq_run_uses_unaggregated_db_for_cdr3(monkeypatch):
    calls = {}

    monkeypatch.setattr(
        blast,
        "get_sequencing_run_fasta",
        lambda *args, **kwargs: "> query\nACDE",
    )

    def _fake_run_blastp(query_data, query_type, outfmt):
        calls["query_data"] = query_data
        calls["query_type"] = query_type
        calls["outfmt"] = outfmt
        return "BLAST-RESULTS"

    monkeypatch.setattr(blast, "run_blastp", _fake_run_blastp)

    result = blast.run_blastp_seq_run(99, query_type="cdr3", outfmt="15")

    assert result == "BLAST-RESULTS"
    assert calls == {
        "query_data": "> query\nACDE",
        "query_type": "cdr3_unagg",
        "outfmt": "15",
    }


def test_get_db_fasta_aggregates_unique_cdr3(monkeypatch):
    df = pd.DataFrame(
        {
            "sequence_id": ["x_A01", "y_A02"],
            "sequence_alignment_aa": ["AAAA", "BBBB"],
            "cdr3_aa": ["CARDR", "CARDR"],
            "nanobody_autoname": ["NB1", "NB2"],
            "sequencing_run": [1, 1],
        }
    )

    seen = {}

    monkeypatch.setattr(blast, "read_seqrun_results", lambda *args, **kwargs: df)

    def _fake_as_fasta_files(seq_data, max_file_size=None):
        seen["seq_data"] = seq_data
        return ["> CDR3: CARDR\nCARDR"]

    monkeypatch.setattr(blast, "as_fasta_files", _fake_as_fasta_files)

    result = blast.get_db_fasta(include_run=1, query_type="cdr3")

    assert result == "> CDR3: CARDR\nCARDR"
    assert seen["seq_data"] == {"CDR3: CARDR": "CARDR"}


def test_get_db_fasta_returns_empty_string_when_no_sequences(monkeypatch):
    empty_df = pd.DataFrame(
        {
            "sequence_id": [],
            "sequence_alignment_aa": [],
            "cdr3_aa": [],
            "nanobody_autoname": [],
            "sequencing_run": [],
        }
    )
    monkeypatch.setattr(blast, "read_seqrun_results", lambda *args, **kwargs: empty_df)
    monkeypatch.setattr(blast, "as_fasta_files", lambda *args, **kwargs: [])

    assert blast.get_db_fasta(include_run=1, query_type="full") == ""


def test_get_db_fasta_includes_all_runs_when_include_run_not_set(monkeypatch):
    df1 = pd.DataFrame(
        {
            "sequence_id": ["x_A01"],
            "sequence_alignment_aa": ["AAAA"],
            "cdr3_aa": ["AAA"],
            "nanobody_autoname": ["NB1"],
            "sequencing_run": [1],
        }
    )
    df2 = pd.DataFrame(
        {
            "sequence_id": ["y_A01"],
            "sequence_alignment_aa": ["MADE"],
            "cdr3_aa": ["MKD"],
            "nanobody_autoname": ["NB2"],
            "sequencing_run": [2],
        }
    )

    calls = []

    def _fake_read_seqrun_results(pk, usecols):
        calls.append((pk, usecols))
        return df1 if pk == 1 else df2

    monkeypatch.setattr(blast, "read_seqrun_results", _fake_read_seqrun_results)
    monkeypatch.setattr(
        blast,
        "SequencingRun",
        SimpleNamespace(
            objects=SimpleNamespace(values_list=lambda *args, **kwargs: [1, 2])
        ),
    )
    monkeypatch.setattr(blast, "as_fasta_files", lambda *args, **kwargs: ["combined"])

    assert blast.get_db_fasta(query_type="full") == "combined"
    assert calls == [
        (1, ("sequence_id", "sequence_alignment_aa")),
        (2, ("sequence_id", "sequence_alignment_aa")),
    ]
