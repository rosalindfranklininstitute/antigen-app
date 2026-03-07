from rest_framework.serializers import ModelSerializer, StringRelatedField
from rest_framework.viewsets import ModelViewSet

from antigenapi.models import Llama
from antigenapi.views.mixins import AuditLogMixin, DeleteProtectionMixin


class LlamaSerializer(ModelSerializer):
    """A serializer for llamas."""

    added_by = StringRelatedField()

    class Meta:  # noqa: D106
        model = Llama
        fields = "__all__"
        read_only_fields = ["added_by", "added_date"]


class LlamaViewSet(AuditLogMixin, DeleteProtectionMixin, ModelViewSet):
    """A view set for llamas."""

    queryset = Llama.objects.all().select_related("added_by").order_by("name")
    serializer_class = LlamaSerializer

    def perform_create(self, serializer):  # noqa: D102
        serializer.save(added_by=self.request.user)
