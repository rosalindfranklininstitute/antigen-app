from django.urls import include, path
from rest_framework.routers import DefaultRouter

from antigenapi.views.dashboard import AuditLogLatestEvents, DashboardStats
from antigenapi.views_old import (
    AntigenViewSet,
    CohortViewSet,
    ElisaPlateViewSet,
    GlobalFastaView,
    LibraryViewSet,
    LlamaViewSet,
    NanobodyViewSet,
    ProjectViewSet,
    SequencingRunViewSet,
)

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
]
