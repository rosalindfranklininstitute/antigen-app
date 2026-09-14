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


def compute_plate_disambiguation_suffixes(sequencing_run) -> dict[int, str]:
    """Compute a sample-name disambiguation suffix for each ELISA plate.

    Sample names are built from an ELISA well's antigen and pan round
    concentration. This collides if a sequencing run pulls wells from two
    or more ELISA plates that share the same (antigen, pan_round_concentration)
    - e.g. when a library has been split across multiple plates. In that
    case, only the colliding plates get a ".<n>" suffix (1-based, ordered by
    plate PK) so sample names stay unique; plates with no collision are left
    unsuffixed.

    Args:
        sequencing_run (SequencingRun): Sequencing run to compute suffixes for.

    Returns:
        dict[int, str]: Mapping of ELISA plate PK to disambiguation suffix
            (empty string if no disambiguation is needed).
    """
    referenced_wells = {
        (w["elisa_well"]["plate"], w["elisa_well"]["location"])
        for w in sequencing_run.wells
    }
    elisa_plate_ids = sorted({plate_id for plate_id, _ in referenced_wells})

    plate_disambig_check: dict[tuple[str, float], set[int]] = {}
    for ew in ElisaWell.objects.filter(plate__in=elisa_plate_ids).select_related(
        "antigen", "plate"
    ):
        if (ew.plate_id, ew.location) not in referenced_wells:
            continue
        plate_disambig_check.setdefault(
            (ew.antigen.short_name, ew.plate.pan_round_concentration), set()
        ).add(ew.plate_id)

    colliding_plate_ids = {
        pid
        for plate_ids in plate_disambig_check.values()
        if len(plate_ids) > 1
        for pid in plate_ids
    }
    suffix_by_pid = {
        pid: f".{idx + 1}"
        for idx, pid in enumerate(
            pid for pid in elisa_plate_ids if pid in colliding_plate_ids
        )
    }
    return {pid: suffix_by_pid.get(pid, "") for pid in elisa_plate_ids}


def build_nanobody_sample_name(
    elisa_well: ElisaWell, plate_suffix: str = "", include_library: bool = True
) -> str:
    """Build the autoname/sample name for a nanobody derived from an ELISA well.

    Format: <antigen short_name>_<pan round concentration><well>
    [.<plate disambiguation suffix>][_C<cohort num><sublibrary>]

    Args:
        elisa_well (ElisaWell): ELISA well the nanobody was picked from. Must
            have antigen, plate, plate.library and plate.library.cohort
            already fetched/selected (e.g. via select_related) if
            include_library is True.
        plate_suffix (str): Plate disambiguation suffix, e.g. from
            compute_plate_disambiguation_suffixes. Defaults to "".
        include_library (bool): Whether to append the library/cohort suffix.
            Defaults to True.

    Returns:
        str: Generated sample name.
    """
    name = (
        f"{elisa_well.antigen.short_name}_"
        f"{elisa_well.plate.pan_round_concentration:g}"
        f"{PlateLocations.labels[elisa_well.location - 1]}"
        f"{plate_suffix}"
    )
    if include_library:
        cohort = elisa_well.plate.library.cohort
        name += (
            "_C"
            + ("N" if cohort.is_naive else "")
            + f"{cohort.cohort_num}"
            + f"{elisa_well.plate.library.sublibrary or ''}"
        )
    return name


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

    # Get ELISA wells as dict for lookup
    elisa_wells_to_seq = {
        (w["elisa_well"]["plate"], w["elisa_well"]["location"]): (
            w["plate"],
            w["location"],
        )
        for r in results
        for w in r.sequencing_run.wells
    }

    # For each (short_antigen_name, pan_conc) combination, check on which plate(s)
    # it occurs to determine if we need a suffix to disambiguate
    plate_disambig_suffixes = compute_plate_disambiguation_suffixes(
        results[0].sequencing_run
    )

    elisa_well_query = ElisaWell.objects.filter(
        plate__in=plate_disambig_suffixes.keys()
    ).select_related("antigen", "plate", "plate__library", "plate__library__cohort")

    # Retrieve nanobody autonames associated with ELISA plates in this result set
    nanobody_autonames_lookup = {
        elisa_wells_to_seq[(ew.plate_id, ew.location)]: build_nanobody_sample_name(
            ew, plate_disambig_suffixes[ew.plate_id]
        )
        for ew in elisa_well_query
        if (ew.plate_id, ew.location) in elisa_wells_to_seq.keys()
    }

    if "elisa_plate_id" in usecols or "elisa_optical_density" in usecols:
        elisa_lookup = {
            elisa_wells_to_seq[(ew.plate_id, ew.location)]: (
                ew.plate_id,
                ew.optical_density,
            )
            for ew in elisa_well_query
            if (ew.plate_id, ew.location) in elisa_wells_to_seq.keys()
        }

    csvs = []
    for r in results:
        airr_file = read_airr_file(
            r.airr_file,
            usecols=set(usecols) - set(["elisa_plate_id", "elisa_optical_density"]),
        )
        csvs.append(airr_file)

        seq_plate_well_names = [
            wn[1] for wn in airr_file["sequence_id"].str.rsplit("_", n=1).to_list()
        ]
        nanobody_autonames = []
        if "elisa_plate_id" in usecols:
            elisa_plate_ids = []
        if "elisa_optical_density" in usecols:
            elisa_optical_density = []
        for wn in seq_plate_well_names:
            try:
                well_lookup = (
                    PlateLocations.labels.index(extract_well(wn))
                    + 1
                    - r.well_pos_offset
                )
                nanobody_autonames.append(
                    nanobody_autonames_lookup[(r.seq, well_lookup)]
                )
            except ValueError:
                nanobody_autonames.append("n/a (well unparseable)")
                if "elisa_plate_id" in usecols:
                    elisa_plate_ids.append("n/a (well unparseable)")
                if "elisa_optical_density" in usecols:
                    elisa_optical_density.append("n/a (well unparseable)")
            except KeyError:
                nanobody_autonames.append("n/a (index not found)")
                if "elisa_plate_id" in usecols:
                    elisa_plate_ids.append("n/a (index not found)")
                if "elisa_optical_density" in usecols:
                    elisa_optical_density.append("n/a (well unparseable)")
            else:
                if "elisa_plate_id" in usecols:
                    try:
                        elisa_plate_ids.append(elisa_lookup[r.seq, well_lookup][0])
                    except KeyError:
                        elisa_plate_ids.append("n/a (index not found)")
                if "elisa_optical_density" in usecols:
                    try:
                        elisa_optical_density.append(
                            elisa_lookup[r.seq, well_lookup][1]
                        )
                    except KeyError:
                        elisa_optical_density.append("n/a (index not found)")

        airr_file["nanobody_autoname"] = nanobody_autonames
        airr_file["sequencing_run"] = pk

        if "elisa_plate_id" in usecols:
            airr_file["elisa_plate_id"] = elisa_plate_ids
        if "elisa_optical_density" in usecols:
            airr_file["elisa_optical_density"] = elisa_optical_density

    return pd.concat(csvs)
