import collections.abc
import io
import os
import urllib.error
import urllib.parse
from tempfile import NamedTemporaryFile
from wsgiref.util import FileWrapper

import numpy as np
import openpyxl
import pandas as pd
from auditlog.models import LogEntry
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.core.files import File
from django.db import transaction
from django.db.models.deletion import ProtectedError
from django.db.utils import IntegrityError
from django.http import Http404, HttpResponse, JsonResponse
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.serializers import (
    CharField,
    FileField,
    ModelSerializer,
    PrimaryKeyRelatedField,
    StringRelatedField,
    ValidationError,
)
from rest_framework.viewsets import ModelViewSet

from antigenapi.bioinformatics import as_fasta_files, load_sequences, run_vquest
from antigenapi.models import (
    Antigen,
    Cohort,
    ElisaPlate,
    ElisaWell,
    Library,
    Llama,
    PlateLocations,
    Project,
    SequencingRun,
    SequencingRunResults,
)
from antigenapi.utils.uniprot import get_protein

from .parsers import parse_elisa_file


# Audit logs #
class AuditLogSerializer(ModelSerializer):
    """A serializer for object audit logs."""

    actor_username = StringRelatedField(source="actor.username", read_only=True)
    actor_email = StringRelatedField(source="actor.email", read_only=True)

    class Meta:  # noqa: D106
        model = LogEntry
        fields = [
            "timestamp",
            "object_id",
            "action",
            "changes_dict",
            "actor",
            "actor_username",
            "actor_email",
        ]


# Mixins #
class DeleteProtectionMixin(object):
    """Show helpful error when delete protection is in place (on_delete=PROTECT)."""

    def destroy(self, request, *args, **kwargs):
        """Override destroy method to catch Django's ProtectedError, return HTTP 400."""
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError as protected_error:
            protected_elements = set()
            for obj in protected_error.protected_objects:
                if isinstance(obj, ElisaWell):
                    protected_elements.add(str(obj.plate))
                else:
                    protected_elements.add(str(obj))
            protected_elements = tuple(protected_elements)
            msg = f"DeleteProtection: Object in use by {protected_elements[0]}"
            if len(protected_elements) > 1:
                msg += f" and {len(protected_elements) - 1} other object"
                if len(protected_elements) > 2:
                    msg += "s"
            response_data = {"message": msg, "protected_elements": protected_elements}
            return Response(data=response_data, status=status.HTTP_400_BAD_REQUEST)


class AuditLogMixin(object):
    """Allow fetching audit logs on individual objects."""

    @action(detail=True, methods=["GET"], name="Get audit log")
    def auditlog(self, request, pk):
        """Get audit logs for an object."""
        queryset = LogEntry.objects.filter(
            content_type=ContentType.objects.get_for_model(self.queryset.model),
            object_id=pk,
        ).select_related("actor")

        serializer = AuditLogSerializer(queryset, many=True)
        return Response(serializer.data)


# Projects #
class ProjectSerializer(ModelSerializer):
    """A serializer for project data which serializes all internal fields."""

    added_by = StringRelatedField()

    class Meta:  # noqa: D106
        model = Project
        fields = "__all__"
        read_only_fields = ["added_by", "added_date"]


class ProjectViewSet(AuditLogMixin, DeleteProtectionMixin, ModelViewSet):
    """A view set displaying all recorded projects."""

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def perform_create(self, serializer):
        """Overload the perform_create method."""
        serializer.save(added_by=self.request.user)


# Llamas #
class LlamaSerializer(ModelSerializer):
    """A serializer for llamas."""

    added_by = StringRelatedField()

    class Meta:  # noqa: D106
        model = Llama
        fields = "__all__"
        read_only_fields = ["added_by", "added_date"]


