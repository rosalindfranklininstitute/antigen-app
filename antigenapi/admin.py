from django.contrib.admin import site
from guardian.admin import GuardedModelAdmin

from antigenapi.models import Antigen, ElisaPlate, ElisaWell, Nanobody, Sequence


class AntigenAdmin(GuardedModelAdmin):
    """A guarded model admin view for antigen objects."""

    pass


class NanobodyAdmin(GuardedModelAdmin):
    """A guarded model admin view for nanobody objects."""

    pass


class ElisaPlateAdmin(GuardedModelAdmin):
    """A guarded model admin view for elisa plate objects."""

    pass


class ElisaWellAdmin(GuardedModelAdmin):
    """A guarded model admin view for elisa well objects."""

    pass


class SequenceAdmin(GuardedModelAdmin):
    """A guarded model admin view for sequence objects."""

    pass


site.register(Antigen, AntigenAdmin)
site.register(Nanobody, NanobodyAdmin)
site.register(ElisaPlate, ElisaPlateAdmin)
site.register(ElisaWell, ElisaWellAdmin)
site.register(Sequence, SequenceAdmin)
