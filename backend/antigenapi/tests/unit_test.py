import rest_framework
from rest_framework.test import APIRequestFactory
from utils import views
import unittest


  
class RetrievingData(unittest.TestCase):
  
    
    def test_http_status_code(self):
        self.factory=APIRequestFactory()
        self.request = self.factory.get('http:/localhost:8000/api/project')        
        self.assertEqual(self.request.status_code, 200)
        
  





