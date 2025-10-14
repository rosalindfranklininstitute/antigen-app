import re
from collections.abc import Iterable

import pandas as pd

from antigenapi.bioinformatics.imgt import read_airr_file
from antigenapi.models import ElisaWell, PlateLocations, SequencingRunResults


def extract_well(well: str):
    """Extract/canonicalise a well name.

    Args:
        well (str): Well name, e.g. A01

    Raises:
        ValueError: If well name cannot be parsed.

    Returns:
        str: canoncial well name with no zero-padding
    """
    well = well.upper()

    # Match A1-H12, including A01 etc.
    well_match = re.search("[A-H]((1[0-2])|(0?[1-9]))$", well)

    if well_match is None:
        raise ValueError("Unable to extract well name from filename")

    well_match_grp = well_match.group(0)

    # Remove zero-padding if present
    if well_match_grp[1] == "0":
        well_match_grp = well_match_grp[0] + well_match_grp[2]
    return well_match_grp


def read_seqrun_results(pk: int, usecols: Iterable[str]):
    """Read sequencing run results and add nb autonames.

    Args:
        pk (int): Sequencing run PK
        usecols (Iterable[str]): List of columns to read from AIRR files

    Returns:
        pd.DataFrame: Contents of AIRR files (IMGT)
    """
    results = (
        SequencingRunResults.objects.filter(sequencing_run_id=int(pk))
        .order_by("seq")
        .select_related("sequencing_run")
        .prefetch_related("nanobodies")
    )

    if not results:
        return pd.DataFrame()

    # Nanobody autoname format is:
    # <short antigen name>_<pan conc><ELISA well_no>
    # [.<ELISA plate number (index) if >1 plate]_C<cohort><sublibrary>

    # Get ELISA wells as dict for lookup
    elisa_wells_to_seq = {
        (w["elisa_well"]["plate"], w["elisa_well"]["location"]): (
            w["plate"],
            w["location"],
        )
        for r in results
        for w in r.sequencing_run.wells
    }
    # Get the ELISA plate IDs seen across this resultset -
    # put in dict for an ordered set
    elisa_plate_idxs = dict.fromkeys((w[0] for w in elisa_wells_to_seq.keys()), "")

    # For each (short_antigen_name, pan_conc) combination, check on which plate(s)
    # it occurs to determine if we need a suffix to disambiguate
    elisa_well_query = ElisaWell.objects.filter(
        plate__in=elisa_plate_idxs.keys()
    ).select_related("antigen", "plate", "plate__library", "plate__library__cohort")

    plate_disambig_check: dict[tuple[str, float], set[int]] = {}
    for ew in elisa_well_query:
        plate_disambig_check.setdefault(
            (ew.antigen.short_name, ew.plate.pan_round_concentration), set()
        ).add(ew.plate_id)

    if any(len(plate_ids) > 1 for plate_ids in plate_disambig_check.values()):
        # Ambiguous plate ID if antigen_short_name and pan_round_concentration
        # doesn't disambiguate - in that case, we need a suffix.
        # We include a .(1-based index) suffix to disambiguate.
        elisa_plate_idxs = {
            id: f".{idx + 1}" for idx, id in enumerate(elisa_plate_idxs.keys())
        }

    # Retrieve nanobody autonames associated with ELISA plates in this result set
    nanobody_autonames_lookup = {
        elisa_wells_to_seq[(ew.plate_id, ew.location)]: f"{ew.antigen.short_name}_"
        f"{ew.plate.pan_round_concentration:g}"
        f"{PlateLocations.labels[ew.location - 1]}{elisa_plate_idxs[ew.plate_id]}_C"
        + ("N" if ew.plate.library.cohort.is_naive else "")
        + f"{ew.plate.library.cohort.cohort_num}"
        + f"{ew.plate.library.sublibrary or ''}"
        for ew in elisa_well_query
        if (ew.plate_id, ew.location) in elisa_wells_to_seq.keys()
    }

    csvs = []
    for r in results:
        airr_file = read_airr_file(r.airr_file, usecols=usecols)
        csvs.append(airr_file)

        seq_plate_well_names = [
            wn[1] for wn in airr_file["sequence_id"].str.rsplit("_", n=1).to_list()
        ]
        nanobody_autonames = []
        for wn in seq_plate_well_names:
            try:
                nanobody_autonames.append(
                    nanobody_autonames_lookup[
                        (
                            r.seq,
                            PlateLocations.labels.index(extract_well(wn))
                            + 1
                            - r.well_pos_offset,
                        )
                    ]
                )
            except ValueError:
                nanobody_autonames.append("n/a (well unparseable)")
            except KeyError:
                nanobody_autonames.append("n/a (index not found)")
        airr_file["nanobody_autoname"] = nanobody_autonames
        airr_file["sequencing_run"] = pk

    return pd.concat(csvs)
