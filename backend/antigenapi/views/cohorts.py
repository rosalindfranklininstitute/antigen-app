from rest_framework.serializers import CharField, ModelSerializer, StringRelatedField
from rest_framework.viewsets import ModelViewSet

from antigenapi.models import Cohort
from antigenapi.views.antigens import AntigenSerializer
from antigenapi.views.mixins import AuditLogMixin, DeleteProtectionMixin


class CohortSerializer(ModelSerializer):
    """A serializer for cohorts."""

    added_by = StringRelatedField()
    llama_name = CharField(source="llama.name", read_only=True)
    antigen_details = AntigenSerializer(source="antigens", many=True, read_only=True)
    cohort_num_prefixed = CharField(read_only=True)

    class Meta:  # noqa: D106
        model = Cohort
        fields = "__all__"
        read_only_fields = ["added_by", "added_date"]


class CohortViewSet(AuditLogMixin, DeleteProtectionMixin, ModelViewSet):
    """A view set for cohorts."""

    queryset = (
        Cohort.objects.all().select_related("llama").order_by("is_naive", "cohort_num")
    )
    serializer_class = CohortSerializer
    filterset_fields = ("llama", "cohort_num")

    def perform_create(self, serializer):  # noqa: D102
        serializer.save(added_by=self.request.user)
