import urllib.error

from django.db.models import Q
from django.db.utils import NotSupportedError
from rest_framework.serializers import (
    ModelSerializer,
    SerializerMethodField,
    StringRelatedField,
    ValidationError,
)
from rest_framework.viewsets import ModelViewSet

from antigenapi.models import Antigen, ElisaPlate, SequencingRun
from antigenapi.utils.uniprot import get_protein
from antigenapi.views.elisa import ElisaPlateWithoutWellsSerializer
from antigenapi.views.mixins import AuditLogMixin, DeleteProtectionMixin
from antigenapi.views.sequencing import (
    SequencingRunSerializer,
    SequencingRunShortSerializer,
)


class AntigenSerializer(ModelSerializer):
    """A serializer for antigen data.

    Serializes all internal fields and includes related ELISA plate and
    sequencing run data on single-object requests.
    """

    added_by = StringRelatedField()
    elisa_plates = SerializerMethodField()
    sequencing_runs = SerializerMethodField()

    class Meta:  # noqa: D106
        model = Antigen
        fields = "__all__"
        read_only_fields = ["added_by", "added_date"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        request = self.context.get("request")
        if request and not request.parser_context.get("kwargs", {}).get("pk"):
            # If it's a list view, remove these fields
            self.fields.pop("elisa_plates", None)
            self.fields.pop("sequencing_runs", None)

    def get_elisa_plates(self, obj):
        """Get ELISA plates using this antigen in single-object requests."""
        request = self.context.get("request")
        if request and request.parser_context.get("kwargs", {}).get("pk"):
            return ElisaPlateWithoutWellsSerializer(
                ElisaPlate.objects.filter(elisawell__antigen=obj.pk).distinct(),
                many=True,
            ).data
        return None  # Omit in list views

    def get_sequencing_runs(self, obj):
        """Get sequencing runs using this antigen in single-object requests."""
        request = self.context.get("request")
        if request and request.parser_context.get("kwargs", {}).get("pk"):
            elisa_plate_ids = (
                ElisaPlate.objects.filter(elisawell__antigen=obj.pk)
                .values_list("id", flat=True)
                .distinct()
            )

            # Handle case where no ELISAs available
            if not elisa_plate_ids:
                return SequencingRunSerializer(many=True).data

            # Try PostgreSQL JSONField filtering
            # Build a Q object to check if any given elisa_plate is inside the JSONField
            query = Q()
            for plate_id in elisa_plate_ids:
                query |= Q(plate_thresholds__contains=[{"elisa_plate": plate_id}])

            sequencing_runs = SequencingRun.objects.filter(query)

            try:
                return SequencingRunShortSerializer(sequencing_runs, many=True).data
            except NotSupportedError:
                # Fallback for SQLite: Manual filtering in Python
                sequencing_runs = [
                    run
                    for run in SequencingRun.objects.all()
                    if any(
                        entry.get("elisa_plate") in elisa_plate_ids
                        for entry in run.plate_thresholds
                    )
                ]
                return SequencingRunShortSerializer(sequencing_runs, many=True).data
        return None

    def validate(self, data):
        """Check the antigen is a valid uniprot ID."""
        if data.get("uniprot_id"):
            try:
                protein_data = get_protein(data["uniprot_id"])
            except urllib.error.HTTPError as e:
                if e.code == 400:
                    raise ValidationError(
                        {"uniprot_id": "Couldn't validate this UniProt ID (code 400)"}
                    )
                elif e.code == 500:
                    raise ValidationError(
                        {"uniprot_id": "Couldn't validate this UniProt ID (code 500)"}
                    )
                else:
                    raise
            if not data.get("sequence") or data.get("sequence").strip() == "":
                data["sequence"] = protein_data["sequence"]
            if data.get("molecular_mass") is None:
                data["molecular_mass"] = protein_data["molecular_mass"]
            if not data.get("long_name") or data.get("long_name").strip() == "":
                data["long_name"] = protein_data["protein_name"]

        return data


class AntigenViewSet(AuditLogMixin, DeleteProtectionMixin, ModelViewSet):
    """A view set displaying all recorded antigens."""

    queryset = Antigen.objects.all().select_related("added_by").order_by("short_name")
    serializer_class = AntigenSerializer

    def perform_create(self, serializer):  # noqa: D102
        serializer.save(added_by=self.request.user)
