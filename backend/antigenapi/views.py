import collections
import urllib.error
import urllib.parse

from rest_framework.serializers import (
    CharField,
    FileField,
    ModelSerializer,
    PrimaryKeyRelatedField,
    StringRelatedField,
    ValidationError,
)
from rest_framework.viewsets import ModelViewSet

from antigenapi.models import (
    Antigen,
    Cohort,
    ElisaPlate,
    ElisaWell,
    Library,
    Llama,
    PlateLocations,
    Project,
)
from antigenapi.utils.uniprot import get_protein

from .parsers import parse_elisa_file


class ProjectSerializer(ModelSerializer):
    """A serializer for project data which serializes all internal fields."""

    added_by = StringRelatedField()

    class Meta:  # noqa: D106
        model = Project
        fields = "__all__"
        read_only_fields = ["added_by", "added_date"]


class ProjectViewSet(ModelViewSet):
    """A view set displaying all recorded projects."""

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def perform_create(self, serializer):
        """Overload the perform_create method."""
        serializer.save(added_by=self.request.user)
        super(ProjectViewSet, self).perform_create(serializer)


# Llamas #
class LlamaSerializer(ModelSerializer):
    """A serializer for llamas."""

    added_by = StringRelatedField()

    class Meta:  # noqa: D106
        model = Llama
        fields = "__all__"
        read_only_fields = ["added_by", "added_date"]


class LlamaViewSet(ModelViewSet):
    """A view set for llamas."""

    queryset = Llama.objects.all()
    serializer_class = LlamaSerializer

    def perform_create(self, serializer):  # noqa: D102
        serializer.save(added_by=self.request.user)
        super(LlamaViewSet, self).perform_create(serializer)


# Library #
class LibrarySerializer(ModelSerializer):
    """A serializer for libraries."""

    added_by = StringRelatedField()
    # llama_name = CharField(source='llama.name', read_only=True)
    cohort_cohort_num = CharField(source="cohort.cohort_num", read_only=True)
    project_short_title = CharField(source="project.short_title", read_only=True)

    class Meta:  # noqa: D106
        model = Library
        fields = "__all__"
        read_only_fields = ["added_by", "added_date"]


class LibraryViewSet(ModelViewSet):
    """A view set for libraries."""

    queryset = Library.objects.all().select_related("cohort").select_related("project")
    serializer_class = LibrarySerializer
    filterset_fields = ("project",)

    def perform_create(self, serializer):  # noqa: D102
        serializer.save(added_by=self.request.user)
        super(LibraryViewSet, self).perform_create(serializer)


# class UniProtAntigenSerialzer(ModelSerializer):
#     """A serializer for UniProt antigen data which serializes all internal fields."""

#     project = SlugRelatedField(slug_field="short_title",
#                                queryset=Project.objects.all())

#     class Meta:  # noqa: D106
#         model = UniProtAntigen
#         fields = [
#             "project",
#             "number",
#             "name",
#             "sequence",
#             "molecular_mass",
#             "uniprot_accession_number",
#             "creation_time",
#         ]


class AntigenSerializer(ModelSerializer):
    """A serializer for antigen data.

    A serializer for antigen data which serializes all internal fields, and includes the
    serialzed related local or UniProt antigen data and provides a set of elisa well
    which reference it.
    """

    added_by = StringRelatedField()
    preferred_name = CharField(
        required=False
    )  # Not required at creation, since we can use Uniprot ID instead

    class Meta:  # noqa: D106
        model = Antigen
        fields = "__all__"
        read_only_fields = ["added_by", "added_date"]

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
            data["sequence"] = protein_data["sequence"]["$"]
            data["molecular_mass"] = protein_data["sequence"]["@mass"]
            try:
                data["preferred_name"] = protein_data["protein"]["recommendedName"][
                    "fullName"
                ]
                if isinstance(data["preferred_name"], collections.Mapping):
                    data["preferred_name"] = data["preferred_name"]["$"]
            except KeyError:
                # TODO: Further error checking that name list is set
                data["preferred_name"] = protein_data["name"][0]
        return data


