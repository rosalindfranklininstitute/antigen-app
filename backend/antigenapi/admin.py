from django.contrib.admin import site
from guardian.admin import GuardedModelAdmin

from antigenapi.models import (
    ElisaPlate,
    ElisaWell,
    LocalAntigen,
    Nanobody,
    Project,
    Sequence,
    UniProtAntigen,
)


class ProjectAdmin(GuardedModelAdmin):
    """A guarded model admin view for project objects."""

    pass


class AntigenAdmin(GuardedModelAdmin):
    """A guarded model admin view for antigen objects."""

    pass


class LocalAntigenAdmin(GuardedModelAdmin):
    """A guarded model admin view for local antigen objects."""

    pass


class UniProtAntigenAdmin(GuardedModelAdmin):
    """A guarded model admin view for UniProt antigen objects."""

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


site.register(Project, ProjectAdmin)
site.register(LocalAntigen, LocalAntigenAdmin)
site.register(UniProtAntigen, UniProtAntigenAdmin)
site.register(Nanobody, NanobodyAdmin)
site.register(ElisaPlate, ElisaPlateAdmin)
site.register(ElisaWell, ElisaWellAdmin)
site.register(Sequence, SequenceAdmin)
