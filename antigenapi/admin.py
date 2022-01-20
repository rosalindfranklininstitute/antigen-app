from django.contrib.admin import site

from antigenapi.models import (
    Antigen,
    ElisaPlate,
    ElisaWell,
    LocalAntigen,
    Nanobody,
    Sequence,
    UniProtAntigen,
)

site.register(Antigen)
site.register(LocalAntigen)
site.register(UniProtAntigen)
site.register(Nanobody)
site.register(ElisaPlate)
site.register(ElisaWell)
site.register(Sequence)