class LlamaViewSet(AuditLogMixin, DeleteProtectionMixin, ModelViewSet):
    """A view set for llamas."""

    queryset = Llama.objects.all()
    serializer_class = LlamaSerializer

    def perform_create(self, serializer):  # noqa: D102
        serializer.save(added_by=self.request.user)


# Library #
class LibrarySerializer(ModelSerializer):
    """A serializer for libraries."""

    added_by = StringRelatedField()
    # llama_name = CharField(source='llama.name', read_only=True)
    cohort_cohort_num = CharField(source="cohort.cohort_num", read_only=True)
    project_short_title = CharField(source="project.short_title", read_only=True)

    class Meta:  # noqa: D106
        model = Library
        fields = "__all__"
        read_only_fields = ["added_by", "added_date"]


class LibraryViewSet(AuditLogMixin, DeleteProtectionMixin, ModelViewSet):
    """A view set for libraries."""

    queryset = Library.objects.all().select_related("cohort").select_related("project")
    serializer_class = LibrarySerializer
    filterset_fields = ("project",)

    def perform_create(self, serializer):  # noqa: D102
        try:
            serializer.save(added_by=self.request.user)
        except IntegrityError as e:
            raise ValidationError({"non_field_errors": [str(e)]})


class AntigenSerializer(ModelSerializer):
    """A serializer for antigen data.

    A serializer for antigen data which serializes all internal fields, and includes the
    serialzed related local or UniProt antigen data and provides a set of elisa well
    which reference it.
    """

    added_by = StringRelatedField()
    preferred_name = CharField(
        required=False
    )  # Not required at creation, since we can use Uniprot ID instead

    class Meta:  # noqa: D106
        model = Antigen
        fields = "__all__"
        read_only_fields = ["added_by", "added_date"]

    def validate(self, data):
        """Check the antigen is a valid uniprot ID."""
        if data.get("uniprot_id"):
            try:
                protein_data = get_protein(data["uniprot_id"])
            except urllib.error.HTTPError as e:
                if e.code == 400:
                    raise ValidationError(
                        {"uniprot_id": "Couldn't validate this UniProt ID (code 400)"}
                    )
                elif e.code == 500:
                    raise ValidationError(
                        {"uniprot_id": "Couldn't validate this UniProt ID (code 500)"}
                    )
                else:
                    raise
            if not data.get("sequence") or data.get("sequence").strip() == "":
                data["sequence"] = protein_data["sequence"]["$"]
            if data.get("molecular_mass") is None:
                data["molecular_mass"] = protein_data["sequence"]["@mass"]
            if (
                not data.get("preferred_name")
                or data.get("preferred_name").strip() == ""
            ):
                try:
                    data["preferred_name"] = protein_data["protein"]["recommendedName"][
                        "fullName"
                    ]
                    if isinstance(data["preferred_name"], collections.abc.Mapping):
                        data["preferred_name"] = data["preferred_name"]["$"]
                except KeyError:
                    # TODO: Further error checking that name list is set
                    data["preferred_name"] = protein_data["name"][0]
        else:
            if (
                not data.get("preferred_name")
                or data.get("preferred_name", "").strip() == ""
            ):
                raise ValidationError(
                    {"preferred_name": "Need either a UniProt ID or a preferred name"}
                )
        return data


class AntigenViewSet(AuditLogMixin, DeleteProtectionMixin, ModelViewSet):
    """A view set displaying all recorded antigens."""

    queryset = Antigen.objects.all()
    serializer_class = AntigenSerializer

    def perform_create(self, serializer):  # noqa: D102
        serializer.save(added_by=self.request.user)


# Cohort #
class CohortSerializer(ModelSerializer):
    """A serializer for cohorts."""

    added_by = StringRelatedField()
    llama_name = CharField(source="llama.name", read_only=True)
    antigen_details = AntigenSerializer(source="antigens", many=True, read_only=True)
    # project_short_title = CharField(source='project.short_title', read_only=True)

    class Meta:  # noqa: D106
        model = Cohort
        fields = "__all__"
        read_only_fields = ["added_by", "added_date"]


