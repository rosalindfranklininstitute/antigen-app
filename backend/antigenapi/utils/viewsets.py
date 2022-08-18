from typing import Iterable, Union

from django.db.models import Model
from guardian.shortcuts import assign_perm
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import Serializer
from rest_framework.viewsets import ModelViewSet


def create_possibly_multiple(self: ModelViewSet, request: Request):
    """An overload of `create` allowing serialization of multiple listed entries.

    Args:
        self (ModelViewSet): A model view set instance.
        request (Request): A request which may contain multiple listed entries.
    """
    serializer: Serializer = self.get_serializer(
        data=request.data, many=isinstance(request.data, list)
    )
    serializer.is_valid(raise_exception=True)
    self.perform_create(serializer)
    headers = self.get_success_headers(serializer.data)
    return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


def perform_create_allow_creator_change_delete(
    self: ModelViewSet, serializer: Serializer
):
    """An overload of `perform_create`.

    Allowing the creator to delete or change the object.

    Args:
        self (ModelViewSet): A model view set instance.
        serializer (Serializer): The model serializer.
    """
    instances: Union[Model, Iterable[Model]] = serializer.save()
    if not isinstance(instances, Iterable):
        instances = [instances]
    for instance in instances:
        assign_perm(f"change_{instance._meta.model_name}", self.request.user, instance)
        assign_perm(f"delete_{instance._meta.model_name}", self.request.user, instance)
