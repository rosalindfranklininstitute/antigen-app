from typing import Dict

from xmlschema import XMLSchema

URL_BASE = "https://www.uniprot.org/uniprot/"
SCHEMA = XMLSchema("https://www.uniprot.org/docs/uniprot.xsd")


def get_protein(
    accession_number: str,
) -> Dict:
    """Retrieves protein data from the UniProt database.

    Args:
        accession_number (str): UniProt protein accession number.

    Returns:
        Dict: A key value mapping of protein data.
    """
    data = SCHEMA.to_dict(URL_BASE + accession_number + ".xml")
    assert isinstance(data, Dict)
    return data["entry"][0]