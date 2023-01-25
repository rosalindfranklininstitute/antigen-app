from django.contrib.admin import site
from guardian.admin import GuardedModelAdmin

from antigenapi.models import (
    ElisaPlate,
    ElisaWell,
    Project,
    Antigen
)


class ProjectAdmin(GuardedModelAdmin):
    """A guarded model admin view for project objects."""

    pass


class AntigenAdmin(GuardedModelAdmin):
    """A guarded model admin view for antigen objects."""

    pass


class ElisaPlateAdmin(GuardedModelAdmin):
    """A guarded model admin view for elisa plate objects."""

    pass


class ElisaWellAdmin(GuardedModelAdmin):
    """A guarded model admin view for elisa well objects."""

    pass



site.register(Project, ProjectAdmin)
site.register(Antigen, AntigenAdmin)
site.register(ElisaPlate, ElisaPlateAdmin)
site.register(ElisaWell, ElisaWellAdmin)
