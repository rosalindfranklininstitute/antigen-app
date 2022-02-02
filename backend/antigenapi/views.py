from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.oauth2.views import OAuth2Client
from allauth.socialaccount.providers.orcid.views import OrcidOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework.serializers import (
    ModelSerializer,
    PrimaryKeyRelatedField,
    ReadOnlyField,
)
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from antigenapi.models import (
    Antigen,
    ElisaPlate,
    ElisaWell,
    LocalAntigen,
    Nanobody,
    Sequence,
    UniProtAntigen,
)

from antigenapi.utils.permission import perform_create_allow_creator_change_delete


class GitHubLoginView(SocialLoginView):
    adapter_class = GitHubOAuth2Adapter
    callback_url = "https://127.0.0.1"
    client_class = OAuth2Client


class ORCiDLoginView(SocialLoginView):
    adapter_class = OrcidOAuth2Adapter


class LocalAntigenSerializer(ModelSerializer):
    """A serializer for local antigen data.

    A serializer for local antigen data which serializes all interal fields, and the
    computed field; name.
    """

    name = ReadOnlyField()

    class Meta:  # noqa: D106
        model = LocalAntigen
        fields = "__all__"
        read_only_fields = ["antigen"]


class LocalAntigenViewSet(ModelViewSet):
    """A view set displaying all recorded local antigens."""

    queryset = LocalAntigen.objects.all()
    serializer_class = LocalAntigenSerializer

    perform_create = perform_create_allow_creator_change_delete


class UniProtAntigenSerialzer(ModelSerializer):
    """A serializer for UniProt antigen data which serializes all internal fields."""

    class Meta:  # noqa: D106
        model = UniProtAntigen
        fields = "__all__"
        read_only_fields = ["antigen"]


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

    local_antigen = LocalAntigenSerializer(read_only=True)
    uniprot_antigen = UniProtAntigenSerialzer(read_only=True)
    antigen_elisa_wells = PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:  # noqa: D106
        model = Antigen
        fields = "__all__"


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

    perform_create = perform_create_allow_creator_change_delete


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

    perform_create = perform_create_allow_creator_change_delete


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
