from django.urls import include, path
from rest_framework.routers import DefaultRouter

from antigenapi.views.antigens import AntigenViewSet
from antigenapi.views.cohorts import CohortViewSet
from antigenapi.views.dashboard import AuditLogLatestEvents, DashboardStats
from antigenapi.views.elisa import ElisaPlateViewSet
from antigenapi.views.fasta import GlobalFastaView
from antigenapi.views.libraries import LibraryViewSet
from antigenapi.views.llamas import LlamaViewSet
from antigenapi.views.nanobodies import NanobodyViewSet
from antigenapi.views.projects import ProjectViewSet
from antigenapi.views.reports import ProjectReport
from antigenapi.views.sequencing import SequencingRunViewSet

router = DefaultRouter()
router.register("llama", LlamaViewSet)
router.register("cohort", CohortViewSet)
router.register("project", ProjectViewSet)
router.register("library", LibraryViewSet)
router.register("antigen", AntigenViewSet)
router.register("elisa_plate", ElisaPlateViewSet)
router.register("sequencingrun", SequencingRunViewSet)
router.register("nanobody", NanobodyViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("fasta/", GlobalFastaView.as_view(), name="fasta"),
    path("dashboard/stats", DashboardStats.as_view(), name="dashboard_stats"),
    path("dashboard/latest", AuditLogLatestEvents.as_view(), name="dashboard_latest"),
    path("reports/projects", ProjectReport.as_view(), name="project_report"),
]
