from rest_framework.serializers import ModelSerializer, StringRelatedField
from rest_framework.viewsets import ModelViewSet

from antigenapi.models import Nanobody
from antigenapi.views.mixins import AuditLogMixin, DeleteProtectionMixin


class NanobodySerializer(ModelSerializer):
    """A serializer for nanobodies."""

    added_by = StringRelatedField()

    class Meta:  # noqa: D106
        model = Nanobody
        fields = "__all__"
        read_only_fields = ["seqruns", "added_by", "added_date"]


class NanobodyViewSet(AuditLogMixin, DeleteProtectionMixin, ModelViewSet):
    """A view set for nanobodies."""

    queryset = Nanobody.objects.all().select_related("added_by").order_by("name")
    serializer_class = NanobodySerializer

    def perform_create(self, serializer):  # noqa: D102
        serializer.save(added_by=self.request.user)
