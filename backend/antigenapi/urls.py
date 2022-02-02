from allauth.socialaccount.providers.openid.views import OpenIDLoginView
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from antigenapi.views import (
    AntigenViewSet,
    ElisaPlateViewSet,
    ElisaWellViewSet,
    GitHubLoginView,
    LocalAntigenViewSet,
    NanobodyViewSet,
    SequenceViewSet,
    UniProtAntigenViewSet,
)

router = DefaultRouter()
router.register("antigen", AntigenViewSet)
router.register("local_antigen", LocalAntigenViewSet)
router.register("uniprot_antigen", UniProtAntigenViewSet)
router.register("nanobody", NanobodyViewSet)
router.register("elisa_plate", ElisaPlateViewSet)
router.register("elisa_well", ElisaWellViewSet)
router.register("sequence", SequenceViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("auth/github/", GitHubLoginView.as_view(), name="github_login"),
]
