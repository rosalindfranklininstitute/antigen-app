import csv
import io
from types import SimpleNamespace

import pandas as pd

from antigenapi.views.reports import ProjectReport, _extract_well_or_none


def test_extract_well_or_none_returns_none_for_invalid_well():
    assert _extract_well_or_none("bad-well") is None


def test_extract_well_or_none_returns_canonical_well():
    assert _extract_well_or_none("a01") == "A1"


def test_project_report_get_returns_header_when_no_projects(monkeypatch):
    seqrun_manager = SimpleNamespace(
        all=lambda: SimpleNamespace(prefetch_related=lambda *args: [])
    )
    project_manager = SimpleNamespace(
        order_by=lambda *args: SimpleNamespace(prefetch_related=lambda *args: [])
    )
    monkeypatch.setattr(
        "antigenapi.views.reports.SequencingRun.objects", seqrun_manager
    )
    monkeypatch.setattr("antigenapi.views.reports.Project.objects", project_manager)

    response = ProjectReport().get(request=None)
    reader = csv.reader(io.StringIO(response.content.decode("utf-8")))
    rows = list(reader)

    assert response.status_code == 200
    assert rows[0] == [
        "Project",
        "# Libraries",
        "Llama(s)",
        "Cohort antigen(s)",
        "# ELISAs",
        "ELISA IDs",
        "# Wells sent for sequencing",
        "# Sequencing runs",
        "Sequencing run IDs",
        "# Productive hits",
        "# Of which unique sequences",
    ]
    assert len(rows) == 1


def test_project_report_get_computes_counts_for_project(monkeypatch):
    antigen = SimpleNamespace(short_name="Ag1")
    cohort = SimpleNamespace(
        llama=SimpleNamespace(name="Llama-1"),
        antigens=SimpleNamespace(all=lambda: [antigen]),
    )
    plate = SimpleNamespace(id=101)
    library = SimpleNamespace(
        cohort=cohort,
        elisaplate_set=SimpleNamespace(all=lambda: [plate]),
    )
    project = SimpleNamespace(
        short_title="Project-1",
        library_set=SimpleNamespace(all=lambda: [library], count=lambda: 1),
    )

    seq_result = SimpleNamespace(seq=1, airr_file="unused")

    class _SeqRun:
        def __init__(self):
            self.id = 9
            self.plate_thresholds = [
                {"elisa_plate": 101, "optical_density_threshold": 0.5}
            ]
            self.wells = [
                {"elisa_well": {"plate": 101, "location": 1}, "plate": 1, "location": 1}
            ]
            self.sequencingrunresults_set = SimpleNamespace(
                order_by=lambda *args: [seq_result]
            )

    seq_run = _SeqRun()

    seqrun_manager = SimpleNamespace(
        all=lambda: SimpleNamespace(prefetch_related=lambda *args: [seq_run])
    )
    project_manager = SimpleNamespace(
        order_by=lambda *args: SimpleNamespace(prefetch_related=lambda *args: [project])
    )
    monkeypatch.setattr(
        "antigenapi.views.reports.SequencingRun.objects", seqrun_manager
    )
    monkeypatch.setattr("antigenapi.views.reports.Project.objects", project_manager)

    airr_df = pd.DataFrame(
        {
            "sequence_id": ["seq_A01", "seq_B01", "seq_Z99"],
            "productive": ["T", "F", "T"],
            "sequence_alignment_aa": ["SEQ_A", "SEQ_B", "SEQ_C"],
        }
    )
    monkeypatch.setattr("antigenapi.views.reports.read_airr_file", lambda *_: airr_df)

    response = ProjectReport().get(request=None)
    reader = csv.reader(io.StringIO(response.content.decode("utf-8")))
    rows = list(reader)

    assert len(rows) == 2
    assert rows[1][0] == "Project-1"  # Project
    assert rows[1][1] == "1"  # # Libraries
    assert rows[1][4] == "1"  # # ELISAs
    assert rows[1][6] == "1"  # # Wells sent for sequencing
    assert rows[1][7] == "1"  # # Sequencing runs
    assert rows[1][8] == "9"  # Sequencing run IDs
    assert rows[1][9] == "1"  # # Productive hits
    assert rows[1][10] == "1"  # # Of which unique sequences
