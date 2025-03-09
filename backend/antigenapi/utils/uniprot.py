import urllib.parse
import urllib.request
from typing import Dict

from lxml import etree

URL_BASE = "https://rest.uniprot.org/uniprotkb/"


def get_protein(accession_number: str) -> Dict:
    """Retrieves protein data from the UniProt database.

    Args:
        accession_number (str): UniProt protein accession number.

    Returns:
        Dict: A dictionary containing the protein's data.
    """
    # Construct the URL for the protein data (in XML format)
    url = URL_BASE + urllib.parse.quote(accession_number) + ".xml"

    # Download XML data from UniProt
    try:
        with urllib.request.urlopen(url) as response:
            xml_data = response.read()
    except urllib.error.URLError as e:
        raise ConnectionError(f"Failed to fetch data from UniProt: {e}")

    # Parse the XML data using lxml
    try:
        root = etree.fromstring(xml_data)

        # Extract protein information (e.g., name, accession, description, etc.)
        protein_info = {}

        # Extract the protein's name (e.g., from the 'protein' tag)
        protein_name = root.xpath(
            "//uniprot:entry/uniprot:protein/uniprot"
            ":recommendedName/uniprot:fullName/text()",
            namespaces={"uniprot": "http://uniprot.org/uniprot"},
        )
        if protein_name:
            protein_info["protein_name"] = protein_name[0]

        # Extract the accession number
        protein_info["accession"] = accession_number

        # Extract description (e.g., from the 'comment' tag) and clean up whitespace
        description = root.xpath(
            "//uniprot:entry/uniprot:comment[@type='function']/text()",
            namespaces={"uniprot": "http://uniprot.org/uniprot"},
        )
        if description:
            protein_info["description"] = description[
                0
            ].strip()  # Remove leading/trailing whitespace

        # Extract gene names (e.g., from the 'gene' tag)
        gene_names = root.xpath(
            "//uniprot:entry/uniprot:gene/uniprot:name/text()",
            namespaces={"uniprot": "http://uniprot.org/uniprot"},
        )
        if gene_names:
            protein_info["gene_names"] = gene_names

        # Extract molecular mass (e.g., from the 'sequence' tag)
        molecular_mass = root.xpath(
            "//uniprot:entry/uniprot:sequence/@mass",
            namespaces={"uniprot": "http://uniprot.org/uniprot"},
        )
        if molecular_mass:
            protein_info["molecular_mass"] = molecular_mass[0]

        # Extract the protein sequence (e.g., from the 'sequence' tag)
        sequence = root.xpath(
            "//uniprot:entry/uniprot:sequence/text()",
            namespaces={"uniprot": "http://uniprot.org/uniprot"},
        )
        if sequence:
            protein_info["sequence"] = sequence[0]

        # Return the gathered protein info as a dictionary
        return protein_info

    except etree.XMLSyntaxError as e:
        raise ValueError(f"Failed to parse XML: {e}")
    except Exception as e:
        raise ValueError(f"An error occurred while processing the XML: {e}")