class CohortViewSet(AuditLogMixin, DeleteProtectionMixin, ModelViewSet):
    """A view set for cohorts."""

    queryset = Cohort.objects.all().select_related("llama")
    serializer_class = CohortSerializer
    filterset_fields = ("llama", "cohort_num")

    def perform_create(self, serializer):  # noqa: D102
        serializer.save(added_by=self.request.user)


# ELISA plates #
class NestedElisaWellSerializer(ModelSerializer):
    """A serializer for elisa wells."""

    class Meta:  # noqa: D106
        model = ElisaWell
        exclude = ("id", "plate")


class ElisaPlateSerializer(ModelSerializer):
    """A serializer for elisa plates.

    A serializer for elisa plates which serializes all internal fields and elisa wells
    contained within it.
    """

    project_short_title = CharField(
        source="library.project.short_title", read_only=True
    )
    library_cohort_cohort_num = CharField(
        source="library.cohort.cohort_num", required=False
    )
    added_by = StringRelatedField()
    elisawell_set = NestedElisaWellSerializer(many=True, required=False)
    antigen = PrimaryKeyRelatedField(queryset=Antigen.objects.all(), write_only=True)
    read_only_fields = [
        "library_cohort_cohort_num",
        "elisawell_set",
        "added_by",
        "added_date",
    ]
    plate_file = FileField(use_url=False)

    class Meta:  # noqa: D106
        model = ElisaPlate
        fields = "__all__"

    def validate(self, data):
        """Validate plate (load and parse file)."""
        if "plate_file" in data:
            try:
                data["elisawell_set"] = parse_elisa_file(data["plate_file"])
            except Exception as e:
                raise ValidationError({"plate_file": e})
        return data

    @staticmethod
    def _create_wells(plate, antigen, well_set):
        ElisaWell.objects.bulk_create(
            ElisaWell(plate=plate, optical_density=od, location=loc, antigen=antigen)
            for (od, loc) in zip(well_set, PlateLocations)
        )

    @transaction.atomic
    def create(self, validated_data):
        """Create plate. For now, every well shares the same antigen."""
        antigen = validated_data.pop("antigen")
        well_set = validated_data.pop("elisawell_set")
        validated_data["plate_file"].seek(0)
        plate = super(ElisaPlateSerializer, self).create(validated_data)
        self._create_wells(plate, antigen, well_set)
        return plate

    @transaction.atomic
    def update(self, instance, validated_data):
        """Update plate. For now, every well shares the same antigen."""
        antigen = validated_data["antigen"]
        if "elisawell_set" in validated_data:
            well_set = validated_data.pop("elisawell_set")
        else:
            well_set = None
        if "plate_file" in validated_data:
            try:
                validated_data["plate_file"].seek(0)
            except ValueError:
                # File has already been read during create, so skip it
                validated_data.pop("plate_file")
                well_set = None
        plate = super(ElisaPlateSerializer, self).update(instance, validated_data)
        if well_set is not None:
            # Faster, fewer DB queries to bulk delete & re-insert
            # than conditionally update
            ElisaWell.objects.filter(plate=plate).delete()
            self._create_wells(plate, antigen, well_set)
        return instance


class ElisaPlateViewSet(AuditLogMixin, DeleteProtectionMixin, ModelViewSet):
    """A view set displaying all recorded elisa plates."""

    queryset = ElisaPlate.objects.all().select_related("library__cohort")
    serializer_class = ElisaPlateSerializer
    filterset_fields = ("library",)

    def perform_create(self, serializer):  # noqa: D102
        serializer.save(added_by=self.request.user)


class ElisaWellInlineSerializer(ModelSerializer):
    """A serializer to represent elisa wells by plate id and location."""

    class Meta:  # noqa: D106
        model = ElisaWell
        fields = ("plate", "location")


