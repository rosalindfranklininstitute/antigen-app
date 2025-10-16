import csv

from django.http import HttpResponse
from rest_framework.views import APIView

from antigenapi.bioinformatics.imgt import read_airr_file
from antigenapi.models import PlateLocations, Project, SequencingRun
from antigenapi.utils.helpers import extract_well


def _extract_well_or_none(well):
    try:
        return extract_well(well)
    except ValueError:
        return None


class ProjectReport(APIView):
    def get(self, request, format=None):
        """Get CSV report on projects."""
        # Create the HttpResponse object with the appropriate CSV header.
        csv_filename = "antigenapp-project-report.csv"
        response = HttpResponse(
            content_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{csv_filename}"'},
        )

        writer = csv.writer(response)
        writer.writerow(
            [
                "Project",
                "# Libraries",
                "Llama(s)",
                "Cohort antigen(s)",
                "# ELISAs",
                "ELISA IDs",
                "# Wells sent for sequencing",
                "# Sequencing runs",
                "Sequencing run IDs",
                "# Productive hits",
                "# Of which unique sequences",
            ]
        )

        # Sequencing run wells
        seq_runs = SequencingRun.objects.all().prefetch_related(
            "sequencingrunresults_set"
        )

        for project in Project.objects.order_by("short_title").prefetch_related(
            "library_set",
            "library_set__cohort",
            "library_set__cohort__llama",
            "library_set__cohort__antigens",
            "library_set__elisaplate_set",
        ):

            llama_names = "; ".join(
                sorted(
                    list(
                        set(
                            [lib.cohort.llama.name for lib in project.library_set.all()]
                        )
                    )
                )
            )
            cohort_antigens = "; ".join(
                sorted(
                    list(
                        set(
                            [
                                a.short_name
                                for lib in project.library_set.all()
                                for a in lib.cohort.antigens.all()
                            ]
                        )
                    )
                )
            )
            elisa_ids = sorted(
                [
                    ep.id
                    for lib in project.library_set.all()
                    for ep in lib.elisaplate_set.all()
                ]
            )

            # Filter relevant sequencing runs for this project
            seq_runs_proj = list(
                set(
                    [
                        sr
                        for sr in seq_runs
                        for ep in sr.plate_thresholds
                        if ep["elisa_plate"] in elisa_ids
                    ]
                )
            )
            seq_runs_proj = sorted(seq_runs_proj, key=lambda sr: sr.id)
            wells_sequenced = [
                w
                for sr in seq_runs_proj
                for w in sr.wells
                if w["elisa_well"]["plate"] in elisa_ids
            ]

            productive_hits = []

            for sr in seq_runs_proj:
                for srr in sr.sequencingrunresults_set.order_by("seq"):
                    wells_sequenced_plate = set(
                        PlateLocations.labels[w["location"] - 1]
                        for w in wells_sequenced
                        if w["plate"] == srr.seq
                    )
                    airr_file = read_airr_file(srr.airr_file)
                    airr_file["well"] = [
                        _extract_well_or_none(w[1])
                        for w in airr_file["sequence_id"].str.rsplit("_", n=1).to_list()
                    ]

                    # Filter for wells included in this project
                    airr_file = airr_file[
                        airr_file["well"].notna().isin(wells_sequenced_plate)
                    ]

                    # Filter for productive wells
                    airr_file = airr_file[airr_file["productive"] == "T"]
                    productive_hits.extend(airr_file["sequence_alignment_aa"])

            writer.writerow(
                [
                    project.short_title,
                    project.library_set.count(),
                    llama_names,
                    cohort_antigens,
                    len(elisa_ids),
                    "; ".join([str(ep_id) for ep_id in elisa_ids]),
                    len(wells_sequenced),
                    len(seq_runs_proj),
                    "; ".join([str(sr.id) for sr in seq_runs_proj]),
                    len(productive_hits),
                    len(set(productive_hits)),
                ]
            )

        return response
