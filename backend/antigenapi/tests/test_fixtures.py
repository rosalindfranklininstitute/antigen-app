import filecmp
import os
import tempfile
from pathlib import Path

from django.conf import settings
from django.core.management import call_command
from django.test import TestCase, override_settings

from antigenapi.models import (
    Antigen,
    Cohort,
    ElisaPlate,
    Library,
    SequencingRun,
    SequencingRunResults,
)


@override_settings(MEDIA_ROOT=Path(tempfile.TemporaryDirectory().name))
class TestFixtures(TestCase):
    def setUp(self):
        call_command("load_fixtures", "example-smcd1")

    def test_fixtures(self):
        # Determine source media directory
        app_dir = os.path.dirname(os.path.dirname(__file__))
        media_source = os.path.join(app_dir, "fixtures", "example-smcd1-files")

        # Walk source directory and verify files exist in destination
        for root, _, files in os.walk(media_source):
            for file in files:
                source_path = os.path.join(root, file)
                relative_path = os.path.relpath(source_path, media_source)
                dest_path = os.path.join(settings.MEDIA_ROOT, relative_path)
                self.assertTrue(
                    os.path.exists(dest_path),
                    f"File missing in MEDIA_ROOT: {relative_path}",
                )
                self.assertTrue(
                    filecmp.cmp(source_path, dest_path, shallow=True),
                    f"File doesn't match: {relative_path}",
                )

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
