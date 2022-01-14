from django.urls import include, path
from rest_framework.routers import DefaultRouter

from antigenapi.views import (
    AntigenViewSet,
    ElisaPlateViewSet,
    ElisaWellViewSet,
    NanobodyViewSet,
    SequenceViewSet,
)

router = DefaultRouter()
router.register("antigen", AntigenViewSet)
router.register("nanobody", NanobodyViewSet)
router.register("elisa_plate", ElisaPlateViewSet)
router.register("elisa_well", ElisaWellViewSet)
router.register("sequence", SequenceViewSet)

urlpatterns: list[str] = [path("", include(router.urls))]
