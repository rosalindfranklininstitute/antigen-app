from itertools import product

from auditlog.registry import auditlog
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files import File
from django.core.validators import (
    FileExtensionValidator,
    MinValueValidator,
    RegexValidator,
)
from django.db.models import (
    CASCADE,
    PROTECT,
    BooleanField,
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
from django.db.models.signals import post_init, post_save

from .bioinformatics.imgt import read_airr_file


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
    short_name = CharField(max_length=32, unique=True)
    long_name = CharField(max_length=256, blank=True)
    sequence: str = TextField(validators=[AminoCodeLetters], null=True)
    molecular_mass: int = IntegerField(null=True)
    description = TextField(
        null=True, blank=True
    )  # Short desc of antigen (function, origin, ...)
    epitope = TextField(null=True, blank=True)  # Short desc of binding epitope
    added_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT)
    added_date = DateTimeField(auto_now_add=True)

    def __str__(self):  # noqa: D105
        return self.short_name + (f" [{self.uniprot_id}]" if self.uniprot_id else "")


class Cohort(Model):
    """Cohort model."""

    cohort_num = PositiveIntegerField(unique=True)
    llama = ForeignKey(Llama, on_delete=PROTECT)
    is_naive = BooleanField(default=False)
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

    def cohort_num_prefixed(self):
        """Cohort number with 'N' prefix if naive."""
        return f"N{self.cohort_num}" if self.is_naive else f"{self.cohort_num}"


def validate_sublibrary_prefix(value):
    """Validate sublibraries have the SL_ prefix."""
    if value is not None and not value.startswith("SL_"):
        raise ValidationError("Sublibraries must start with SL_")


class Library(Model):
    """Library model."""

    project = ForeignKey(Project, on_delete=PROTECT)
    cohort = ForeignKey(Cohort, on_delete=PROTECT)
    sublibrary = TextField(
        null=True, blank=False, max_length=32, validators=[validate_sublibrary_prefix]
    )
    added_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT)
    added_date = DateTimeField(auto_now_add=True)

    class Meta:  # noqa: D106
        constraints = [
            UniqueConstraint(
                fields=["project", "cohort", "sublibrary"], name="unique_project_cohort"
            )
        ]

    def __str__(self):  # noqa: D105
        return f"Library {self.id}"

    def library_num(self):
        """Prefixed cohort number with sublibrary suffix."""
        return f"{self.cohort.cohort_num_prefixed()}{self.sublibrary or ''}"


class ElisaPlate(Model):
    """ELISA plate model."""

    library = ForeignKey(Library, on_delete=PROTECT)
    antibody = TextField(blank=True)
    pan_round_concentration = FloatField(default=0, validators=[MinValueValidator(0)])
    comments = TextField(blank=True)
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
    fill_horizontal = BooleanField(default=False)
    notes = TextField(null=True, blank=True)
    sent_date = DateField(null=True)
    added_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT)
    added_date = DateTimeField(auto_now_add=True)

    def __str__(self):  # noqa: D105
        return f"SequencingRun {self.pk}"


class SequencingRunResults(Model):
    """A results file for a sequencing run."""

    sequencing_run = ForeignKey(SequencingRun, on_delete=CASCADE)
    seq: int = PositiveSmallIntegerField()
    well_pos_offset: int = PositiveIntegerField(default=0)
    seqres_file: File = FileField(
        upload_to="uploads/sequencingresults/",
    )
    parameters_file: File = FileField(
        upload_to="uploads/sequencingresults/",
    )
    airr_file: File = FileField(
        upload_to="uploads/sequencingresults/",
    )
    added_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT)
    added_date = DateTimeField(auto_now_add=True)

    class Meta:  # noqa: D106
        constraints = [
            UniqueConstraint(fields=["sequencing_run", "seq"], name="unique_seqrun_seq")
        ]

    def __str__(self):  # noqa: D105
        return f"SequencingRunResults {self.pk}"


class Nanobody(Model):
    """A named nanobody."""

    name: str = TextField()
    sequence: str = TextField(validators=[AminoCodeLetters], unique=True)
    seqruns = ManyToManyField(SequencingRunResults, related_name="nanobodies")
    added_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=PROTECT)
    added_date = DateTimeField(auto_now_add=True)
    previous_sequence = None  # Track previous sequence for update hook

    def __str__(self):  # noqa: D105
        return self.name

    @staticmethod
    def post_save(sender, instance, created, **kwargs):
        """Update seqruns if the sequence has changed."""
        if instance.previous_sequence != instance.sequence or created:
            srr_links = []
            for sr in SequencingRunResults.objects.all():
                airr_file = read_airr_file(
                    sr.airr_file, usecols=("sequence_alignment_aa",)
                )
                seqs = set(
                    airr_file.sequence_alignment_aa.dropna()
                    .str.replace(".", "")
                    .replace("*", "X")
                    .unique()
                )
                print(seqs)
                if instance.sequence in seqs:
                    srr_links.append(sr)
            instance.seqruns.set(srr_links)

    @staticmethod
    def remember_state(sender, instance, **kwargs):
        """Save the previous sequence to see if it's changed when saving."""
        instance.previous_sequence = instance.sequence


post_save.connect(Nanobody.post_save, sender=Nanobody)
post_init.connect(Nanobody.remember_state, sender=Nanobody)

auditlog.register(Project)
auditlog.register(Llama)
auditlog.register(Antigen)
auditlog.register(Cohort, m2m_fields={"projects", "antigens"})
auditlog.register(Library)
auditlog.register(ElisaPlate)
auditlog.register(SequencingRun)
auditlog.register(SequencingRunResults)
auditlog.register(Nanobody)
