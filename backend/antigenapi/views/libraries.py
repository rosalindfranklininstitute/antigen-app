from django.db.utils import IntegrityError
from rest_framework.serializers import (
    BooleanField,
    CharField,
    ModelSerializer,
    SerializerMethodField,
    StringRelatedField,
    ValidationError,
)
from rest_framework.viewsets import ModelViewSet

from antigenapi.models import Library
from antigenapi.views.mixins import AuditLogMixin, DeleteProtectionMixin


class LibrarySerializer(ModelSerializer):
    """A serializer for libraries."""

    added_by = StringRelatedField()
    cohort_cohort_num = SerializerMethodField(read_only=True)
    cohort_is_naive = BooleanField(source="cohort.is_naive", read_only=True)
    cohort_cohort_num_prefixed = SerializerMethodField(read_only=True)
    project_short_title = CharField(source="project.short_title", read_only=True)
    library_num = CharField(read_only=True)

    class Meta:  # noqa: D106
        model = Library
        fields = "__all__"
        read_only_fields = ["added_by", "added_date"]

    def get_cohort_cohort_num(self, obj):
        """Get the cohort number with sublibrary, if present."""
        return f"{obj.cohort.cohort_num}{obj.sublibrary or ''}"

    def get_cohort_cohort_num_prefixed(self, obj):
        """Get the cohort number with sublibrary and N (naive) prefix."""
        return f"{obj.cohort.cohort_num_prefixed()}{obj.sublibrary or ''}"


class LibraryViewSet(AuditLogMixin, DeleteProtectionMixin, ModelViewSet):
    """A view set for libraries."""

    queryset = (
        Library.objects.all()
        .select_related("cohort")
        .select_related("project")
        .select_related("added_by")
        .order_by("cohort__is_naive", "cohort__cohort_num")
    )
    serializer_class = LibrarySerializer
    filterset_fields = ("project",)

    def perform_create(self, serializer):  # noqa: D102
        try:
            serializer.save(added_by=self.request.user)
        except IntegrityError as e:
            raise ValidationError({"non_field_errors": [str(e)]})
