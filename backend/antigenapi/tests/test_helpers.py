from types import SimpleNamespace
from unittest.mock import patch

from antigenapi.utils.helpers import (
    build_nanobody_sample_name,
    compute_plate_disambiguation_suffixes,
)


def _elisa_well(
    antigen_short_name="AG1",
    pan_round_concentration=10.0,
    location=1,  # "A1"
    plate_id=1,
    cohort_num=5,
    is_naive=False,
    sublibrary=None,
):
    cohort = SimpleNamespace(cohort_num=cohort_num, is_naive=is_naive)
    library = SimpleNamespace(cohort=cohort, sublibrary=sublibrary)
    plate = SimpleNamespace(
        pk=plate_id, pan_round_concentration=pan_round_concentration, library=library
    )
    return SimpleNamespace(
        antigen=SimpleNamespace(short_name=antigen_short_name),
        plate=plate,
        plate_id=plate_id,
        location=location,
    )


# ---------------------------------------------------------------------------
# build_nanobody_sample_name
# ---------------------------------------------------------------------------


def test_build_nanobody_sample_name_basic():
    ew = _elisa_well(cohort_num=5)
    assert build_nanobody_sample_name(ew) == "AG1_10A1_C5"


def test_build_nanobody_sample_name_naive_cohort_gets_n_prefix():
    ew = _elisa_well(cohort_num=5, is_naive=True)
    assert build_nanobody_sample_name(ew) == "AG1_10A1_CN5"


def test_build_nanobody_sample_name_includes_sublibrary_suffix():
    ew = _elisa_well(cohort_num=5, sublibrary="SL_1")
    assert build_nanobody_sample_name(ew) == "AG1_10A1_C5SL_1"


def test_build_nanobody_sample_name_applies_plate_disambiguation_suffix():
    ew = _elisa_well(cohort_num=5)
    assert build_nanobody_sample_name(ew, plate_suffix=".2") == "AG1_10A1.2_C5"


def test_build_nanobody_sample_name_can_exclude_library_suffix():
    """Format used by the (buggy) submission-file generator before the fix."""
    ew = _elisa_well(cohort_num=5)
    assert build_nanobody_sample_name(ew, include_library=False) == "AG1_10A1"


# ---------------------------------------------------------------------------
# compute_plate_disambiguation_suffixes
# ---------------------------------------------------------------------------


@patch("antigenapi.utils.helpers.ElisaWell.objects")
def test_no_suffix_when_plates_have_different_antigen_or_round(mock_objects):
    wells = [
        _elisa_well(antigen_short_name="AG1", pan_round_concentration=10, plate_id=1),
        _elisa_well(antigen_short_name="AG1", pan_round_concentration=20, plate_id=2),
    ]
    mock_objects.filter.return_value.select_related.return_value = wells
    sequencing_run = SimpleNamespace(
        wells=[
            {"elisa_well": {"plate": 1, "location": 1}, "plate": 0, "location": 1},
            {"elisa_well": {"plate": 2, "location": 1}, "plate": 0, "location": 2},
        ]
    )

    assert compute_plate_disambiguation_suffixes(sequencing_run) == {1: "", 2: ""}


@patch("antigenapi.utils.helpers.ElisaWell.objects")
def test_suffix_added_when_plates_share_antigen_and_round(mock_objects):
    """Two plates for one library at the same pan round."""
    wells = [
        _elisa_well(antigen_short_name="AG1", pan_round_concentration=10, plate_id=5),
        _elisa_well(antigen_short_name="AG1", pan_round_concentration=10, plate_id=7),
    ]
    mock_objects.filter.return_value.select_related.return_value = wells
    sequencing_run = SimpleNamespace(
        wells=[
            {"elisa_well": {"plate": 5, "location": 1}, "plate": 0, "location": 1},
            {"elisa_well": {"plate": 7, "location": 1}, "plate": 0, "location": 6},
        ]
    )

    assert compute_plate_disambiguation_suffixes(sequencing_run) == {5: ".1", 7: ".2"}


