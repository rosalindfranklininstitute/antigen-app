import filecmp
import os
import shutil

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Loads a fixture and copies its associated media files into MEDIA_ROOT."

    def add_arguments(self, parser):
        """Add arguments to the management command."""
        parser.add_argument(
            "fixture_name", type=str, help="Fixture file name (without .json)"
        )

    def handle(self, *args, **options):
        """Management command to load fixture and copy files to MEDIA_ROOT."""
        fixture_name = options["fixture_name"]

        # Determine app directory (where this command lives)
        app_dir = os.path.dirname(
            os.path.dirname(os.path.dirname(__file__))
        )  # up 3 levels
        fixtures_dir = os.path.join(app_dir, "fixtures")
        fixture_path = os.path.join(fixtures_dir, f"{fixture_name}.json.gz")
        media_source = os.path.join(fixtures_dir, f"{fixture_name}-files")

        # --- 1. Load the fixture ---
        if not os.path.isfile(fixture_path):
            raise CommandError(f"Fixture file not found: {fixture_path}")

        self.stdout.write(f"Loading fixture: {fixture_path}")
        try:
            call_command("loaddata", fixture_path)
        except Exception as e:
            raise CommandError(f"Error loading fixture: {e}")

        # --- 2. Determine MEDIA_ROOT ---
        media_dest = getattr(settings, "MEDIA_ROOT", None)
        if not media_dest:
            project_root = (
                settings.BASE_DIR if hasattr(settings, "BASE_DIR") else os.getcwd()
            )
            media_dest = os.path.join(project_root, "uploads")

        os.makedirs(media_dest, exist_ok=True)

        # --- 3. Copy media files ---
        if not os.path.isdir(media_source):
            self.stdout.write(
                self.style.WARNING(
                    f"No media directory found at {media_source}, skipping media copy."
                )
            )
            self.stdout.write(self.style.SUCCESS("Fixture loaded successfully."))
            return

        self.stdout.write(f"Copying media files from {media_source} → {media_dest}")

        for root, _, files in os.walk(media_source):
            for file in files:
                source_path = os.path.join(root, file)
                relative_path = os.path.relpath(source_path, media_source)
                dest_path = os.path.join(media_dest, relative_path)

                os.makedirs(os.path.dirname(dest_path), exist_ok=True)

                if os.path.exists(dest_path):
                    if filecmp.cmp(source_path, dest_path, shallow=False):
                        self.stdout.write(
                            self.style.WARNING(f"File exists: {relative_path}")
                        )
                        continue  # identical, skip
                    else:
                        raise CommandError(
                            f"File conflict: {relative_path} already "
                            "exists but differs."
                        )
                else:
                    shutil.copy2(source_path, dest_path)

        self.stdout.write(
            self.style.SUCCESS("Fixture and media files loaded successfully.")
        )
