import io
import itertools
import logging
import os
import re
import sys
import zipfile

import pandas as pd
import vquest.config
import vquest.vq
from vquest import LOGGER as VQUEST_LOGGER

START_CODON = "ATG"
SUFFIXES = (".seq", ".fa", ".fasta")


def file_name_to_sequence_name(fn):
    """Extract the sequence identifier from the file name."""
    # Use whole filename as sequence name, as requested by Lauren
    for suffix in SUFFIXES:
        if fn.endswith(suffix):
            return fn[: -len(suffix)]
    return fn


def trim_sequence(seq):
    """Trim the sequence after start codon, if present."""
    if seq.startswith(">"):
        seq = "".join(seq.splitlines()[1:])

    if ">" in seq:
        raise ValueError("File contains multiple sequences")

    # Remove whitespace, move to upper case
    seq = re.sub(r"\s+", "", seq.upper())
    if "\n" in seq:
        raise ValueError("Sequence contains multiple lines")

    # Check codons
    if not re.match("^[ACGTN]*$", seq):
        raise ValueError("Sequence should only contain A,C,G,T,N")

    # Trim from start codon
    try:
        seq = seq[seq.index(START_CODON) + len(START_CODON) :]
    except ValueError:
        seq = ""

    return seq


def _load_sequences_zip(zip_file):
    seq_data = {}
    with zipfile.ZipFile(zip_file, "r") as zip_ref:
        for fn in zip_ref.namelist():
            if not fn.endswith(SUFFIXES) or fn.startswith("__MACOSX"):
                continue

            # Convert the file name to a short sequence identifier
            seq_name = os.path.basename(file_name_to_sequence_name(fn))

            # Read the .seq file
            with zip_ref.open(fn, "r") as f:
                seq = f.read().decode("utf-8")

            # Trim the sequence
            try:
                seq = trim_sequence(seq)
            except ValueError as e:
                raise ValueError(f"File {fn}: {str(e)}")

            # Add to dictionary of sequences
            seq_data[seq_name] = seq

    return seq_data


def load_sequences(directory_or_zip):
    """Load a set of sequences from .seq files from a dictionary or .zip file."""
    if hasattr(directory_or_zip, "read") or os.path.isfile(directory_or_zip):
        return _load_sequences_zip(directory_or_zip)

    seq_data = {}
    for fn in os.listdir(directory_or_zip):
        if fn.endswith(".seq"):
            # Convert the file name to a short sequence identifier
            seq_name = file_name_to_sequence_name(fn)
            # Read the .seq file
            with open(os.path.join(directory_or_zip, fn), "r") as f:
                seq = f.read()
            # Trim the sequence
            try:
                seq = trim_sequence(seq)
            except ValueError as e:
                raise ValueError(f"File {fn}: {str(e)}")
            # Add to dictionary of sequences
            seq_data[seq_name] = seq

    return seq_data


def _chunks(data, size=None):
    """Split a dict into multiple dicts of specified max size (iterator)."""
    if size is None:
        size = sys.maxsize
    it = iter(data)
    for _ in range(0, len(data), size):
        yield {k: data[k] for k in itertools.islice(it, size)}


def as_fasta_files(seq_data, max_file_size=50):
    """Convert a dictionary of sequence names and data to FASTA format files.

    max_file_size specifies the maximum number of sequences in each file
    (For IMGT, this is 50)
    """
    fasta_files = []
    for seq_data_chunk in _chunks(seq_data, max_file_size):
        fasta_files.append(
            "\n".join(
                [
                    f"> {name}" + ("\n" + seq) if seq else ""
                    for name, seq in seq_data_chunk.items()
                ]
            )
        )
    return fasta_files


def run_vquest(fasta_data, species="alpaca", receptor="IG"):
    """Run vquest bioinformatics on a set of fasta files."""
    conf = vquest.config.DEFAULTS.copy()
    conf["inputType"] = "inline"
    conf["species"] = species
    conf["receptorOrLocusType"] = receptor
    conf["sequences"] = fasta_data

    VQUEST_LOGGER.setLevel(logging.WARNING)

    return vquest.vq.vquest(conf)


AIRR_IMPORTANT_COLUMNS = (
    "sequence_id",
    "productive",
    "stop_codon",
    "sequence_alignment_aa",
    "fwr1_aa",
    "cdr1_aa",
    "fwr2_aa",
    "cdr2_aa",
    "fwr3_aa",
    "cdr3_aa",
)


def read_airr_file(airr_file, usecols=AIRR_IMPORTANT_COLUMNS):
    """Read an AIRR file into a pandas dataframe."""
    # Clean up the CSVs! They seem to have an extra tab in some cases.
    buffer = io.StringIO(
        "\n".join(line.strip() for line in airr_file.read().decode("utf8").split("\n"))
    )
    return pd.read_csv(buffer, sep="\t", header=0, usecols=usecols)
