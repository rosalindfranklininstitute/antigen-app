from types import SimpleNamespace
from unittest.mock import MagicMock, call, patch

import pytest
from rest_framework import status
from rest_framework.serializers import ValidationError

from antigenapi.utils.viewsets import (
    create_possibly_multiple,
    perform_create_allow_creator_change_delete,
)
from antigenapi.views_old import SequencingRunSerializer, _wells_to_tsv


def _fake_viewset(serializer):
    return SimpleNamespace(
        get_serializer=MagicMock(return_value=serializer),
        perform_create=MagicMock(),
        get_success_headers=MagicMock(return_value={"X-Test": "1"}),
    )


def test_create_possibly_multiple_sets_many_for_list_payloads():
    serializer = MagicMock()
    serializer.data = [{"id": 1}]
    viewset = _fake_viewset(serializer)
    request = SimpleNamespace(data=[{"name": "one"}])

    response = create_possibly_multiple(viewset, request)

    viewset.get_serializer.assert_called_once_with(data=request.data, many=True)
    serializer.is_valid.assert_called_once_with(raise_exception=True)
    viewset.perform_create.assert_called_once_with(serializer)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data == serializer.data
    assert response.headers["X-Test"] == "1"


def test_create_possibly_multiple_sets_many_false_for_single_payload():
    serializer = MagicMock()
    serializer.data = {"id": 1}
    viewset = _fake_viewset(serializer)
    request = SimpleNamespace(data={"name": "one"})

    response = create_possibly_multiple(viewset, request)

    viewset.get_serializer.assert_called_once_with(data=request.data, many=False)
    serializer.is_valid.assert_called_once_with(raise_exception=True)
    viewset.perform_create.assert_called_once_with(serializer)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data == serializer.data


@patch("antigenapi.utils.viewsets.assign_perm")
def test_perform_create_assigns_change_and_delete_perms_for_single_instance(
    assign_perm_mock,
):
    instance = SimpleNamespace(_meta=SimpleNamespace(model_name="thing"))
    serializer = MagicMock()
    serializer.save.return_value = instance
    user = object()
    viewset = SimpleNamespace(request=SimpleNamespace(user=user))

    perform_create_allow_creator_change_delete(viewset, serializer)

    assert assign_perm_mock.call_args_list == [
        call("change_thing", user, instance),
        call("delete_thing", user, instance),
    ]


@patch("antigenapi.utils.viewsets.assign_perm")
def test_perform_create_assigns_change_and_delete_perms_for_multiple_instances(
    assign_perm_mock,
):
    a = SimpleNamespace(_meta=SimpleNamespace(model_name="alpha"))
    b = SimpleNamespace(_meta=SimpleNamespace(model_name="beta"))
    serializer = MagicMock()
    serializer.save.return_value = [a, b]
    user = object()
    viewset = SimpleNamespace(request=SimpleNamespace(user=user))

    perform_create_allow_creator_change_delete(viewset, serializer)

    assert assign_perm_mock.call_args_list == [
        call("change_alpha", user, a),
        call("delete_alpha", user, a),
        call("change_beta", user, b),
        call("delete_beta", user, b),
    ]


# ---------------------------------------------------------------------------
# SequencingRunSerializer.validate — layout-lock tests
# ---------------------------------------------------------------------------

_WELLS = [{"elisa_well": {"plate": 1, "location": 1}, "plate": 0, "location": 1}]
_THRESHOLDS = [{"elisa_plate": 1, "optical_density_threshold": 0.5}]


def _serializer_for_update(instance):
    """Return a SequencingRunSerializer wired up as if it is processing an update."""
    s = SequencingRunSerializer.__new__(SequencingRunSerializer)
    s.instance = instance
    return s


