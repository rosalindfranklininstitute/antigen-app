from datetime import datetime
from itertools import product
from typing import Iterable, Optional, Union
from uuid import UUID, uuid4
import os
from django.core.files import File
from django.core.validators import RegexValidator
from django.db.models import (
    CASCADE,
    F,
    ForeignKey,
    IntegerChoices,
    Manager,
    Max,
    Model,
    QuerySet,
    UniqueConstraint,
    Value,
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
from django.db.models.functions import Concat
from django.utils.timezone import now
from django.db.models import FileField
from antigenapi.utils.uniprot import get_protein
from django.apps import apps


class Project(Model):
    """A unique project."""

    uuid: UUID = UUIDField(primary_key=True, default=uuid4, editable=False)
    title = CharField(max_length=256, unique=True)
    short_title = CharField(max_length=64, unique=True)
    description = TextField()


class ProjectModelMixin(Model):
    """A mixin which adds a project and a dependant auto-incrementing number."""

    project: Project = ForeignKey(Project, on_delete=CASCADE)
    number: int = PositiveSmallIntegerField(editable=False)

    @property
    def key_(self) -> str:
        """A property alternatie to the annotated key."""
        return f"{self.project.short_title}:{self.number}"

    def __str__(self) -> str:  # noqa: D105
        return self.key_

    class Meta:  # noqa: D106
        unique_together = ("project", "number")
        abstract = True

    class ProjectMeta:  # noqa: D106
        project_queryset: Optional[QuerySet["ProjectModelMixin"]] = None

    def save(
        self,
        force_insert: bool = False,
        force_update: bool = False,
        using: Optional[str] = None,
        update_fields: Optional[Iterable[str]] = None,
    ) -> None:
        """Extended save method which auto-increments 'number' per project."""
        if self._state.adding:
            project_objects = (
                type(self).ProjectMeta.project_queryset or type(self).objects
            ).filter(project=self.project)
            self.number = (
                project_objects.aggregate(Max("number"))["number__max"] + 1
                if project_objects
                else 1
            )
        return super().save(force_insert, force_update, using, update_fields)

    class ProjectManager(Manager):
        """A manager providing a queryset annotated with project based keys."""

        def get_queryset(self) -> QuerySet["ProjectModelMixin"]:
            """Annotate queryset with key."""
            return (
                super()
                .get_queryset()
                .annotate(
                    key=Concat(
                        "project__short_title",
                        Value(":"),
                        "number",
                        output_field=CharField(),
                    )
                )
            )

    raw_objects = Manager()
    objects = ProjectManager()


class Antigen(ProjectModelMixin, Model):
    """A unique antigen identifier, for use by Local & UniProt antigens."""

    uuid: UUID = UUIDField(primary_key=True, default=uuid4, editable=False)
    creation_time: datetime = DateTimeField(editable=False, default=now)

    @property
    def child(self) -> Optional[Union["LocalAntigen", "UniProtAntigen"]]:
        """The child LocalAntigen or UniProtAntigen instance if available.

        Returns:
            Optional[Union[LocalAntigen, UniProtAntigen]]: The child LocalAntigen or
                UniProtAntigen instance if available.
        """
        return getattr(self, "localantigen", None) or getattr(
            self, "uniprotantigen", None
        )

    def __str__(self) -> str:  # noqa: D105
        return f"{self.child.name} [{self.key_}]" if self.child else self.key_


AminoCodeLetters = RegexValidator(r"^[ARNDCHIQEGLKMFPSTWYVBZX]*$")


class LocalAntigen(Antigen, Model):
    """A locally defined antigen with recorded sequence and molecular mass."""

    sequence: str = TextField(validators=[AminoCodeLetters])
    molecular_mass: int = IntegerField()

    @property
    def name(self) -> str:
        """A human readable antigen name, consisting of the first eight characters of the UUID.

        Returns:
            str: A human readable antigen name.
        """
        return str(self.uuid)[:8]

    class Meta:
        """Empty Meta to negate the unique_together constraint of ProjectModelMixin."""

        ...

    class ProjectMeta:
        """Use antigens as the project_queryset so local & uniprot share numbers."""

        project_queryset = Antigen.raw_objects.all()


class UniProtAntigen(Antigen, Model):
    """An antigen defined by reference to the UniProt database."""

    uniprot_accession_number: str = CharField(max_length=32, unique=True)
    sequence: str = TextField(validators=[AminoCodeLetters], editable=False)
    molecular_mass: int = IntegerField(editable=False)
    name = CharField(max_length=32, editable=False)

    class Meta:
        """Empty Meta to negate the unique_together constraint of ProjectModelMixin."""

        ...

    class ProjectMeta:
        """Use antigens as the project_queryset so local & uniprot share numbers."""

        project_queryset = Antigen.raw_objects.all()


class Nanobody(ProjectModelMixin, Model):
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

    def __str__(self) -> str:  # noqa: D105
        return f"{self.name} [{self.key_}]"


class ElisaPlate(ProjectModelMixin, Model):
    """A unique elisa experimental plate."""

    uuid: UUID = UUIDField(primary_key=True, default=uuid4, editable=False)
    threshold: float = FloatField(null=True)
    creation_time: datetime = DateTimeField(editable=False, default=now)
    csv_file: File = FileField(null=True, blank=True, upload_to="uploads/")


PlateLocations = IntegerChoices(
    "PlateLocations",
    [
        f"{chr(row)}{col}"
        for row, col in product(range(ord("A"), ord("H") + 1), range(1, 12 + 1))
    ],
)


class ElisaWell(Model):
    """A unique well within an elisa experimental plate.

    A unique well within an elisa experimental plate. Each well is supplied a solution
    containing an antigen and a nanobody, after the experiment concludes the optical
    density of each well is recorded.
    """

    uuid: UUID = UUIDField(primary_key=True, default=uuid4, editable=False)
    plate: ElisaPlate = ForeignKey(ElisaPlate, on_delete=CASCADE)
    location = PositiveSmallIntegerField(choices=PlateLocations.choices)
    antigen: Antigen = ForeignKey(Antigen, on_delete=CASCADE)
    nanobody: Nanobody = ForeignKey(Nanobody, null=True, on_delete=CASCADE)
    optical_density: float = FloatField(null=True)

    class Meta:  # noqa: D106
        constraints = [
            UniqueConstraint(fields=["plate", "location"], name="unique_well")
        ]

    class ElisaWellManager(Manager):  # noqa: D106
        def get_queryset(self) -> QuerySet["ElisaWell"]:
            """Annotate queryset with key, project & plate_number."""
            return (
                super()
                .get_queryset()
                .annotate(
                    key=Concat(
                        "plate__project__short_title",
                        Value(":"),
                        "plate__number",
                        Value(":"),
                        "location",
                        output_field=CharField(),
                    ),
                )
            )

    objects = ElisaWellManager()

    @property
    def key_(self) -> str:
        """A property alternatie to the annotated key."""
        return f"{self.plate.project}:{self.plate.number}:{self.location}"

    @property
    def functional(self) -> bool:
        """The functionality of a nanobody, determined by thresholding optical density.

        Returns:
            bool: True if optical density is set and exceeds the plate threshold
        """
        return (
            self.optical_density >= self.plate.threshold
            if self.optical_density
            else False
        )

    def __str__(self) -> str:  # noqa: D105
        return self.key_


class Sequence(Model):
    """A nanobody sequence."""

    uuid: UUID = UUIDField(primary_key=True, default=uuid4, editable=False)
    nanobody: Nanobody = ForeignKey(Nanobody, on_delete=CASCADE)
    cdr1: str = TextField(validators=[AminoCodeLetters])
    cdr2: str = TextField(validators=[AminoCodeLetters])
    cdr3: str = TextField(validators=[AminoCodeLetters])
    creation_time: datetime = DateTimeField(editable=False, default=datetime.now)

    class SequenceManager(Manager):  # noqa: D106
        def get_queryset(self) -> QuerySet["Sequence"]:
            """Annotate queryset with project."""
            return (
                super()
                .get_queryset()
                .annotate(project=F("nanobody__project__short_title"))
            )

    objects = SequenceManager()
