from django.contrib.auth.backends import RemoteUserBackend
from django.contrib.auth.middleware import RemoteUserMiddleware
from django.http import JsonResponse


class RFIRemoteUserMiddleware(RemoteUserMiddleware):
    """Idenitfy user by HTTP header."""

    header = "HTTP_X_AUTH_REQUEST_PREFERRED_USERNAME"


class RFIRemoteUserBackend(RemoteUserBackend):
    """Custom backend to populate user profile."""

    def configure_user(self, request, user, created=True):
        """Capture user's email into database if provided by oauth2-proxy."""
        if not request:
            return user

        email = request.headers.get("X-Auth-Request-Email")

        if email and user.email != email:
            user.email = email
            user.save()

        return user


def userinfo(request):
    """Drop-in replacement for oauth2-proxy's /oauth2/userinfo endpoint.

    Allows the frontend to read the logged in username and email.
    """
    username = request.headers.get("X-Auth-Request-Preferred-Username")
    email = request.headers.get("X-Auth-Request-Email")
    if not username:
        return JsonResponse({}, status=401)
    return JsonResponse({"preferredUsername": username, "email": email or ""})
