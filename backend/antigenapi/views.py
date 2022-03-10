from typing import Optional

from django.db.models import CharField as DbCharField
from django.db.models import F, Value
from django.db.models.functions import Concat
from rest_framework.serializers import (
    CharField,
    IntegerField,
    ModelSerializer,
    PrimaryKeyRelatedField,
    ReadOnlyField,
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
    Sequence,
    UniProtAntigen,
)
from antigenapi.utils.permission import perform_create_allow_creator_change_delete


class ProjectSerializer(ModelSerializer):
    """A serializer for project data which serializes all internal fields."""

    class Meta:  # noqa: D106
        model = Project
        fields = "__all__"


class ProjectViewSet(ModelViewSet):
    """a view set displaying all recorded projects."""

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    perform_create = perform_create_allow_creator_change_delete


PROJECT_ITEM_KEY = Concat(
    "project__short_title", Value(":"), "number", output_field=DbCharField()
)


class LocalAntigenSerializer(ModelSerializer):
    """A serializer for local antigen data.

    A serializer for local antigen data which serializes all interal fields, and the
    computed field; name.
    """

    key = ReadOnlyField()
    project = SlugRelatedField(slug_field="short_title", queryset=Project.objects.all())
    name = ReadOnlyField()

    class Meta:  # noqa: D106
        model = LocalAntigen
        exclude = ["uuid"]


class LocalAntigenViewSet(ModelViewSet):
    """A view set displaying all recorded local antigens."""

    queryset = LocalAntigen.objects.annotate(key=PROJECT_ITEM_KEY).all()
    serializer_class = LocalAntigenSerializer

    perform_create = perform_create_allow_creator_change_delete


class UniProtAntigenSerialzer(ModelSerializer):
    """A serializer for UniProt antigen data which serializes all internal fields."""

    key = ReadOnlyField()
    project = SlugRelatedField(slug_field="short_title", queryset=Project.objects.all())

    class Meta:  # noqa: D106
        model = UniProtAntigen
        exclude = ["uuid"]


class UniProtAntigenViewSet(ModelViewSet):
    """A view set displaying all recorded UniProt antigens."""

    queryset = UniProtAntigen.objects.annotate(key=PROJECT_ITEM_KEY).all()
    serializer_class = UniProtAntigenSerialzer

    perform_create = perform_create_allow_creator_change_delete


class AntigenSerializer(ModelSerializer):
    """A serializer for antigen data.

    A serializer for antigen data which serializes all internal fields, and includes the
    serialzed related local or UniProt antigen data and provides a set of elisa well
    which reference it.
    """

    key = ReadOnlyField()
    project = SlugRelatedField(slug_field="short_title", queryset=Project.objects.all())
    name = CharField(source="child.name")
    sequence = CharField(source="child.sequence")
    molecular_mass = IntegerField(source="child.molecular_mass")
    uniprot_accession_number = SerializerMethodField()
    elisawell_set = PrimaryKeyRelatedField(many=True, read_only=True)

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
        exclude = ["uuid"]


class AntigenViewSet(ReadOnlyModelViewSet):
    """A view set displaying all recorded antigens."""

    queryset = Antigen.objects.annotate(key=PROJECT_ITEM_KEY).all()
    serializer_class = AntigenSerializer

    perform_create = perform_create_allow_creator_change_delete


class NanobodySerializer(ModelSerializer):
    """A serializer for nanobody data.

    A serializer for nanobody data which serializes all internal fields, elisa wells
    which contain this nanobody, and protein sequences of this nanobody.
    """

    key = ReadOnlyField()
    project = SlugRelatedField(slug_field="short_title", queryset=Project.objects.all())
    name = ReadOnlyField()
    elisawell_set = PrimaryKeyRelatedField(many=True, read_only=True)
    sequences = PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:  # noqa: D106
        model = Nanobody
        exclude = ["uuid"]


class NanobodyViewSet(ModelViewSet):
    """A view set displaying all recorded nanobodies."""

    queryset = Nanobody.objects.annotate(key=PROJECT_ITEM_KEY).all()
    serializer_class = NanobodySerializer

    perform_create = perform_create_allow_creator_change_delete


class ElisaPlateSerializer(ModelSerializer):
    """A serializer for elisa plates.

    A serializer for elisa plates which serializes all internal fields and elisa wells
    contained within it.
    """

    key = ReadOnlyField()
    project = SlugRelatedField(slug_field="short_title", queryset=Project.objects.all())
    elisawell_set = SlugRelatedField(many=True, read_only=True, slug_field="location")

    class Meta:  # noqa: D106
        model = ElisaPlate
        exclude = ["uuid"]


class ElisaPlateViewSet(ModelViewSet):
    """A view set displaying all recorded elisa plates."""

    queryset = ElisaPlate.objects.annotate(key=PROJECT_ITEM_KEY).all()
    serializer_class = ElisaPlateSerializer
    lookup_field = "key"

    perform_create = perform_create_allow_creator_change_delete


class ElisaWellSerializer(ModelSerializer):
    """A serializer for elisa wells which serializes all intenral fields."""

    key = ReadOnlyField()
    project = ReadOnlyField()
    plate_number = ReadOnlyField()
    functional = ReadOnlyField()

    class Meta:  # noqa: D106
        model = ElisaWell
        exclude = ["uuid"]


class ElisaWellViewSet(ModelViewSet):
    """A view set displaying all recorded elisa wells."""

    queryset = ElisaWell.objects.annotate(
        key=Concat(
            "plate__project__short_title",
            Value(":"),
            "plate__number",
            Value(":"),
            "location",
            output_field=DbCharField(),
        ),
        project=F("plate__project__short_title"),
        plate_number=F("plate__number"),
    ).all()
    serializer_class = ElisaWellSerializer
    lookup_field = "key"

    perform_create = perform_create_allow_creator_change_delete


class SequenceSerializer(ModelSerializer):
    """A sequence serializer which serializes all interla fields."""

    class Meta:  # noqa: D106
        model = Sequence
        fields = "__all__"


class SequenceViewSet(ModelViewSet):
    """A view set displaying all recorded sequences."""

    queryset = Sequence.objects.all()
    serializer_class = SequenceSerializer

    perform_create = perform_create_allow_creator_change_delete
