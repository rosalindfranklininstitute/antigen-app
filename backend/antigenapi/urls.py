from django.urls import include, path
from rest_framework.routers import DefaultRouter

from antigenapi.views import (
    LlamaViewSet,
    LibraryViewSet,
    AntigenViewSet,
    ElisaPlateViewSet,
    ProjectViewSet,
)

router = DefaultRouter()
router.register("llama", LlamaViewSet)
router.register("project", ProjectViewSet)
router.register("library", LibraryViewSet)
router.register("antigen", AntigenViewSet)
router.register("elisa_plate", ElisaPlateViewSet)


urlpatterns = [
    path("", include(router.urls)),
]
