import datetime

from django.http import FileResponse
from rest_framework.views import APIView

from antigenapi.bioinformatics.blast import get_db_fasta


class GlobalFastaView(APIView):
    def get(self, request, format=None):
        """Download entire database as .fasta file."""
        fasta_data = get_db_fasta()

        fasta_filename = (
            f"antigenapp_database_{datetime.datetime.now().isoformat()}.fasta"
        )
        response = FileResponse(
            fasta_data,
            as_attachment=True,
            content_type="text/x-fasta",
            filename=fasta_filename,
        )
        response["Content-Disposition"] = f'attachment; filename="{fasta_filename}"'
        return response
