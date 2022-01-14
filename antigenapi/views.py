from rest_framework.serializers import (
    ModelSerializer,
    PrimaryKeyRelatedField,
    ReadOnlyField,
)
from rest_framework.viewsets import ModelViewSet

from antigenapi.models import Antigen, ElisaPlate, ElisaWell, Nanobody, Sequence


class AntigenSerializer(ModelSerializer):
    """A serializer for antigen data.

    A serializer for antigen data which serializes all internal fields and elisa wells
    which contain this antigen.
    """

    name = ReadOnlyField()
    antigen_elisa_wells = PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:  # noqa: D106
        model = Antigen
        fields = "__all__"


class AntigenViewSet(ModelViewSet):
    """A view set displaying all recorded antigens."""

    queryset = Antigen.objects.all()
    serializer_class = AntigenSerializer


class NanobodySerializer(ModelSerializer):
    """A serializer for nanobody data.

    A serializer for nanobody data which serializes all internal fields, elisa wells
    which contain this nanobody, and protein sequences of this nanobody.
    """

    name = ReadOnlyField()
    nanobody_elisa_wells = PrimaryKeyRelatedField(many=True, read_only=True)
    sequences = PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:  # noqa: D106
        model = Nanobody
        fields = "__all__"


class NanobodyViewSet(ModelViewSet):
    """A view set displaying all recorded nanobodies."""

    queryset = Nanobody.objects.all()
    serializer_class = NanobodySerializer


class ElisaPlateSerializer(ModelSerializer):
    """A serializer for elisa plates.

    A serializer for elisa plates which serializes all internal fields and elisa wells
    contained within it.
    """

    plate_elisa_wells = PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:  # noqa: D106
        model = ElisaPlate
        fields = "__all__"


class ElisaPlateViewSet(ModelViewSet):
    """A view set displaying all recorded elisa plates."""

    queryset = ElisaPlate.objects.all()
    serializer_class = ElisaPlateSerializer


class ElisaWellSerializer(ModelSerializer):
    """A serializer for elisa wells which serializes all intenral fields."""

    functional = ReadOnlyField()

    class Meta:  # noqa: D106
        model = ElisaWell
        fields = "__all__"


class ElisaWellViewSet(ModelViewSet):
    """A view set displaying all recorded elisa wells."""

    queryset = ElisaWell.objects.all()
    serializer_class = ElisaWellSerializer


class SequenceSerializer(ModelSerializer):
    """A sequence serializer which serializes all interla fields."""

    class Meta:  # noqa: D106
        model = Sequence
        fields = "__all__"


class SequenceViewSet(ModelViewSet):
    """A view set displaying all recorded sequences."""

    queryset = Sequence.objects.all()
    serializer_class = SequenceSerializer
