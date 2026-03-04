from types import SimpleNamespace
from unittest.mock import MagicMock

from antigendjango.auth import RFIRemoteUserBackend


def _user(email: str):
    user = MagicMock()
    user.email = email
    return user


def test_configure_user_without_request_returns_user_unchanged():
    backend = RFIRemoteUserBackend()
    user = _user("existing@example.com")

    result = backend.configure_user(None, user)

    assert result is user
    user.save.assert_not_called()


def test_configure_user_updates_email_when_header_differs():
    backend = RFIRemoteUserBackend()
    user = _user("old@example.com")
    request = SimpleNamespace(headers={"X-Auth-Request-Email": "new@example.com"})

    result = backend.configure_user(request, user)

    assert result is user
    assert user.email == "new@example.com"
    user.save.assert_called_once_with()


def test_configure_user_does_not_save_when_email_is_unchanged():
    """No DB write when oauth2-proxy reports the same email already on record."""
    backend = RFIRemoteUserBackend()
    user = _user("same@example.com")
    request = SimpleNamespace(headers={"X-Auth-Request-Email": "same@example.com"})

    backend.configure_user(request, user)

    user.save.assert_not_called()


def test_configure_user_does_not_save_when_email_header_is_absent():
    """No DB write when the request carries no X-Auth-Request-Email header."""
    backend = RFIRemoteUserBackend()
    user = _user("existing@example.com")
    request = SimpleNamespace(headers={})

    backend.configure_user(request, user)

    user.save.assert_not_called()
