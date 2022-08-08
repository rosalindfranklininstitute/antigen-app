from django.test import Client, TestCase

from .models import Project


class TestProjects(TestCase):
    """Test the projects model and API."""

    def setUp(self):
        """Initialise anonymous HTTP client."""
        self.c = Client()

    def test_project_crud(self):
        """Test project CRUD via API."""
        # Example project for testing
        project = {
            "short_title": "test1",
            "title": "Test project 1",
            "description": "Lorem ipsum etc.",
        }

        # Create a project
        resp = self.c.post("/api/project/", data=project)

        # Check the create request succeeded
        self.assertEqual(resp.status_code, 201)

        # Check the project exists
        Project.objects.get(short_title=project["short_title"])

        # Retrieve the project (short_title is PK)
        self.assertEqual(
            self.c.get(f"/api/project/{project['short_title']}/").status_code, 200
        )

        # Update the project description
        new_description = "test"
        self.assertEqual(
            self.c.patch(
                f"/api/project/{project['short_title']}/",
                data={"description": new_description},
                content_type="application/json",
            ).status_code,
            200,
        )

        # Check the project description was updated in the DB
        self.assertEqual(
            Project.objects.get(short_title=project["short_title"]).description,
            new_description,
        )

        # Delete the project
        self.assertEqual(
            self.c.delete(f"/api/project/{project['short_title']}/").status_code, 204
        )

        # Check the project was deleted in the database
        self.assertRaises(
            Project.DoesNotExist,
            Project.objects.get,
            short_title=project["short_title"],
        )
