import io
import unittest
import zipfile

from antigenapi.bioinformatics.imgt import load_sequences, trim_sequence
from antigenapi.utils.helpers import extract_well


def _create_zip(zip_data):
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        for file_name, file_contents in zip_data.items():
            zip_file.writestr(file_name, file_contents)

    return zip_buffer


class TestSequenceParsers(unittest.TestCase):
    def test_load_sequences(self):
        seq_input_data = {
            "asdfA01.seq": "atgacgt",
            "foo_B2.fa": ">blah\nacgt",
            "C12.fasta": ">foo\nATGACGT",
        }
        expected_result = {
            "asdfA01": "ACGT",
            "foo_B2": "",
            "C12": "ACGT",
        }
        zip_file = _create_zip(seq_input_data)
        seqs = load_sequences(zip_file)
        self.assertEqual(seqs, expected_result)

    def test_trim_sequences(self):
        with self.assertRaises(ValueError):
            trim_sequence("X")

        # Empty sequence
        self.assertEqual(trim_sequence(""), "")

        # No start codon
        self.assertEqual(trim_sequence("AAA"), "")

        # Check start codon removed
        self.assertEqual(trim_sequence("ATGACGTN"), "ACGTN")

        # FASTA format with line breaks
        self.assertEqual(trim_sequence(">test\nAAA\nAATGA\nCGTN\n"), "ACGTN")

    def test_extract_well(self):
        wells = {
            "asdfA01": "A1",
            "asdfA2": "A2",
            "A03": "A3",
            "A4": "A4",
        }

        self.assertEqual(
            list([extract_well(w) for w in wells.keys()]), list(wells.values())
        )

        wells_expected_errors = (
            "A1asdf",
            "A01a",
            "H13",
            "A0",
            "Z01",
        )

        with self.assertRaises(ValueError):
            for well in wells_expected_errors:
                extract_well(well)
