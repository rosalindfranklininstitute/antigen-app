from django.contrib.auth.middleware import RemoteUserMiddleware


class RFIRemoteUserMiddleware(RemoteUserMiddleware):
    """Idenitfy user by HTTP header."""

    header = "HTTP_X_AUTH_REQUEST_PREFERRED_USERNAME"
