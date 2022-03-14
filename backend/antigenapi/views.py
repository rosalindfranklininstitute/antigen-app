from typing import Generic, Optional, OrderedDict, TypeVar

from rest_framework.serializers import (
    CharField,
    IntegerField,
    ModelSerializer,
    PrimaryKeyRelatedField,
    ReadOnlyField,
    RelatedField,
    SerializerMethodField,
    SlugRelatedField,
)
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from antigenapi.models import (
    Antigen,
    ElisaPlate,
    ElisaWell,
    LocalAntigen,
    Nanobody,
    Project,
    ProjectModelMixin,
    QuerySet,
    Sequence,
    UniProtAntigen,
)
from antigenapi.utils.permission import perform_create_allow_creator_change_delete

PM = TypeVar("PM", bound=ProjectModelMixin)


class ProjectModelRelatedField(Generic[PM], RelatedField):
    """A related field which serializes the project and number of project models."""

    def __init__(self, queryset: QuerySet[PM]) -> None:  # noqa: D107
        self.queryset = queryset
        super().__init__()

    def to_representation(self, value: PM):
        """Override which serializes as a dict of project model keys.

        Override which serializes as dict containing project and number of the
        project model.
        """
        return {"project": value.project.short_title, "number": value.number}

    def get_choices(self, cutoff=None):
        """Override to fix serialization bug.

        Override which skips the to_representation call when constructing the choices
        dict. See: https://github.com/encode/django-rest-framework/issues/5141
        """
        queryset = self.get_queryset()
        if queryset is None:
            return {}

        if cutoff is not None:
            queryset = queryset[:cutoff]

        return OrderedDict([(item.pk, self.display_value(item)) for item in queryset])


class ElisaWellRelatedField(RelatedField):
    """A related field which serializes the key of elisa wells.

    A related field which serializes the project, plate and location of elisa wells.
    """

    def to_representation(self, value: ElisaWell):
        """Override which serializes as a dict of elisa well keys.

        Override which serializes as a dict containing the project, plate and locaiton
        of the elisa well.
        """
        return {
            "project": value.plate.project.short_title,
            "plate": value.plate.number,
            "location": value.location,
        }

    def get_choices(self, cutoff=None):
        """Override to fix serialization bug.

        Override which skips the to_representation call when constructing the choices
        dict. See: https://github.com/encode/django-rest-framework/issues/5141
        """
        queryset = self.get_queryset()
        if queryset is None:
            return {}

        if cutoff is not None:
            queryset = queryset[:cutoff]

        return OrderedDict([(item.pk, self.display_value(item)) for item in queryset])


class ProjectSerializer(ModelSerializer):
    """A serializer for project data which serializes all internal fields."""

    class Meta:  # noqa: D106
        model = Project
        fields = ["short_title", "title", "description"]


class ProjectViewSet(ModelViewSet):
    """A view set displaying all recorded projects."""

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    perform_create = perform_create_allow_creator_change_delete


class LocalAntigenSerializer(ModelSerializer):
    """A serializer for local antigen data.

    A serializer for local antigen data which serializes all interal fields, and the
    computed field; name.
    """

    project = SlugRelatedField(slug_field="short_title", queryset=Project.objects.all())
    name = ReadOnlyField()

    class Meta:  # noqa: D106
        model = LocalAntigen
        fields = [
            "project",
            "number",
            "name",
            "sequence",
            "molecular_mass",
            "creation_time",
        ]


class LocalAntigenViewSet(ModelViewSet):
    """A view set displaying all recorded local antigens."""

    queryset = LocalAntigen.objects.all()
    serializer_class = LocalAntigenSerializer

    perform_create = perform_create_allow_creator_change_delete


class UniProtAntigenSerialzer(ModelSerializer):
    """A serializer for UniProt antigen data which serializes all internal fields."""

    project = SlugRelatedField(slug_field="short_title", queryset=Project.objects.all())

    class Meta:  # noqa: D106
        model = UniProtAntigen
        fields = [
            "project",
            "number",
            "name",
            "sequence",
            "molecular_mass",
            "uniprot_accession_number",
            "creation_time",
        ]


class UniProtAntigenViewSet(ModelViewSet):
    """A view set displaying all recorded UniProt antigens."""

    queryset = UniProtAntigen.objects.all()
    serializer_class = UniProtAntigenSerialzer

    perform_create = perform_create_allow_creator_change_delete


