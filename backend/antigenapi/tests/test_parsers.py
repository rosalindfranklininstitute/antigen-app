import io
import unittest
import zipfile

from antigenapi.bioinformatics.imgt import (
    as_fasta_files,
    load_sequences,
    read_airr_file,
    trim_sequence,
)
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


class TestFastaConversion(unittest.TestCase):
    def test_as_fasta_files_returns_empty_for_empty_dict(self):
        self.assertEqual(as_fasta_files({}), [])

    def test_as_fasta_files_formats_single_sequence(self):
        result = as_fasta_files({"NB1": "MKTAA"}, max_file_size=None)
        self.assertEqual(result, ["> NB1\nMKTAA"])

    def test_as_fasta_files_formats_multiple_sequences_in_one_file(self):
        result = as_fasta_files({"NB1": "ACDE", "NB2": "MKLD"}, max_file_size=None)
        self.assertEqual(result, ["> NB1\nACDE\n> NB2\nMKLD"])

    def test_as_fasta_files_splits_into_chunks_at_max_size(self):
        data = {"A": "ACDE", "B": "MKLD", "C": "WGQG"}
        chunks = as_fasta_files(data, max_file_size=2)
        self.assertEqual(len(chunks), 2)
        self.assertEqual(chunks[0], "> A\nACDE\n> B\nMKLD")
        self.assertEqual(chunks[1], "> C\nWGQG")

    def test_as_fasta_files_renders_empty_sequence_as_blank(self):
        # An empty sequence contributes an empty string entry in the joined output.
        result = as_fasta_files({"NB1": ""}, max_file_size=None)
        self.assertEqual(result, [""])


class TestReadAirrFile(unittest.TestCase):
    def test_read_airr_file_parses_tab_separated_content(self):
        tsv = b"sequence_id\tproductive\nseq_A01\tT\nseq_B02\tF\n"
        result = read_airr_file(io.BytesIO(tsv), usecols=("sequence_id", "productive"))
        self.assertEqual(list(result["sequence_id"]), ["seq_A01", "seq_B02"])
        self.assertEqual(list(result["productive"]), ["T", "F"])

    def test_read_airr_file_strips_crlf_line_endings(self):
        tsv = b"sequence_id\tproductive\r\nseq_A01\tT\r\n"
        result = read_airr_file(io.BytesIO(tsv), usecols=("sequence_id", "productive"))
        self.assertEqual(list(result["sequence_id"]), ["seq_A01"])