class AntigenViewSet(ModelViewSet):
    """A view set displaying all recorded antigens."""

    queryset = Antigen.objects.all()
    serializer_class = AntigenSerializer

    def perform_create(self, serializer):  # noqa: D102
        serializer.save(added_by=self.request.user)
        super(AntigenViewSet, self).perform_create(serializer)


# Cohort #
class CohortSerializer(ModelSerializer):
    """A serializer for cohorts."""

    added_by = StringRelatedField()
    llama_name = CharField(source="llama.name", read_only=True)
    antigen_details = AntigenSerializer(source="antigens", many=True, read_only=True)
    # project_short_title = CharField(source='project.short_title', read_only=True)

    class Meta:  # noqa: D106
        model = Cohort
        fields = "__all__"
        read_only_fields = ["added_by", "added_date"]


class CohortViewSet(ModelViewSet):
    """A view set for cohorts."""

    queryset = Cohort.objects.all().select_related("llama")
    serializer_class = CohortSerializer
    filterset_fields = ("llama", "cohort_num")

    def perform_create(self, serializer):  # noqa: D102
        serializer.save(added_by=self.request.user)
        super(CohortViewSet, self).perform_create(serializer)


# ELISA plates #
class NestedElisaWellSerializer(ModelSerializer):
    """A serializer for elisa wells."""

    class Meta:  # noqa: D106
        model = ElisaWell
        exclude = ("id", "plate")


class ElisaPlateSerializer(ModelSerializer):
    """A serializer for elisa plates.

    A serializer for elisa plates which serializes all internal fields and elisa wells
    contained within it.
    """

    library_cohort_cohort_num = CharField(
        source="library.cohort.cohort_num", required=False
    )
    added_by = StringRelatedField()
    elisawell_set = NestedElisaWellSerializer(many=True, required=False)
    antigen = PrimaryKeyRelatedField(
        queryset=Antigen.objects.all(), write_only=True
    )  # TODO: Filter by antigens in the library
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

    def validate(self, data):
        """Validate plate (load and parse file)."""
        try:
            data["elisawell_set"] = parse_elisa_file(data["plate_file"])
        except Exception as e:
            raise ValidationError({"plate_file": e})
        return data

    def create(self, validated_data):
        """Create plate. For now, every well shares the same antigen."""
        antigen = validated_data.pop("antigen")
        well_set = validated_data.pop("elisawell_set")
        validated_data["plate_file"].seek(0)
        plate = super(ElisaPlateSerializer, self).create(validated_data)
        ElisaWell.objects.bulk_create(
            ElisaWell(plate=plate, optical_density=od, location=loc, antigen=antigen)
            for (od, loc) in zip(well_set, PlateLocations)
        )
        return plate

    def update(self, instance, validated_data):
        """Update plate. For now, every well shares the same antigen."""
        antigen = validated_data["antigen"]
        well_set = validated_data.pop("elisawell_set")
        try:
            validated_data["plate_file"].seek(0)
        except ValueError:
            # File has already been read during create, so skip it
            validated_data.pop("plate_file")
        plate = super(ElisaPlateSerializer, self).update(instance, validated_data)
        for od, loc in zip(well_set, PlateLocations):
            ElisaWell.objects.update_or_create(
                plate=plate,
                location=loc,
                defaults={"optical_density": od, "antigen": antigen},
            )
        return instance


class ElisaPlateViewSet(ModelViewSet):
    """A view set displaying all recorded elisa plates."""

    queryset = ElisaPlate.objects.all().select_related("library__cohort")
    serializer_class = ElisaPlateSerializer
    filterset_fields = ("library",)

    def perform_create(self, serializer):  # noqa: D102
        serializer.save(added_by=self.request.user)
        super(ElisaPlateViewSet, self).perform_create(serializer)
