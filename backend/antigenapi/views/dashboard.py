from auditlog.models import LogEntry
from django.http import JsonResponse
from rest_framework.views import APIView

from antigenapi.models import (
    Antigen,
    ElisaPlate,
    Llama,
    Nanobody,
    Project,
    SequencingRun,
    SequencingRunResults,
)
from antigenapi.utils.dates import time_ago


class DashboardStats(APIView):
    def get(self, request, format=None):
        """Get database stats for dashboard."""
        stats = [
            {"name": "Projects", "value": Project.objects.count()},
            {"name": "Antigens", "value": Antigen.objects.count()},
            {"name": "Llamas", "value": Llama.objects.count()},
            {"name": "Sequencing Runs", "value": SequencingRun.objects.count()},
            {"name": "Named Nanobodies", "value": Nanobody.objects.count()},
        ]

        return JsonResponse({"stats": stats})


def _schema(content_type):
    model_class = content_type.model_class()
    if model_class == ElisaPlate:
        return "elisa"
    if model_class == SequencingRunResults:
        return "sequencing"
    if model_class == SequencingRun:
        return "sequencing"

    return content_type.name


def _schemalink(log_entry):
    if log_entry.content_type.model_class() == SequencingRunResults:
        try:
            return SequencingRunResults.objects.filter(
                id=log_entry.object_id
            ).values_list("sequencing_run_id", flat=True)[0]
        except IndexError:
            return None

    return log_entry.object_id


class AuditLogLatestEvents(APIView):
    def get(self, request, format=None):
        """Get audit log events for dashboard."""
        logs = [
            {
                "pk": le.pk,
                "user": {
                    "username": le.actor.username if le.actor else "<None>",
                    "email": le.actor.email if le.actor else "<None>",
                },
                "object": {
                    "name": le.object_repr,
                    "type": le.content_type.name,
                    "pk": le.object_id,
                    "link": {
                        "schema": (
                            _schema(le.content_type)
                            if le.action != LogEntry.Action.DELETE
                            else None
                        ),
                        "id": (
                            _schemalink(le)
                            if le.action != LogEntry.Action.DELETE
                            else None
                        ),
                    },
                    "operation": LogEntry.Action.choices[le.action][1],
                },
                "dateTime": le.timestamp,
                "date": time_ago(le.timestamp),
            }
            for le in LogEntry.objects.all().select_related("actor", "content_type")[
                0:10
            ]
        ]

        return JsonResponse({"logs": logs})
