from itertools import product

from auditlog.registry import auditlog
from django.conf import settings
from django.core.files import File
from django.core.validators import FileExtensionValidator, RegexValidator
from django.db.models import (
    CASCADE,
    PROTECT,
    FileField,
    ForeignKey,
    IntegerChoices,
    JSONField,
    ManyToManyField,
    Model,
    UniqueConstraint,
)
from django.db.models.fields import (
    CharField,
    DateField,
    DateTimeField,
    FloatField,
    IntegerField,
    PositiveIntegerField,
    PositiveSmallIntegerField,
    TextField,
)


class Project(Model):
    """Project model."""

    title = CharField(max_length=256, unique=True)
    short_title = CharField(max_length=64, unique=True)
    description = TextField(null=True, blank=True)
    added_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT)
    added_date = DateTimeField(auto_now_add=True)

    def __str__(self):  # noqa: D105
        return f"({self.id}) {self.short_title}"


class Llama(Model):
    """Llama model."""

    name = CharField(max_length=64)
    notes = TextField(null=True, blank=True)
    added_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT)
    added_date = DateTimeField(auto_now_add=True)

    def __str__(self):  # noqa: D105
        return self.name


AminoCodeLetters = RegexValidator(r"^[ARNDCHIQEGLKMFPSTWYVBZX]*$")


class Antigen(Model):
    """Antigen model."""

    uniprot_id = CharField(max_length=16, null=True, unique=True)
    preferred_name = CharField(max_length=256)
    sequence: str = TextField(validators=[AminoCodeLetters], null=True)
    molecular_mass: int = IntegerField(null=True)
    description = TextField(
        null=True, blank=True
    )  # Short desc of antigen (function, origin, ...)
    epitope = TextField(null=True, blank=True)  # Short desc of binding epitope
    added_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT)
    added_date = DateTimeField(auto_now_add=True)

    def __str__(self):  # noqa: D105
        return self.preferred_name + f" [{self.uniprot_id}]" if self.uniprot_id else ""


class Cohort(Model):
    """Cohort model."""

    cohort_num = PositiveIntegerField(unique=True)
    llama = ForeignKey(Llama, on_delete=PROTECT)
    immunisation_date = DateField(null=True)
    blood_draw_date = DateField(null=True)
    projects = ManyToManyField(
        Project,
        through="Library",
        through_fields=("cohort", "project"),
        related_name="libraries",
        related_query_name="library",
    )
    antigens = ManyToManyField(Antigen)
    added_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT)
    added_date = DateTimeField(auto_now_add=True)

    def __str__(self):  # noqa: D105
        return f"Cohort No. {self.cohort_num}"


class Library(Model):
    """Library model."""

    project = ForeignKey(Project, on_delete=PROTECT)
    cohort = ForeignKey(Cohort, on_delete=PROTECT)
    added_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT)
    added_date = DateTimeField(auto_now_add=True)

    class Meta:  # noqa: D106
        constraints = [
            UniqueConstraint(fields=["project", "cohort"], name="unique_project_cohort")
        ]

    def __str__(self):  # noqa: D105
        return f"Library {self.id}"


class ElisaPlate(Model):
    """ELISA plate model."""

    library = ForeignKey(Library, on_delete=PROTECT)
    antibody = TextField(blank=True)
    pan_round = TextField(blank=True)
    added_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT)
    added_date = DateTimeField(auto_now_add=True)
    plate_file: File = FileField(
        upload_to="uploads/elisaplates/",
        validators=[FileExtensionValidator(allowed_extensions=["xlsx"])],
    )

    def __str__(self):  # noqa: D105
        return f"ElisaPlate {self.id}"


PlateLocations = IntegerChoices(
    "PlateLocations",
    [
        f"{chr(row)}{col}"
        for row, col in product(range(ord("A"), ord("H") + 1), range(1, 12 + 1))
    ],
)


class ElisaWell(Model):
    """ELISA well model."""

    plate: ElisaPlate = ForeignKey(ElisaPlate, on_delete=CASCADE)
    location = PositiveSmallIntegerField(choices=PlateLocations.choices)
    antigen: Antigen = ForeignKey(Antigen, on_delete=PROTECT)
    optical_density: float = FloatField(null=True)

    class Meta:  # noqa: D106
        constraints = [
            UniqueConstraint(fields=["plate", "location"], name="unique_well")
        ]
        ordering = ["location"]


class SequencingRun(Model):
    """A sequencing run."""

    plate_thresholds: JSONField = JSONField()
    wells: JSONField = JSONField()
    notes = TextField(null=True, blank=True)
    sent_date = DateField(null=True)
    added_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT)
    added_date = DateTimeField(auto_now_add=True)


auditlog.register(Project)
auditlog.register(Llama)
auditlog.register(Antigen)
auditlog.register(Cohort, m2m_fields={"projects", "antigens"})
auditlog.register(Library)
auditlog.register(ElisaPlate)
auditlog.register(SequencingRun)
