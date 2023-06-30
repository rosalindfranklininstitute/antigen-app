from rest_framework.test import APITestCase, APIRequestFactory
from antigenapi import views


class TestRequests(APITestCase, APIRequestFactory):
    def setUp(self):
        # Every test needs access to the request factory.
        self.factory = APIRequestFactory()
        self.get_request = self.factory.get("/llama/")
        self.view = views.LlamaViewSet.as_view({"get": "list"})
        self.get_request_response = self.view(self.get_request)
        self.rendered_get_request_response = self.get_request_response.render()
        return self.rendered_get_request_response

    def test_post_information_to_server(self):
        """Tests the api request for sending data to server is succesful."""

        self.post_request = APIRequestFactory().post(
            "/llama",
            {
                "id": 2,
                "added_by": "DevUser",
                "name": "Llama X",
                "notes": "",
                "added_date": "2023-06-02T10:21:47.167775Z",
            },
        )

        self.view = views.LlamaViewSet.as_view({"post": "list"})
        self.post_request_response = self.view(self.post_request)
        self.rendered_post_request_response = self.post_request_response.render()
        assert self.rendered_post_request_response.status_code == 200
        assert self.rendered_post_request_response.content == {
            "id": 2,
            "added_by": "DevUser",
            "name": "Llama X",
            "notes": "",
            "added_date": "2023-06-02T10:21:47.167775Z",
        }

    def test_delete_information_from_server(self):
        """Tests the api request for deleting some data from server is succesful."""

        self.delete_request = APIRequestFactory().delete(
            "/llama/",
            {
                "id": 2,
                "added_by": "DevUser",
                "name": "Llama X",
                "notes": "",
                "added_date": "2023-06-02T10:21:47.167775Z",
            },
        )

        self.view = views.LlamaViewSet.as_view({"delete": "list"})
        self.delete_request_response = self.view(self.delete_request)
        self.rendered_delete_request_response = self.delete_request_response.render()
        assert self.rendered_delete_request_response.status_code == 200
        assert self.rendered_delete_request_response.content == []

    def test_update_information_from_server(self):
        """Tests the api request for updating any data in server is succesful."""

        self.update_request = APIRequestFactory().patch(
            "/llama/",
            {
                "id": 2,
                "added_by": "DevUser",
                "name": "Llama X",
                "notes": "",
                "added_date": "2023-06-02T10:21:47.167775Z",
            },
        )

        self.view = views.LlamaViewSet.as_view({"patch": "list"})
        self.update_request_response = self.view(self.update_request, pk="4")
        self.rendered_update_request_response = self.update_request_response.render()

        assert self.rendered_update_request_response.status_code == 200
        assert self.rendered_update_request_response.content == {
            "id": 2,
            "added_by": "DevUser",
            "name": "Llama X",
            "notes": "",
            "added_date": "2023-06-02T10:21:47.167775Z",
        }
