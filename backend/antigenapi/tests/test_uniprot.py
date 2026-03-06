import urllib.error

import pytest

from antigenapi.utils import uniprot


class _Response:
    def __init__(self, payload):
        self.payload = payload

    def read(self):
        return self.payload

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


def test_get_protein_parses_expected_fields(monkeypatch):
    xml = b"""
    <uniprot xmlns="http://uniprot.org/uniprot">
      <entry>
        <protein>
          <recommendedName><fullName>My Protein</fullName></recommendedName>
        </protein>
        <comment type="function">  Important function  </comment>
        <gene><name>GENE1</name></gene>
        <gene><name>GENE2</name></gene>
        <sequence mass="12345">MKTAA</sequence>
      </entry>
    </uniprot>
    """

    monkeypatch.setattr(
        uniprot.urllib.request,
        "urlopen",
        lambda *_: _Response(xml),
    )

    data = uniprot.get_protein("P12345")

    assert data == {
        "protein_name": "My Protein",
        "accession": "P12345",
        "description": "Important function",
        "gene_names": ["GENE1", "GENE2"],
        "molecular_mass": "12345",
        "sequence": "MKTAA",
    }


def test_get_protein_url_encodes_accession(monkeypatch):
    seen = {}
    xml = b'<uniprot xmlns="http://uniprot.org/uniprot"><entry /></uniprot>'

    def _urlopen(url):
        seen["url"] = url
        return _Response(xml)

    monkeypatch.setattr(uniprot.urllib.request, "urlopen", _urlopen)
    uniprot.get_protein("P 123")

    assert "P%20123.xml" in seen["url"]


def test_get_protein_raises_connection_error_on_url_failure(monkeypatch):
    def _urlopen(_):
        raise urllib.error.URLError("network down")

    monkeypatch.setattr(uniprot.urllib.request, "urlopen", _urlopen)

    with pytest.raises(ConnectionError, match="Failed to fetch data from UniProt"):
        uniprot.get_protein("P12345")


def test_get_protein_raises_value_error_on_invalid_xml(monkeypatch):
    monkeypatch.setattr(
        uniprot.urllib.request,
        "urlopen",
        lambda *_: _Response(b"<not-xml"),
    )

    with pytest.raises(ValueError, match="Failed to parse XML"):
        uniprot.get_protein("P12345")


def test_get_protein_wraps_unexpected_processing_error(monkeypatch):
    class _BrokenRoot:
        def xpath(self, *args, **kwargs):
            raise RuntimeError("boom")

    monkeypatch.setattr(
        uniprot.urllib.request,
        "urlopen",
        lambda *_: _Response(b"<ignored />"),
    )
    monkeypatch.setattr(uniprot.etree, "fromstring", lambda *_: _BrokenRoot())

    with pytest.raises(ValueError, match="An error occurred while processing the XML"):
        uniprot.get_protein("P12345")
