import json
import os
import re
from io import StringIO

from django.test import Client, TestCase

file_data = """1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,1,1,1"""


class TestCsvUpload(TestCase):
    """Test the csv upload feature for the optical densities."""

    def setUp(self):
        """Initialise anonymous HTTP client."""
        self.client = Client()

    def test_upload_csv(self):
        """Test uploading a csv file."""
        # create project
        project = {
            "short_title": "test",
            "title": "Test project",
            "description": "Lorem ipsum etc.",
        }
        resp = self.client.post("/api/project/", data=project)
        self.assertEqual(resp.status_code, 201)

        # Create Antigen
        antigen = {
            "molecular_mass": "1",
            "project": "test",
            "sequence": "AAAAAAAAAAAAAAAAAAAAAA",
        }
        resp = self.client.post("/api/local_antigen/", data=antigen)
        antigen_name = json.loads(resp.content)["name"]
        self.assertEqual(resp.status_code, 201)

        # Create Elisa plate
        plate = {
            "project": "test",
            "number": "1",
            "threshold": "0",
        }
        resp = self.client.post("/api/elisa_plate/", data=plate)
        self.assertEqual(resp.status_code, 201)

        # Create nanobodies
        nanobodies = [{"project": "test"} for i in range(96)]

        resp = self.client.post(
            "/api/nanobody/",
            data=nanobodies,
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 201)
        nanobody_names = [nanobody["name"] for nanobody in json.loads(resp.content)]
        nanobody_numbers = [nanobody["number"] for nanobody in json.loads(resp.content)]

        # Create elisa wells
        def well_json_maker(counter):
            return {
                "project": "test",
                "plate": "1",
                "location": str(counter + 1),
                "antigen": {
                    "number": "1",
                    "project": "test",
                    "name": antigen_name,
                },
                "nanobody": {
                    "name": nanobody_names[counter],
                    "number": nanobody_numbers[counter],
                    "project": "test",
                },
            }

        resp = self.client.post(
            "/api/elisa_well/",
            data=list(map(well_json_maker, range(96))),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 201)

        test_file = StringIO(file_data)
        test_file.name = "csv_file.csv"
        resp = self.client.post(
            "/api/upload_csv/", {"plate": "test:1", "csv_file": test_file}
        )
        self.assertEqual(resp.status_code, 201)
        file_path = json.loads(resp.content)
        # Compare stored optical densities to file data
        resp = self.client.get("/api/elisa_well/?project=test&plate=1&format=json")
        optical_density = [well["optical_density"] for well in json.loads(resp.content)]
        file_data_list = re.split(",|\n", file_data)

        self.assertEqual(optical_density, list(map(int, file_data_list)))

        # remove uploaded csv file
        os.remove(file_path)
