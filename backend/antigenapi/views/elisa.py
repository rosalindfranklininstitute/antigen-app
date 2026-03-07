import math

from django.db import transaction
from django.http import HttpResponse
from rest_framework.decorators import action
from rest_framework.serializers import (
    BooleanField,
    CharField,
    FileField,
    ModelSerializer,
    PrimaryKeyRelatedField,
    SerializerMethodField,
    StringRelatedField,
    ValidationError,
)
from rest_framework.viewsets import ModelViewSet

from antigenapi.models import Antigen, ElisaPlate, ElisaWell, PlateLocations
from antigenapi.parsers import parse_elisa_file
from antigenapi.views.mixins import AuditLogMixin, DeleteProtectionMixin


def _wells_to_tsv(wells):
    UPPER_CASE_A = 65
    ROW_LENGTH = 12
    NUM_ROWS = 8

    output = "\t".join([""] + [str(i) for i in range(1, ROW_LENGTH + 1)]) + "\n"
    for row in range(NUM_ROWS):
        start = row * ROW_LENGTH
        row = [chr(UPPER_CASE_A + row)]
        row += [
            str(w) if w is not None else "" for w in wells[start : (start + ROW_LENGTH)]
        ]
        output += "\t".join(row) + "\n"

    return output


class NestedElisaWellSerializer(ModelSerializer):
    """A serializer for elisa wells."""

    optical_density = SerializerMethodField()

    class Meta:  # noqa: D106
        model = ElisaWell
        exclude = ("id", "plate")

    def get_optical_density(self, obj):
        """Get optical density - convert NaN to None for JSON encoding."""
        if obj.optical_density is not None and not math.isnan(obj.optical_density):
            return obj.optical_density
        return None


class ElisaWellInlineSerializer(ModelSerializer):
    """A serializer to represent elisa wells by plate id and location."""

    class Meta:  # noqa: D106
        model = ElisaWell
        fields = ("plate", "location")


class ElisaPlateWithoutWellsSerializer(ModelSerializer):
    """A serializer for elisa plates without well data included."""

    project_short_title = CharField(
        source="library.project.short_title", read_only=True
    )
    library_cohort_cohort_num = CharField(
        source="library.cohort.cohort_num", required=False
    )
    library_cohort_cohort_num_prefixed = CharField(
        source="library.cohort.cohort_num_prefixed", required=False
    )
    library_cohort_is_naive = BooleanField(
        source="library.cohort.is_naive", read_only=True
    )
    library_library_num = CharField(source="library.library_num", read_only=True)
    added_by = StringRelatedField()
    antigen = PrimaryKeyRelatedField(queryset=Antigen.objects.all(), write_only=True)
    read_only_fields = [
        "library_cohort_cohort_num",
        "elisawell_set",
        "added_by",
        "added_date",
    ]
    plate_file = FileField(use_url=False)

    class Meta:  # noqa: D106
        model = ElisaPlate
        fields = "__all__"


class ElisaPlateSerializer(ElisaPlateWithoutWellsSerializer):
    """A serializer for elisa plates including well data."""

    elisawell_set = NestedElisaWellSerializer(many=True, required=False)

    def validate(self, data):
        """Validate plate (load and parse file)."""
        if "plate_file" in data:
            try:
                data["elisawell_set"] = parse_elisa_file(data["plate_file"])
            except Exception as e:
                raise ValidationError({"plate_file": e})
        return data

    @staticmethod
    def _create_wells(plate, antigen, well_set):
        ElisaWell.objects.bulk_create(
            ElisaWell(plate=plate, optical_density=od, location=loc, antigen=antigen)
            for (od, loc) in zip(well_set, PlateLocations)
        )

    @transaction.atomic
    def create(self, validated_data):
        """Create plate. For now, every well shares the same antigen."""
        antigen = validated_data.pop("antigen")
        well_set = validated_data.pop("elisawell_set")
        validated_data["plate_file"].seek(0)
        plate = super(ElisaPlateSerializer, self).create(validated_data)
        self._create_wells(plate, antigen, well_set)
        return plate

    @transaction.atomic
    def update(self, instance, validated_data):
        """Update plate. For now, every well shares the same antigen."""
        antigen = validated_data["antigen"]
        if "elisawell_set" in validated_data:
            well_set = validated_data.pop("elisawell_set")
        else:
            well_set = None
        if "plate_file" in validated_data:
            try:
                validated_data["plate_file"].seek(0)
            except ValueError:
                # File has already been read during create, so skip it
                validated_data.pop("plate_file")
                well_set = None
        plate = super(ElisaPlateSerializer, self).update(instance, validated_data)
        if well_set is not None:
            # Faster, fewer DB queries to bulk delete & re-insert
            # than conditionally update
            ElisaWell.objects.filter(plate=plate).delete()
            self._create_wells(plate, antigen, well_set)
        else:
            ElisaWell.objects.filter(plate=plate).update(antigen=antigen)
        return instance


class ElisaPlateViewSet(AuditLogMixin, DeleteProtectionMixin, ModelViewSet):
    """A view set displaying all recorded elisa plates."""

    queryset = (
        ElisaPlate.objects.all()
        .select_related("library__cohort")
        .select_related("library__project")
        .select_related("added_by")
        .prefetch_related("elisawell_set")
        .order_by("-added_date")
    )
    serializer_class = ElisaPlateSerializer
    filterset_fields = ("library", "library__cohort")

    def perform_create(self, serializer):  # noqa: D102
        serializer.save(added_by=self.request.user)

    @action(
        detail=True,
        methods=["GET"],
        name="Download ELISA plate as TSV.",
        url_path="tsv",
    )
    def download_elisa_tsv(self, request, pk):
        """Download ELISA plate as .tsv file."""
        wells = list(
            ElisaWell.objects.filter(
                plate_id=pk,
            )
            .order_by("location")
            .values_list("optical_density", flat=True)
        )

        output = _wells_to_tsv(wells)

        response = HttpResponse(output, content_type="text/tab-separated-values")

        response["Content-Disposition"] = f'attachment; filename="elisa_plate_{pk}.tsv"'

        return response
