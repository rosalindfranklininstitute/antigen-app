from django.contrib.admin import site

from antigenapi.models import Antigen, ElisaPlate, ElisaWell, Nanobody, Sequence

site.register(Antigen)
site.register(Nanobody)
site.register(ElisaPlate)
site.register(ElisaWell)
site.register(Sequence)
