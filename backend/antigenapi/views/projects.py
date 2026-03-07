from rest_framework.serializers import ModelSerializer, StringRelatedField
from rest_framework.viewsets import ModelViewSet

from antigenapi.models import Project
from antigenapi.views.mixins import AuditLogMixin, DeleteProtectionMixin


class ProjectSerializer(ModelSerializer):
    """A serializer for project data which serializes all internal fields."""

    added_by = StringRelatedField()

    class Meta:  # noqa: D106
        model = Project
        fields = "__all__"
        read_only_fields = ["added_by", "added_date"]


class ProjectViewSet(AuditLogMixin, DeleteProtectionMixin, ModelViewSet):
    """A view set displaying all recorded projects."""

    queryset = Project.objects.all().select_related("added_by").order_by("short_title")
    serializer_class = ProjectSerializer

    def perform_create(self, serializer):
        """Overload the perform_create method."""
        serializer.save(added_by=self.request.user)