class SequencingRunResultSerializer(ModelSerializer):
    """A serializer for sequencing run results."""

    added_by = StringRelatedField()

    class Meta:  # noqa: D106
        model = SequencingRunResults
        fields = ("seq", "added_by", "added_date")


class SequencingRunSerializer(ModelSerializer):
    """A serializer for sequencing runs."""

    added_by = StringRelatedField()
    sequencingrunresults_set = SequencingRunResultSerializer(many=True, required=False)

    def validate_wells(self, data):
        """Check JSONField for wells is valid."""
        for idx, well in enumerate(data):
            if len(well.keys()) != 3:
                raise ValidationError(f"Extraneous keys in well {idx}")
            if "elisa_well" not in well:
                raise ValidationError(f"Missing elisa_well in well {idx}")

            if "plate" not in well:
                raise ValidationError(f"Missing plate in well {idx}")
            if not isinstance(well["plate"], int):
                raise ValidationError(f"Well {idx}'s plate is not an integer")
            if well["plate"] != (idx // 96):
                raise ValidationError(
                    f"Well {idx}'s plate should be "
                    f"{(idx // 96)} (found: {well['plate']})"
                )

            if "location" not in well:
                raise ValidationError(f"Missing location in well {idx}")
            if not isinstance(well["location"], int):
                raise ValidationError(f"Well {idx}'s location is not an integer")
            if well["location"] < 1 or well["location"] > 96:
                raise ValidationError(
                    f"Well {idx}'s location must be between 1 and 96 inclusive"
                )

            if not isinstance(well["elisa_well"], collections.abc.Mapping):
                raise ValidationError(f"elisa_well in well {idx} is not an object")
            if len(well["elisa_well"].keys()) != 2:
                raise ValidationError(f"Extraneous keys in well {idx}'s elisa_well")
            if "plate" not in well["elisa_well"]:
                raise ValidationError(f"Missing plate in well {idx}'s elisa_well")
            if not isinstance(well["elisa_well"]["plate"], int):
                raise ValidationError(
                    f"Well {idx}'s elisa_well's plate is not an integer"
                )
            if "location" not in well["elisa_well"]:
                raise ValidationError(f"Missing location in well {idx}'s elisa_well")
            if not isinstance(well["elisa_well"]["location"], int):
                raise ValidationError(
                    f"Well {idx}'s elisa_well's location is not an integer"
                )
            if (
                well["elisa_well"]["location"] < 1
                or well["elisa_well"]["location"] > 96
            ):
                raise ValidationError(
                    f"Well {idx}'s elisa_well's location must be "
                    "between 1 and 96 inclusive"
                )

            # TODO: Check elisa_plate is valid plate
            # TODO: Check all locations are unique on a plate

        # Sort by plate and location
        data = sorted(data, key=lambda well: (well["plate"], well["location"]))

        return data

    def validate_plate_thresholds(self, data):
        """Check JSONField for plate_thresholds is valid."""
        for idx, thr in enumerate(data):
            if len(thr.keys()) != 2:
                raise ValidationError(f"Extraneous keys in plate_threshold {idx}")
            if "optical_density_threshold" not in thr:
                raise ValidationError(
                    f"Optical density threshold missing in plate_threshold {idx}"
                )
            if not isinstance(thr["optical_density_threshold"], (int, float)):
                raise ValidationError(
                    f"Plate threshold {idx}'s optical_density_threshold "
                    "is not an integer or float"
                )
            if thr["optical_density_threshold"] < 0:
                raise ValidationError(
                    f"Plate threshold {idx}'s optical_density_threshold "
                    "must be at least 0"
                )
            if "elisa_plate" not in thr:
                raise ValidationError(f"Elisa plate missing in plate_threshold {idx}")
            if not isinstance(thr["elisa_plate"], int):
                raise ValidationError(
                    f"Plate threshold {idx}'s elisa_plate is not an integer"
                )

            # TODO: Check elisa_plate is valid plate
            # TODO: Check elisa_plate is unique within list
            # TODO: Check threshold is present for every plate listed in elisa_well

        return data

    class Meta:  # noqa: D106
        model = SequencingRun
        fields = "__all__"
        read_only_fields = ["added_by", "added_date"]


class SequencingRunViewSet(AuditLogMixin, DeleteProtectionMixin, ModelViewSet):
    """A view set for sequencing runs."""

    queryset = SequencingRun.objects.all()
    serializer_class = SequencingRunSerializer

    def perform_create(self, serializer):  # noqa: D102
        serializer.save(added_by=self.request.user)

    @action(
        detail=True,
        methods=["GET"],
        name="Download sequencing run submission file (xlsx).",
        url_path="submissionfile/(?P<submission_idx>[0-9]+)",
    )
    def download_submission_xlsx(self, request, pk, submission_idx):
        """Download sequencing run submission file (xlsx)."""
        # Load the Excel template
        fn = os.path.join(
            os.path.dirname(os.path.realpath(__file__)),
            "files",
            "sequencing-submission-form-v1.xlsx",
        )
        oxl = openpyxl.load_workbook(fn)

        # Get first worksheet
        ws = oxl.worksheets[0]

        # Get sequencing run object
        sr = self.get_object()
        well_dict = {}
        elisa_plates_to_load = set()
        submission_idx = int(submission_idx)
        for well in sr.wells:
            if well["plate"] != submission_idx:
                continue
            well_dict[PlateLocations.labels[well["location"] - 1]] = well["elisa_well"]
            elisa_plates_to_load.add(well["elisa_well"]["plate"])

        if not well_dict:
            raise Http404

        elisa_wells = {
            (ew.plate_id, ew.location): ew
            for ew in ElisaWell.objects.filter(plate__pk__in=elisa_plates_to_load)
            .select_related("plate")
            .select_related("antigen")
        }

        # Make modifications
        for row in range(3, 100):  # 96 wells
            try:
                # Sample name
                well = well_dict[ws[f"A{row}"].value]
            except KeyError:
                continue

            elisa_well = elisa_wells[(well["plate"], well["location"])]
            ws[f"B{row}"] = (
                f"{elisa_well.antigen.preferred_name}_"
                f"EP{elisa_well.plate_id}_"
                f"{PlateLocations.labels[elisa_well.location - 1]}"
            )
            # Own primer name
            ws[f"D{row}"] = "PRIMER"

        # Save to temp file
        with NamedTemporaryFile() as tmp:
            oxl.save(tmp.name)
            response = HttpResponse(
                FileWrapper(tmp),
                content_type="application/vnd.openxmlformats-officedocument"
                ".spreadsheetml.sheet",
            )

        response["Content-Disposition"] = (
            f'attachment; filename="sequencing-submission-form-'
            f'sr{pk}_{submission_idx}.xlsx"'
        )
        return response

    @action(
        detail=True,
        methods=["PUT"],
        name="Upload sequencing run results file (.zip).",
        url_path="resultsfile/(?P<submission_idx>[0-9]+)",
    )
    def upload_sequencing_run_results(self, request, pk, submission_idx):
        """Upload sequencing run results file (.zip)."""
        results_file = request.data["file"]

        # TODO: Validate results file in more detail
        if not results_file.name.endswith(".zip"):
            raise ValidationError("file", "Results file should be a .zip file")

        # TODO: Validate submission_idx

        # Run bioinformatics using .zip file
        # print("Extracting zip file...")
        seq_data = load_sequences(results_file.temporary_file_path())

        # Convert to FASTA in-memory (vquest api handles chunking to
        # max 50 seqs per file)
        fasta_file = as_fasta_files(seq_data, max_file_size=None)[0]

        # Submit to vquest
        # print("Running vquest...")
        vquest_results = run_vquest(fasta_file)

        parameters_file_data = vquest_results["Parameters.txt"]
        vquest_airr_data = vquest_results["vquest_airr.tsv"]

        base_filename = f"SequencingResults_{pk}_{submission_idx}"

        # Make sure directory exists
        base_dirs = set(
            [
                os.path.join(
                    settings.MEDIA_ROOT,
                    SequencingRunResults.parameters_file.field.upload_to,
                ),
                os.path.join(
                    settings.MEDIA_ROOT, SequencingRunResults.airr_file.field.upload_to
                ),
            ]
        )

        for base_dir in base_dirs:
            os.makedirs(base_dir, exist_ok=True)

        # Create SequencingRunResults object
        with open(
            os.path.join(
                settings.MEDIA_ROOT,
                SequencingRunResults.parameters_file.field.upload_to,
                f"{base_filename}_vquestparams.txt",
            ),
            "w+",
        ) as parameters_file, open(
            os.path.join(
                settings.MEDIA_ROOT,
                SequencingRunResults.airr_file.field.upload_to,
                f"{base_filename}_vquestairr.tsv",
            ),
            "w+",
        ) as airr_file:
            parameters_file.write(parameters_file_data)
            parameters_file_wrapped = File(parameters_file)
            airr_file.write(vquest_airr_data)
            airr_file_wrapped = File(airr_file)

            SequencingRunResults.objects.update_or_create(
                sequencing_run=SequencingRun.objects.get(pk=int(pk)),
                seq=submission_idx,
                defaults={
                    "added_by": request.user,
                    "seqres_file": results_file,
                    "parameters_file": parameters_file_wrapped,
                    "airr_file": airr_file_wrapped,
                },
            )

        return JsonResponse(
            SequencingRunSerializer(SequencingRun.objects.get(pk=int(pk))).data
        )

    @action(
        detail=True,
        methods=["GET"],
        name="Get sequencing results.",
        url_path="results",
    )
    def get_sequencing_run_results(self, request, pk):
        """Get sequencing results."""
        IMPORTANT_COLUMNS = (
            "sequence_id",
            "productive",
            "stop_codon",
            "fwr1_aa",
            "cdr1_aa",
            "fwr2_aa",
            "cdr2_aa",
            "fwr3_aa",
            "cdr3_aa",
        )

        results = SequencingRunResults.objects.filter(
            sequencing_run_id=int(pk)
        ).order_by("seq")

        if not results:
            return JsonResponse({"records": []})

        csvs = []
        for r in results:
            # Clean up the CSVs! They seem to have an extra tab in some cases.
            buffer = io.StringIO(
                "\n".join(
                    line.strip()
                    for line in r.airr_file.read().decode("utf8").split("\n")
                )
            )
            df = pd.read_csv(buffer, sep="\t", header=0, usecols=IMPORTANT_COLUMNS)
            csvs.append(df)
        df = pd.concat(csvs)

        # Get number of matches per CDR3 sequence
        cdr3_counts = df["cdr3_aa"].value_counts()
        cdr3_counts.name = "cdr3_aa_count"
        df = df.merge(cdr3_counts, on="cdr3_aa", how="left")

        # Sort as required - Productive, number of CDR3 matches,
        # then CDR3 itself, then sequence ID
        df = df.sort_values(
            by=["productive", "cdr3_aa_count", "cdr3_aa", "sequence_id"],
            ascending=[False, False, True, True],
        )

        # Ensure we have the right columns in the right order
        df = df.loc[:, IMPORTANT_COLUMNS]

        # Set index and replace NaN with None (null in JSON)
        df = df.replace({np.nan: None})

        # Indicator to show when cdr3 has changed from previous row
        df["new_cdr3"] = df["cdr3_aa"].shift(1).ne(df["cdr3_aa"])

        return JsonResponse({"records": df.to_dict(orient="records")})
