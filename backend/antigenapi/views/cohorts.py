from django.http import Http404
from rest_framework.serializers import CharField, ModelSerializer, StringRelatedField
from rest_framework.viewsets import ModelViewSet

from antigenapi.models import Cohort, Llama
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
    filterset_fields = ("cohort_num",)

    def get_queryset(self):  # noqa: D102
        qs = super().get_queryset()
        llama_id = self.request.query_params.get("llama")
        if llama_id is not None:
            if not Llama.objects.filter(pk=llama_id).exists():
                raise Http404
            qs = qs.filter(llama_id=llama_id)
        return qs

    def perform_create(self, serializer):  # noqa: D102
        serializer.save(added_by=self.request.user)
