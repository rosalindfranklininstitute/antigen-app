from django.test import TestCase

from antigenapi.models import (
    Antigen,
    Cohort,
    ElisaPlate,
    Library,
    SequencingRun,
    SequencingRunResults,
)


class TestFixtures(TestCase):
    fixtures = ("example-smcd1",)

    def test_fixtures(self):
        assert Antigen.objects.filter(short_name="SmCD1").exists()
        assert Cohort.objects.filter(cohort_num=15).exists()
        assert Library.objects.filter(cohort__cohort_num=15).exists()

        # Elisa plates
        elisa_plates = ElisaPlate.objects.all()
        assert len(elisa_plates) == 2

        for ep in elisa_plates:
            assert ep.elisawell_set.count() == 96

        # Sequencing
        assert SequencingRun.objects.filter(notes="SmCD1 sequencing run").exists()
        assert SequencingRunResults.objects.count() == 1
