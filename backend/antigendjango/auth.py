from django.contrib.auth.middleware import RemoteUserMiddleware


class RFIRemoteUserMiddleware(RemoteUserMiddleware):
    header = "HTTP_X_AUTH_REQUEST_PREFERRED_USERNAME"
