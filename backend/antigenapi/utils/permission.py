from django.db.models import Model
from guardian.shortcuts import assign_perm
from rest_framework.serializers import Serializer
from rest_framework.viewsets import ModelViewSet


def perform_create_allow_creator_change_delete(
    self: ModelViewSet, serializer: Serializer
):
    """An overload of `perform_create` allowing the creator to delete or change the object.

    Args:
        self (ModelViewSet): A model view set instance.
        serializer (Serializer): The model serializer.
    """
    instance: Model = serializer.save()
    assign_perm(f"change_{instance._meta.model_name}", self.request.user, instance)
    assign_perm(f"delete_{instance._meta.model_name}", self.request.user, instance)