def _instance(*, has_results, wells=None, plate_thresholds=None, fill_horizontal=False):
    return SimpleNamespace(
        wells=wells if wells is not None else _WELLS,
        plate_thresholds=plate_thresholds
        if plate_thresholds is not None
        else _THRESHOLDS,
        fill_horizontal=fill_horizontal,
        sequencingrunresults_set=MagicMock(**{"exists.return_value": has_results}),
    )


def test_validate_allows_any_fields_on_create():
    """No instance means a create — layout lock does not apply."""
    s = SequencingRunSerializer.__new__(SequencingRunSerializer)
    s.instance = None
    data = {"wells": [], "plate_thresholds": [], "fill_horizontal": True}
    assert s.validate(data) == data


def test_validate_allows_layout_changes_when_no_results_attached():
    s = _serializer_for_update(_instance(has_results=False))
    data = {"wells": [], "plate_thresholds": [], "fill_horizontal": True}
    assert s.validate(data) == data


def test_validate_blocks_wells_change_when_results_exist():
    s = _serializer_for_update(_instance(has_results=True))
    with pytest.raises(ValidationError) as exc_info:
        s.validate({"wells": []})
    assert "wells" in str(exc_info.value.detail)


def test_validate_blocks_plate_thresholds_change_when_results_exist():
    s = _serializer_for_update(_instance(has_results=True))
    # Change the OD value but keep the same plate so the cross-field check passes;
    # the layout lock must still reject it.
    new_thresholds = [{"elisa_plate": 1, "optical_density_threshold": 0.9}]
    with pytest.raises(ValidationError) as exc_info:
        s.validate({"plate_thresholds": new_thresholds})
    assert "plate thresholds" in str(exc_info.value.detail)


def test_validate_blocks_fill_horizontal_change_when_results_exist():
    s = _serializer_for_update(_instance(has_results=True, fill_horizontal=False))
    with pytest.raises(ValidationError) as exc_info:
        s.validate({"fill_horizontal": True})
    assert "fill direction" in str(exc_info.value.detail)


def test_validate_error_names_all_changed_locked_fields():
    s = _serializer_for_update(_instance(has_results=True, fill_horizontal=False))
    data = {"wells": [], "plate_thresholds": [], "fill_horizontal": True}
    with pytest.raises(ValidationError) as exc_info:
        s.validate(data)
    detail = str(exc_info.value.detail)
    assert "wells" in detail
    assert "plate thresholds" in detail
    assert "fill direction" in detail


def test_validate_allows_notes_change_when_results_exist():
    """Non-layout fields like notes must stay editable after results are attached."""
    s = _serializer_for_update(_instance(has_results=True))
    data = {"notes": "updated note"}
    assert s.validate(data) == data


def test_validate_allows_sent_date_change_when_results_exist():
    """sent_date is not part of the well-layout and must remain editable."""
    import datetime

    s = _serializer_for_update(_instance(has_results=True))
    data = {"sent_date": datetime.date(2025, 1, 1)}
    assert s.validate(data) == data


def test_validate_does_not_block_patch_omitting_layout_fields():
    """A PATCH that does not include locked fields must pass even if results exist."""
    s = _serializer_for_update(_instance(has_results=True))
    assert s.validate({}) == {}


def test_validate_does_not_block_submitting_identical_layout():
    """Re-submitting unchanged layout fields must not be treated as a modification."""
    s = _serializer_for_update(_instance(has_results=True))
    data = {
        "wells": _WELLS,
        "plate_thresholds": _THRESHOLDS,
        "fill_horizontal": False,
    }
    assert s.validate(data) == data


# ---------------------------------------------------------------------------
# validate_plate_thresholds — new checks: uniqueness and existence
# ---------------------------------------------------------------------------


def _threshold_serializer():
    s = SequencingRunSerializer.__new__(SequencingRunSerializer)
    return s


