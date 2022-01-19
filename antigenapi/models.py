from datetime import datetime
from itertools import product
from uuid import UUID, uuid4

from django.core.validators import RegexValidator
from django.db.models import (
    CASCADE,
    ForeignKey,
    IntegerChoices,
    Model,
    OneToOneField,
    UniqueConstraint,
)
from django.db.models.fields import (
    CharField,
    DateTimeField,
    FloatField,
    IntegerField,
    PositiveSmallIntegerField,
    TextField,
    UUIDField,
)
from django.utils.timezone import now

from antigenapi.utils.uniprot import get_protein


class Antigen(Model):
    """A unique antigen identifier, for use by Local & UniProt antigens."""

    uuid: UUID = UUIDField(primary_key=True, default=uuid4, editable=False)

    @classmethod
    def get_new(cls) -> UUID:
        """Create a new antigen instance and return the unique identifier.

        Returns:
            UUID: The unique identifier of the antigen instance.
        """
        return cls.objects.create().uuid


AminoCodeLetters = RegexValidator(r"^[ARNDCHIQEGLKMFPSTWYV]*$")


class LocalAntigen(Model):
    """A locally defined antigen with recorded sequence and molecular mass."""

    antigen = OneToOneField(
        Antigen,
        primary_key=True,
        editable=False,
        related_name="local_antigen",
        on_delete=CASCADE,
        default=Antigen.get_new,
    )
    sequence: str = TextField(validators=[AminoCodeLetters])
    molecular_mass: int = IntegerField()

    @property
    def name(self) -> str:
        """A human readable antigen name, consisting of the first eight characters of the UUID.

        Returns:
            str: A human readable antigen name.
        """
        return str(self.antigen.uuid)[:8]


class UniProtAntigen(Model):
    """An antigen defined by reference to the UniProt database."""

    antigen = OneToOneField(
        Antigen,
        primary_key=True,
        editable=False,
        related_name="uniprot_antigen",
        on_delete=CASCADE,
        default=Antigen.get_new,
    )
    uniprot_accession_number: str = CharField(max_length=32, unique=True)

    @property
    def sequence(self) -> str:
        """The protein sequence from the UniProt database.

        Returns:
            str: The protein sequence.
        """
        return get_protein(self.uniprot_accession_number)["sequence"]["$"]

    @property
    def name(self) -> str:
        """The recommended short name of the protein from the UniProt database.

        Returns:
            str: A user friendly short name for the protein.
        """
        return get_protein(self.uniprot_accession_number)["protein"]["recommendedName"][
            "shortName"
        ][0]

    @property
    def molecular_mass(self) -> int:
        """The protein molecular mass from the UniProt database.

        Returns:
            int: The protein molecular mass.
        """
        return get_protein(self.uniprot_accession_number)["sequence"]["@mass"]


class Nanobody(Model):
    """A unique nanobody."""

    uuid: UUID = UUIDField(primary_key=True, default=uuid4, editable=False)
    creation_time: datetime = DateTimeField(editable=False, default=now)

    @property
    def name(self) -> str:
        """A user friendly short name for the nanobody.

        A user friendly short name for the nanobody, consisting of the first eight
        characters of the UUID.

        Returns:
            str: A user friendly short name for the nanobody.
        """
        return str(self.uuid)[:8]


class ElisaPlate(Model):
    """A unique elisa experimental plate."""

    uuid: UUID = UUIDField(primary_key=True, default=uuid4, editable=False)
    threshold: float = FloatField(null=True)
    creation_time: datetime = DateTimeField(editable=False, default=now)


PlateLocations = IntegerChoices(
    "PlateLocations",
    [
        f"{chr(row)}{col}"
        for row, col in product(range(ord("A"), ord("H") + 1), range(1, 12))
    ],
)


class ElisaWell(Model):
    """A unique well within an elisa experimental plate.

    A unique well within an elisa experimental plate. Each well is supplied a solution
    containing an antigen and a nanobody, after the experiment concludes the optical
    density of each well is recorded.
    """

    uuid: UUID = UUIDField(primary_key=True, default=uuid4, editable=False)
    plate: ElisaPlate = ForeignKey(
        ElisaPlate, related_name="plate_elisa_wells", on_delete=CASCADE
    )
    location = PositiveSmallIntegerField(choices=PlateLocations.choices)
    antigen: Antigen = ForeignKey(
        Antigen, related_name="antigen_elisa_wells", on_delete=CASCADE
    )
    nanobody: Nanobody = ForeignKey(
        Nanobody, related_name="nanobody_elisa_wells", on_delete=CASCADE
    )
    optical_density: float = FloatField(null=True)

    class Meta:  # noqa: D106
        constraints = [
            UniqueConstraint(fields=["plate", "location"], name="unique_well")
        ]

    @property
    def functional(self) -> bool:
        """The functionality of a nanobody, determined by thresholding optical density.

        Returns:
            bool: True if optical density exceeds the plate threshold.
        """
        return self.optical_density >= self.plate.threshold


class Sequence(Model):
    """A nanobody sequence."""

    uuid: UUID = UUIDField(primary_key=True, default=uuid4, editable=False)
    nanobody: Nanobody = ForeignKey(
        Nanobody, on_delete=CASCADE, related_name="sequences"
    )
    cdr1: str = TextField(validators=[AminoCodeLetters])
    cdr2: str = TextField(validators=[AminoCodeLetters])
    cdr3: str = TextField(validators=[AminoCodeLetters])
    creation_time: datetime = DateTimeField(editable=False, default=datetime.now)
