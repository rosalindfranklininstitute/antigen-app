from typing import Dict
import urllib.parse

from xmlschema import XMLSchema

URL_BASE = "https://rest.uniprot.org/uniprotkb/"
SCHEMA = XMLSchema(
    "https://ftp.uniprot.org/pub/databases/uniprot/current_release/"
    + "knowledgebase/complete/uniprot.xsd"
)


def get_protein(
    accession_number: str,
) -> Dict:
    """Retrieves protein data from the UniProt database.

    Args:
        accession_number (str): UniProt protein accession number.

    Returns:
        Dict: A key value mapping of protein data.
    """
    data = SCHEMA.to_dict(URL_BASE + urllib.parse.quote(accession_number) + ".xml")
    assert isinstance(data, Dict)
    return data["entry"][0]
