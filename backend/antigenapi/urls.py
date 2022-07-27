from django.urls import include, path
from rest_framework.routers import DefaultRouter

from antigenapi.views import (
    AntigenViewSet,
    ElisaPlateViewSet,
    ElisaWellViewSet,
    LocalAntigenViewSet,
    NanobodyViewSet,
    ProjectViewSet,
    SequenceViewSet,
    UniProtAntigenViewSet,
    FileUploadView,
)

router = DefaultRouter()
router.register("project", ProjectViewSet)
router.register("antigen", AntigenViewSet)
router.register("local_antigen", LocalAntigenViewSet)
router.register("uniprot_antigen", UniProtAntigenViewSet)
router.register("nanobody", NanobodyViewSet)
router.register("elisa_plate", ElisaPlateViewSet)
router.register("elisa_well", ElisaWellViewSet)
router.register("sequence", SequenceViewSet)


urlpatterns = [
    path("", include(router.urls)),
    path(r"upload_csv/", FileUploadView.as_view(), name="upload_csv"),
]
