import itertools
import logging
import os
import sys
import zipfile

import vquest.config
import vquest.vq
from vquest import LOGGER as VQUEST_LOGGER

START_CODON = "ATG"


def file_name_to_sequence_name(fn):
    """Extract the sequence identifier from the file name (Ray Owens' method)."""
    # Use whole filename as sequence name, as requested by Lauren
    return fn[:-4] if fn.endswith(".seq") else fn


def trim_sequence(seq):
    """Trim the sequence after start codon, if present."""
    try:
        return seq[seq.index(START_CODON) + len(START_CODON) :]
    except ValueError:
        return ""


def _load_sequences_zip(zip_file):
    seq_data = {}
    with zipfile.ZipFile(zip_file, "r") as zip_ref:
        for fn in zip_ref.namelist():
            if not fn.endswith(".seq") or fn.startswith("__MACOSX"):
                continue

            # Convert the file name to a short sequence identifier
            seq_name = os.path.basename(file_name_to_sequence_name(fn))

            # Read the .seq file
            with zip_ref.open(fn, "r") as f:
                seq = f.read().decode("utf-8")

            # Trim the sequence
            seq = trim_sequence(seq)

            # Add to dictionary of sequences, if a start codon was present
            if seq:
                seq_data[seq_name] = seq

    return seq_data


def load_sequences(directory_or_zip):
    """Load a set of sequences from .seq files from a dictionary or .zip file."""
    if os.path.isfile(directory_or_zip):
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
            seq = trim_sequence(seq)
            # Add to dictionary of sequences, if a start codon was present
            if seq:
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
            "\n".join([f"> {name}\n{seq}" for name, seq in seq_data_chunk.items()])
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