@patch("antigenapi.utils.helpers.ElisaWell.objects")
def test_suffix_order_follows_plate_pk_not_well_layout_position(mock_objects):
    """Suffix assignment must be independent of well layout: plate 7's well
    appears first in the run, but plate 5 (lower PK) should still get .1."""
    wells = [
        _elisa_well(antigen_short_name="AG1", pan_round_concentration=10, plate_id=5),
        _elisa_well(antigen_short_name="AG1", pan_round_concentration=10, plate_id=7),
    ]
    mock_objects.filter.return_value.select_related.return_value = wells
    sequencing_run = SimpleNamespace(
        wells=[
            {"elisa_well": {"plate": 7, "location": 1}, "plate": 0, "location": 1},
            {"elisa_well": {"plate": 5, "location": 1}, "plate": 0, "location": 6},
        ]
    )

    assert compute_plate_disambiguation_suffixes(sequencing_run) == {5: ".1", 7: ".2"}


@patch("antigenapi.utils.helpers.ElisaWell.objects")
def test_only_colliding_plates_get_suffixed(mock_objects):
    """Plates 3 and 4 don't collide with anything and must stay unsuffixed,
    even though plates 1 and 2 (also referenced by this run) do collide."""
    wells = [
        _elisa_well(antigen_short_name="AG1", pan_round_concentration=10, plate_id=1),
        _elisa_well(antigen_short_name="AG1", pan_round_concentration=10, plate_id=2),
        _elisa_well(antigen_short_name="AG2", pan_round_concentration=20, plate_id=3),
        _elisa_well(antigen_short_name="AG3", pan_round_concentration=30, plate_id=4),
    ]
    mock_objects.filter.return_value.select_related.return_value = wells
    sequencing_run = SimpleNamespace(
        wells=[
            {"elisa_well": {"plate": 1, "location": 1}, "plate": 0, "location": 1},
            {"elisa_well": {"plate": 2, "location": 1}, "plate": 0, "location": 2},
            {"elisa_well": {"plate": 3, "location": 1}, "plate": 0, "location": 3},
            {"elisa_well": {"plate": 4, "location": 1}, "plate": 0, "location": 4},
        ]
    )

    assert compute_plate_disambiguation_suffixes(sequencing_run) == {
        1: ".1",
        2: ".2",
        3: "",
        4: "",
    }


@patch("antigenapi.utils.helpers.ElisaWell.objects")
def test_wells_not_referenced_by_the_run_do_not_cause_false_collisions(mock_objects):
    """An unsequenced well on a plate (not in sequencing_run.wells) must not
    cause a collision with another plate's genuinely-referenced well."""
    wells = [
        # Plate 1's AG1 well was never included in this sequencing run.
        _elisa_well(
            antigen_short_name="AG1", pan_round_concentration=10, plate_id=1, location=1
        ),
        # Plate 1's AG2 well IS in this run.
        _elisa_well(
            antigen_short_name="AG2", pan_round_concentration=10, plate_id=1, location=2
        ),
        # Plate 2's AG1 well IS in this run - it only shares antigen/round with
        # plate 1's *unreferenced* AG1 well, not with anything actually sequenced.
        _elisa_well(
            antigen_short_name="AG1", pan_round_concentration=10, plate_id=2, location=1
        ),
    ]
    mock_objects.filter.return_value.select_related.return_value = wells
    sequencing_run = SimpleNamespace(
        wells=[
            {"elisa_well": {"plate": 1, "location": 2}, "plate": 0, "location": 1},
            {"elisa_well": {"plate": 2, "location": 1}, "plate": 0, "location": 2},
        ]
    )

    assert compute_plate_disambiguation_suffixes(sequencing_run) == {1: "", 2: ""}


@patch("antigenapi.utils.helpers.ElisaWell.objects")
def test_suffix_only_computed_for_plates_referenced_by_the_run(mock_objects):
    """Plates not referenced by sequencing_run.wells must not affect/appear
    in the result, even if they'd otherwise collide."""
    wells = [
        _elisa_well(antigen_short_name="AG1", pan_round_concentration=10, plate_id=1),
    ]
    mock_objects.filter.return_value.select_related.return_value = wells
    sequencing_run = SimpleNamespace(
        wells=[{"elisa_well": {"plate": 1, "location": 1}, "plate": 0, "location": 1}]
    )

    assert compute_plate_disambiguation_suffixes(sequencing_run) == {1: ""}
