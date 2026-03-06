import json
from datetime import UTC, datetime
from types import SimpleNamespace

from auditlog.models import LogEntry

from antigenapi.models import ElisaPlate, SequencingRun, SequencingRunResults
from antigenapi.views.dashboard import (
    AuditLogLatestEvents,
    DashboardStats,
    _schema,
    _schemalink,
)


def test_schema_maps_special_models():
    assert (
        _schema(SimpleNamespace(model_class=lambda: ElisaPlate, name="ignored"))
        == "elisa"
    )
    assert (
        _schema(
            SimpleNamespace(model_class=lambda: SequencingRunResults, name="ignored")
        )
        == "sequencing"
    )
    assert (
        _schema(SimpleNamespace(model_class=lambda: SequencingRun, name="ignored"))
        == "sequencing"
    )
    assert (
        _schema(SimpleNamespace(model_class=lambda: object, name="custom")) == "custom"
    )


def test_schemalink_returns_related_seqrun_for_results(monkeypatch):
    fake_filter = SimpleNamespace(values_list=lambda *args, **kwargs: [123])
    fake_manager = SimpleNamespace(filter=lambda **kwargs: fake_filter)
    monkeypatch.setattr(
        "antigenapi.views.dashboard.SequencingRunResults.objects", fake_manager
    )

    log_entry = SimpleNamespace(
        content_type=SimpleNamespace(model_class=lambda: SequencingRunResults),
        object_id=77,
    )

    assert _schemalink(log_entry) == 123


def test_schemalink_returns_none_when_related_seqrun_missing(monkeypatch):
    fake_filter = SimpleNamespace(values_list=lambda *args, **kwargs: [])
    fake_manager = SimpleNamespace(filter=lambda **kwargs: fake_filter)
    monkeypatch.setattr(
        "antigenapi.views.dashboard.SequencingRunResults.objects", fake_manager
    )

    log_entry = SimpleNamespace(
        content_type=SimpleNamespace(model_class=lambda: SequencingRunResults),
        object_id=77,
    )

    assert _schemalink(log_entry) is None


def test_schemalink_returns_object_id_for_non_results():
    log_entry = SimpleNamespace(
        content_type=SimpleNamespace(model_class=lambda: object),
        object_id=55,
    )
    assert _schemalink(log_entry) == 55


def test_dashboard_stats_get_uses_model_counts(monkeypatch):
    monkeypatch.setattr(
        "antigenapi.views.dashboard.Project.objects",
        SimpleNamespace(count=lambda: 1),
    )
    monkeypatch.setattr(
        "antigenapi.views.dashboard.Antigen.objects",
        SimpleNamespace(count=lambda: 2),
    )
    monkeypatch.setattr(
        "antigenapi.views.dashboard.Llama.objects",
        SimpleNamespace(count=lambda: 3),
    )
    monkeypatch.setattr(
        "antigenapi.views.dashboard.SequencingRun.objects",
        SimpleNamespace(count=lambda: 4),
    )
    monkeypatch.setattr(
        "antigenapi.views.dashboard.Nanobody.objects",
        SimpleNamespace(count=lambda: 5),
    )

    response = DashboardStats().get(request=None)
    payload = json.loads(response.content)

    assert payload["stats"] == [
        {"name": "Projects", "value": 1},
        {"name": "Antigens", "value": 2},
        {"name": "Llamas", "value": 3},
        {"name": "Sequencing Runs", "value": 4},
        {"name": "Named Nanobodies", "value": 5},
    ]


def test_audit_log_latest_events_formats_actor_and_suppresses_link_for_delete(
    monkeypatch,
):
    class _FakeLogManager:
        def __init__(self, logs):
            self.logs = logs

        def all(self):
            return self

        def select_related(self, *args):
            return self

        def __getitem__(self, item):
            return self.logs[item]

    created = SimpleNamespace(
        pk=1,
        actor=SimpleNamespace(username="alice", email="alice@example.com"),
        object_repr="SequencingRun 5",
        content_type=SimpleNamespace(
            name="sequencing run", model_class=lambda: SequencingRun
        ),
        object_id=5,
        action=LogEntry.Action.CREATE,
        timestamp=datetime(2026, 3, 1, tzinfo=UTC),
    )
    deleted = SimpleNamespace(
        pk=2,
        actor=None,
        object_repr="Deleted object",
        content_type=SimpleNamespace(
            name="elisa plate", model_class=lambda: ElisaPlate
        ),
        object_id=10,
        action=LogEntry.Action.DELETE,
        timestamp=datetime(2026, 3, 1, tzinfo=UTC),
    )

    monkeypatch.setattr(
        "antigenapi.views.dashboard.LogEntry.objects",
        _FakeLogManager([created, deleted]),
    )
    monkeypatch.setattr("antigenapi.views.dashboard.time_ago", lambda *_: "recent")

    response = AuditLogLatestEvents().get(request=None)
    payload = json.loads(response.content)

    assert len(payload["logs"]) == 2
    assert payload["logs"][0]["object"]["link"] == {"schema": "sequencing", "id": 5}
    assert payload["logs"][0]["user"] == {
        "username": "alice",
        "email": "alice@example.com",
    }
    assert payload["logs"][0]["date"] == "recent"

    assert payload["logs"][1]["user"] == {"username": "<None>", "email": "<None>"}
    assert payload["logs"][1]["object"]["link"] == {"schema": None, "id": None}
