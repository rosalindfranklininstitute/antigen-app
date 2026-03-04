from datetime import UTC, datetime, timedelta

import pytest

from antigenapi.utils.dates import time_ago

# --- sub-minute outputs ---


def test_time_ago_returns_just_now_for_under_ten_seconds():
    assert time_ago(datetime.now(tz=UTC) - timedelta(seconds=5)) == "just now"


def test_time_ago_returns_seconds_count_for_ten_to_fifty_nine_seconds():
    assert time_ago(datetime.now(tz=UTC) - timedelta(seconds=42)) == "42 seconds ago"


# --- minute outputs ---


def test_time_ago_returns_a_minute_ago_for_sixty_to_119_seconds():
    assert time_ago(datetime.now(tz=UTC) - timedelta(seconds=90)) == "a minute ago"


def test_time_ago_returns_minute_count_for_two_to_59_minutes():
    assert time_ago(datetime.now(tz=UTC) - timedelta(minutes=30)) == "30 minutes ago"


# --- hour outputs ---


def test_time_ago_returns_an_hour_ago_for_one_to_two_hours():
    assert (
        time_ago(datetime.now(tz=UTC) - timedelta(hours=1, minutes=10)) == "an hour ago"
    )


def test_time_ago_returns_hour_count_for_two_to_23_hours():
    assert time_ago(datetime.now(tz=UTC) - timedelta(hours=3)) == "3 hours ago"


# --- day/week/month/year outputs ---


def test_time_ago_returns_yesterday_for_exactly_one_day_ago():
    assert time_ago(datetime.now(tz=UTC) - timedelta(days=1)) == "Yesterday"


def test_time_ago_returns_day_count_for_two_to_six_days_ago():
    assert time_ago(datetime.now(tz=UTC) - timedelta(days=3)) == "3 days ago"


def test_time_ago_returns_week_count_for_seven_to_thirty_days_ago():
    assert time_ago(datetime.now(tz=UTC) - timedelta(days=7)) == "1 week ago"
    assert time_ago(datetime.now(tz=UTC) - timedelta(days=15)) == "2 weeks ago"


def test_time_ago_returns_month_count_for_one_to_eleven_months_ago():
    assert time_ago(datetime.now(tz=UTC) - timedelta(days=60)) == "2 months ago"


def test_time_ago_returns_year_count_for_over_a_year_ago():
    assert time_ago(datetime.now(tz=UTC) - timedelta(days=400)) == "1.1 years ago"


# --- special inputs ---


def test_time_ago_treats_none_as_just_now():
    """None is treated as 'no timestamp available' and displays as just now."""
    assert time_ago(None) == "just now"


def test_time_ago_returns_empty_string_for_future_dates():
    """A future timestamp (e.g. a record with a clock-skew date) returns blank."""
    assert time_ago(datetime.now(tz=UTC) + timedelta(days=1)) == ""


def test_time_ago_raises_for_invalid_type():
    with pytest.raises(ValueError):
        time_ago("invalid")
