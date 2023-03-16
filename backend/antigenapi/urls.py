from django.urls import include, path
from rest_framework.routers import DefaultRouter

from antigenapi.views import (
    AntigenViewSet,
    CohortViewSet,
    ElisaPlateViewSet,
    LibraryViewSet,
    LlamaViewSet,
    ProjectViewSet,
)

router = DefaultRouter()
router.register("llama", LlamaViewSet)
router.register("cohort", CohortViewSet)
router.register("project", ProjectViewSet)
router.register("library", LibraryViewSet)
router.register("antigen", AntigenViewSet)
router.register("elisa_plate", ElisaPlateViewSet)


urlpatterns = [
    path("", include(router.urls)),
]