class AntigenSerializer(ModelSerializer):
    """A serializer for antigen data.

    A serializer for antigen data which serializes all internal fields, and includes the
    serialzed related local or UniProt antigen data and provides a set of elisa well
    which reference it.
    """

    project = SlugRelatedField(slug_field="short_title", queryset=Project.objects.all())
    name = CharField(source="child.name")
    sequence = CharField(source="child.sequence")
    molecular_mass = IntegerField(source="child.molecular_mass")
    uniprot_accession_number = SerializerMethodField()
    elisawell_set = ElisaWellRelatedField(many=True, read_only=True)

    def get_uniprot_accession_number(self, antigen: Antigen) -> Optional[str]:
        """Retrieve the uniprot accession number if the child antigen is from uniprot.

        Args:
            antigen (Antigen): The parent object instance.

        Returns:
            Optional[str]: The uniprot accession number if available.
        """
        return (
            antigen.child.uniprot_accession_number
            if isinstance(antigen.child, UniProtAntigen)
            else None
        )

    class Meta:  # noqa: D106
        model = Antigen
        fields = [
            "project",
            "number",
            "name",
            "sequence",
            "molecular_mass",
            "uniprot_accession_number",
            "elisawell_set",
            "creation_time",
        ]


class AntigenViewSet(ReadOnlyModelViewSet):
    """A view set displaying all recorded antigens."""

    queryset = Antigen.objects.all()
    serializer_class = AntigenSerializer

    perform_create = perform_create_allow_creator_change_delete


class NanobodySerializer(ModelSerializer):
    """A serializer for nanobody data.

    A serializer for nanobody data which serializes all internal fields, elisa wells
    which contain this nanobody, and protein sequences of this nanobody.
    """

    project = SlugRelatedField(slug_field="short_title", queryset=Project.objects.all())
    name = ReadOnlyField()
    elisawell_set = ElisaWellRelatedField(many=True, read_only=True)
    sequence_set = PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:  # noqa: D106
        model = Nanobody
        fields = [
            "project",
            "number",
            "name",
            "elisawell_set",
            "sequence_set",
            "creation_time",
        ]


class NanobodyViewSet(ModelViewSet):
    """A view set displaying all recorded nanobodies."""

    queryset = Nanobody.objects.all()
    serializer_class = NanobodySerializer

    perform_create = perform_create_allow_creator_change_delete


class ElisaPlateSerializer(ModelSerializer):
    """A serializer for elisa plates.

    A serializer for elisa plates which serializes all internal fields and elisa wells
    contained within it.
    """

    project = SlugRelatedField(slug_field="short_title", queryset=Project.objects.all())
    elisawell_set = ElisaWellRelatedField(many=True, read_only=True)

    class Meta:  # noqa: D106
        model = ElisaPlate
        fields = ["project", "number", "threshold", "elisawell_set", "creation_time"]


class ElisaPlateViewSet(ModelViewSet):
    """A view set displaying all recorded elisa plates."""

    queryset = ElisaPlate.objects.all()
    serializer_class = ElisaPlateSerializer
    lookup_field = "key"

    perform_create = perform_create_allow_creator_change_delete


class ElisaWellSerializer(ModelSerializer):
    """A serializer for elisa wells which serializes all intenral fields."""

    project = SlugRelatedField(
        slug_field="short_title",
        queryset=Project.objects.all(),
        source="plate.project",
    )
    plate = SlugRelatedField(slug_field="number", queryset=ElisaPlate.objects.all())
    functional = ReadOnlyField()
    antigen = ProjectModelRelatedField[Antigen](queryset=Antigen.objects.all())
    nanobody = ProjectModelRelatedField[Nanobody](queryset=Nanobody.objects.all())

    class Meta:  # noqa: D106
        model = ElisaWell
        fields = [
            "project",
            "plate",
            "location",
            "antigen",
            "nanobody",
            "optical_density",
            "functional",
        ]


class ElisaWellViewSet(ModelViewSet):
    """A view set displaying all recorded elisa wells."""

    queryset = ElisaWell.objects.all()
    serializer_class = ElisaWellSerializer
    lookup_field = "key"

    perform_create = perform_create_allow_creator_change_delete


class SequenceSerializer(ModelSerializer):
    """A sequence serializer which serializes all interla fields."""

    nanobody = SlugRelatedField(slug_field="key_", queryset=Nanobody.objects.all())

    class Meta:  # noqa: D106
        model = Sequence
        fields = ["uuid", "nanobody", "cdr1", "cdr2", "cdr3", "creation_time"]


class SequenceViewSet(ModelViewSet):
    """A view set displaying all recorded sequences."""

    queryset = Sequence.objects.all()
    serializer_class = SequenceSerializer

    perform_create = perform_create_allow_creator_change_delete