def test_validate_plate_thresholds_rejects_duplicate_elisa_plate():
    s = _threshold_serializer()
    data = [
        {"elisa_plate": 1, "optical_density_threshold": 0.5},
        {"elisa_plate": 1, "optical_density_threshold": 0.3},
    ]
    with pytest.raises(ValidationError) as exc_info:
        s.validate_plate_thresholds(data)
    assert "Duplicate" in str(exc_info.value.detail)
    assert "1" in str(exc_info.value.detail)


@patch("antigenapi.views_old.ElisaPlate.objects")
def test_validate_plate_thresholds_rejects_nonexistent_plate(mock_objects):
    mock_objects.filter.return_value.values_list.return_value = []  # nothing found
    s = _threshold_serializer()
    with pytest.raises(ValidationError) as exc_info:
        s.validate_plate_thresholds(
            [{"elisa_plate": 999, "optical_density_threshold": 0.5}]
        )
    assert "999" in str(exc_info.value.detail)


@patch("antigenapi.views_old.ElisaPlate.objects")
def test_validate_plate_thresholds_rejects_partial_missing_plates(mock_objects):
    """Only some of the referenced plates are missing."""
    mock_objects.filter.return_value.values_list.return_value = [1]  # plate 2 missing
    s = _threshold_serializer()
    data = [
        {"elisa_plate": 1, "optical_density_threshold": 0.5},
        {"elisa_plate": 2, "optical_density_threshold": 0.3},
    ]
    with pytest.raises(ValidationError) as exc_info:
        s.validate_plate_thresholds(data)
    assert "2" in str(exc_info.value.detail)
    assert "1" not in str(exc_info.value.detail)


@patch("antigenapi.views_old.ElisaPlate.objects")
def test_validate_plate_thresholds_accepts_valid_unique_plates(mock_objects):
    mock_objects.filter.return_value.values_list.return_value = [1, 2]
    s = _threshold_serializer()
    data = [
        {"elisa_plate": 1, "optical_density_threshold": 0.5},
        {"elisa_plate": 2, "optical_density_threshold": 0.3},
    ]
    assert s.validate_plate_thresholds(data) == data


def test_validate_plate_thresholds_skips_db_query_for_empty_list():
    """Empty threshold list must not hit the database."""
    s = _threshold_serializer()
    assert s.validate_plate_thresholds([]) == []


# ---------------------------------------------------------------------------
# validate() — cross-field: wells must reference only plates with a threshold
# ---------------------------------------------------------------------------


def _well(elisa_plate_id, location=1):
    return {
        "elisa_well": {"plate": elisa_plate_id, "location": location},
        "plate": 0,
        "location": location,
    }


def test_validate_rejects_well_referencing_plate_with_no_threshold():
    s = SequencingRunSerializer.__new__(SequencingRunSerializer)
    s.instance = None
    data = {
        "wells": [_well(2)],
        "plate_thresholds": [{"elisa_plate": 1, "optical_density_threshold": 0.5}],
    }
    with pytest.raises(ValidationError) as exc_info:
        s.validate(data)
    assert "2" in str(exc_info.value.detail)


def test_validate_accepts_wells_whose_plates_all_have_thresholds():
    s = SequencingRunSerializer.__new__(SequencingRunSerializer)
    s.instance = None
    data = {
        "wells": [_well(1), _well(2, location=2)],
        "plate_thresholds": [
            {"elisa_plate": 1, "optical_density_threshold": 0.5},
            {"elisa_plate": 2, "optical_density_threshold": 0.3},
        ],
    }
    assert s.validate(data) == data


def test_validate_cross_field_uses_instance_thresholds_on_patch_wells_only():
    """PATCH sending only wells: check new wells against the existing thresholds."""
    instance = _instance(
        has_results=False,
        wells=_WELLS,
        plate_thresholds=[{"elisa_plate": 1, "optical_density_threshold": 0.5}],
    )
    s = _serializer_for_update(instance)
    # New well references plate 99, which has no threshold on the instance.
    with pytest.raises(ValidationError) as exc_info:
        s.validate({"wells": [_well(99)]})
    assert "99" in str(exc_info.value.detail)


