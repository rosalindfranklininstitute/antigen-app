from datetime import datetime
from itertools import product
from typing import Dict, Optional
from uuid import UUID, uuid4

from django.core.validators import RegexValidator
from django.db.models import (
    CASCADE,
    ForeignKey,
    IntegerChoices,
    Model,
    UniqueConstraint,
)
from django.db.models.fields import (
    CharField,
    DateTimeField,
    FloatField,
    PositiveSmallIntegerField,
    UUIDField,
)

from antigenapi.utils.uniprot import get_protein


class Antigen(Model):
    """A unique antigen, typically referenced to the UniProt database."""

    uuid: UUID = UUIDField(primary_key=True, default=uuid4, editable=False)
    uniprot_id: str = CharField(max_length=32, unique=True, null=True)

    @property
    def protein_data(self) -> Optional[Dict]:
        """Protein data retrieved from the UniProt database.

        Returns:
            Optional[Dict]: A key value mapping of protein data if available.
        """
        if self.uniprot_id:
            return get_protein(self.uniprot_id)
        else:
            return None

    @property
    def name(self) -> str:
        """A user friendly short name for the protein.

        The recommended short name of the protein from the UniProt database if
        available, otherwise the first eight characters of the UUID is used

        Returns:
            str: A user friendly short name for the protein.
        """
        if self.protein_data:
            return self.protein_data["recommendedName"]["shortName"][0]
        else:
            return str(self.uuid)[:8]


class Nanobody(Model):
    """A unique nanobody."""

    uuid: UUID = UUIDField(primary_key=True, default=uuid4, editable=False)
    creation_time: datetime = DateTimeField(editable=False, default=datetime.now)

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
    threshold: float = FloatField()
    creation_time: datetime = DateTimeField(editable=False, default=datetime.now)


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
    optical_density: float = FloatField()

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


AminoCodeLetters = RegexValidator(r"^[ARNDCHIQEGLKMFPSTWYV]*$")


class Sequence(Model):
    """A nanobody sequence."""

    uuid: UUID = UUIDField(primary_key=True, default=uuid4, editable=False)
    nanobody: Nanobody = ForeignKey(
        Nanobody, on_delete=CASCADE, related_name="sequences"
    )
    cdr1: str = CharField(max_length=128, validators=[AminoCodeLetters])
    cdr2: str = CharField(max_length=128, validators=[AminoCodeLetters])
    cdr3: str = CharField(max_length=128, validators=[AminoCodeLetters])
    creation_time: datetime = DateTimeField(editable=False, default=datetime.now)
