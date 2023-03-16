from itertools import product

from django.conf import settings
from django.core.files import File
from django.core.validators import FileExtensionValidator, RegexValidator
from django.db.models import (
    CASCADE,
    PROTECT,
    FileField,
    ForeignKey,
    IntegerChoices,
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
    title = CharField(max_length=256, unique=True)
    short_title = CharField(max_length=64, unique=True)
    description = TextField(null=True, blank=True)
    added_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT)
    added_date = DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"({self.id}) {self.short_title}"


class Llama(Model):
    name = CharField(max_length=64)
    notes = TextField(null=True, blank=True)
    added_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT)
    added_date = DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


AminoCodeLetters = RegexValidator(r"^[ARNDCHIQEGLKMFPSTWYVBZX]*$")


class Antigen(Model):
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

    def __str__(self):
        return self.preferred_name + f" [{self.uniprot_id}]" if self.uniprot_id else ""


class Cohort(Model):
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


class Library(Model):
    project = ForeignKey(Project, on_delete=PROTECT)
    cohort = ForeignKey(Cohort, on_delete=PROTECT)
    added_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT)
    added_date = DateTimeField(auto_now_add=True)


class ElisaPlate(Model):
    optical_density_threshold: float = FloatField(null=True)
    library = ForeignKey(Library, on_delete=PROTECT)
    antibody = TextField(blank=True)
    pan_round = TextField(blank=True)
    added_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT)
    added_date = DateTimeField(auto_now_add=True)
    plate_file: File = FileField(
        upload_to="uploads/elisaplates/",
        validators=[FileExtensionValidator(allowed_extensions=["xlsx"])],
    )


PlateLocations = IntegerChoices(
    "PlateLocations",
    [
        f"{chr(row)}{col}"
        for row, col in product(range(ord("A"), ord("H") + 1), range(1, 12 + 1))
    ],
)


class ElisaWell(Model):
    plate: ElisaPlate = ForeignKey(ElisaPlate, on_delete=CASCADE)
    location = PositiveSmallIntegerField(choices=PlateLocations.choices)
    antigen: Antigen = ForeignKey(Antigen, on_delete=PROTECT)
    optical_density: float = FloatField(null=True)

    class Meta:  # noqa: D106
        constraints = [
            UniqueConstraint(fields=["plate", "location"], name="unique_well")
        ]
        ordering = ["location"]

    @property
    def functional(self) -> bool:
        """The functionality of a nanobody, determined by thresholding optical density.

        Returns:
            bool: True if optical density is set and exceeds the plate threshold
        """
        return (
            self.optical_density >= self.plate.optical_density_threshold
            if self.optical_density and self.plate.optical_density_threshold
            else False
        )