def test_validate_cross_field_uses_instance_wells_on_patch_thresholds_only():
    """PATCH with only plate_thresholds: existing wells are checked for coverage."""
    instance = _instance(
        has_results=False,
        wells=[_well(1)],
        plate_thresholds=_THRESHOLDS,
    )
    s = _serializer_for_update(instance)
    # New thresholds no longer cover plate 1, which is referenced by the existing wells.
    with pytest.raises(ValidationError) as exc_info:
        s.validate(
            {"plate_thresholds": [{"elisa_plate": 2, "optical_density_threshold": 0.5}]}
        )
    assert "1" in str(exc_info.value.detail)


# ---------------------------------------------------------------------------
# validate_wells — field-level validation of the wells JSON array
# ---------------------------------------------------------------------------


def _valid_well(plate=0, location=1, elisa_plate=1, elisa_location=1):
    return {
        "elisa_well": {"plate": elisa_plate, "location": elisa_location},
        "plate": plate,
        "location": location,
    }


def test_validate_wells_accepts_valid_wells_and_sorts_by_plate_then_location():
    s = _threshold_serializer()
    data = [
        _valid_well(plate=0, location=5),
        _valid_well(plate=0, location=2),
    ]
    result = s.validate_wells(data)
    assert result[0]["location"] == 2
    assert result[1]["location"] == 5


def test_validate_wells_rejects_well_with_extra_keys():
    s = _threshold_serializer()
    well = _valid_well()
    well["extra"] = "unexpected"
    with pytest.raises(ValidationError):
        s.validate_wells([well])


def test_validate_wells_rejects_missing_elisa_well_key():
    s = _threshold_serializer()
    with pytest.raises(ValidationError):
        s.validate_wells([{"plate": 0, "location": 1, "other": "x"}])


def test_validate_wells_rejects_wrong_plate_index():
    """Well at list index 0 must declare plate=0 (index // 96)."""
    s = _threshold_serializer()
    with pytest.raises(ValidationError):
        s.validate_wells([_valid_well(plate=1)])  # plate should be 0 for idx 0


def test_validate_wells_rejects_location_below_one():
    s = _threshold_serializer()
    with pytest.raises(ValidationError):
        s.validate_wells([_valid_well(location=0)])


def test_validate_wells_rejects_location_above_96():
    s = _threshold_serializer()
    with pytest.raises(ValidationError):
        s.validate_wells([_valid_well(location=97)])


def test_validate_wells_rejects_non_mapping_elisa_well():
    s = _threshold_serializer()
    with pytest.raises(ValidationError):
        s.validate_wells([{"elisa_well": "flat-string", "plate": 0, "location": 1}])


def test_validate_wells_rejects_elisa_location_out_of_range():
    s = _threshold_serializer()
    with pytest.raises(ValidationError):
        s.validate_wells([_valid_well(elisa_location=0)])


# ---------------------------------------------------------------------------
# _wells_to_tsv — plate grid formatter
# ---------------------------------------------------------------------------


def test_wells_to_tsv_formats_plate_grid():
    wells = list(range(96))
    output = _wells_to_tsv(wells)
    lines = output.split("\n")
    # Header: blank cell followed by column numbers 1-12
    assert lines[0] == "\t" + "\t".join(str(i) for i in range(1, 13))
    # Row A: label + values 0-11
    assert lines[1] == "A\t" + "\t".join(str(i) for i in range(12))
    # Row H: label + values 84-95
    assert lines[8] == "H\t" + "\t".join(str(i) for i in range(84, 96))


def test_wells_to_tsv_renders_none_as_empty_cell():
    wells = [None] * 96
    output = _wells_to_tsv(wells)
    row_a = output.split("\n")[1]
    # Row label "A" followed by 12 tab-separated empty cells
    assert row_a == "A" + "\t" * 12
