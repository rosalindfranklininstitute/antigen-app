import os
import subprocess
from tempfile import TemporaryDirectory
from typing import Optional

from ..models import SequencingRunResults
from .imgt import read_airr_file

# https://www.ncbi.nlm.nih.gov/books/NBK279684/table/appendices.T.options_common_to_all_blast/
BLAST_FMT_MULTIPLE_FILE_BLAST_JSON = "15"
BLAST_NUM_THREADS = 4


def get_db_fasta(include_run: Optional[int] = None, exclude_run: Optional[int] = None):
    """Get the sequencing database in fasta format.

    Args:
        include_run (int, optional): Sequencing run ID to include.
          Defaults to None.
        exclude_run (int, optional): Sequencing run ID to exclude.
          Defaults to None.

    Returns:
        str: Sequencing run as a FASTA format string
    """
    fasta_data = ""
    query = SequencingRunResults.objects.all()
    if include_run:
        query = query.filter(sequencing_run_id=include_run)
    if exclude_run:
        query = query.exclude(sequencing_run_id=exclude_run)
    for sr in query:
        airr_file = read_airr_file(
            sr.airr_file, usecols=("sequence_id", "sequence_alignment_aa")
        )
        airr_file = airr_file[airr_file.sequence_alignment_aa.notna()]
        if not airr_file.empty:
            for _, row in airr_file.iterrows():
                fasta_data += f"> {row.sequence_id}\n"
                fasta_data += f"{row.sequence_alignment_aa.replace('.', '')}\n"
    return fasta_data


def get_sequencing_run_fasta(sequencing_run_id: int):
    """Get sequencing run in BLAST format.

    Args:
        sequencing_run_id (int): Sequencing run ID

    Returns:
        str: Sequencing run as a FASTA format string
    """
    return get_db_fasta(include_run=sequencing_run_id)


def run_blastp(
    sequencing_run_id: int, outfmt: str = BLAST_FMT_MULTIPLE_FILE_BLAST_JSON
):
    """Run blastp for a sequencing run vs rest of database.

    Args:
        sequencing_run_id (int): Sequencing run ID.

    Returns:
        JSONResponse: Single file BLAST JSON
    """
    db_data = get_db_fasta()
    if not db_data:
        return None
    query_data = get_sequencing_run_fasta(sequencing_run_id)
    if not query_data:
        return None

    # Write the DB to disk as .fasta format
    with TemporaryDirectory() as tmp_dir:
        fasta_filename = os.path.join(tmp_dir, "db.fasta")
        with open(fasta_filename, "w") as f:
            f.write(db_data)

        # Run makeblastdb
        mkdb_proc = subprocess.run(
            [
                "makeblastdb",
                "-in",
                "db.fasta",
                "-dbtype",
                "prot",
                "-out",
                "antigen.db",
            ],
            capture_output=True,
            cwd=tmp_dir,
        )

        if mkdb_proc.returncode != 0:
            raise Exception(
                f"makeblastdb returned exit code of "
                f"{mkdb_proc.returncode}\n\n"
                f"STDOUT: {mkdb_proc.stdout.decode()}\n\n"
                f"STDERR: {mkdb_proc.stderr.decode()}"
            )

        # Write out query file
        fasta_filename = os.path.join(tmp_dir, "query.fasta")
        with open(fasta_filename, "w") as f:
            f.write(query_data)

        # Run blastp
        blastp_proc = subprocess.run(
            [
                "blastp",
                "-db",
                "antigen.db",
                "-query",
                "query.fasta",
                "-outfmt",
                outfmt,
                "-out",
                "antigen.results",
                "-num_threads",
                str(BLAST_NUM_THREADS),
            ],
            capture_output=True,
            cwd=tmp_dir,
        )

        if blastp_proc.returncode != 0:
            raise Exception(
                f"blastp returned exit code of "
                f"{blastp_proc.returncode}\n\n"
                f"STDOUT: {blastp_proc.stdout.decode()}\n\n"
                f"STDERR: {blastp_proc.stderr.decode()}"
            )

        # Read in the results file
        with open(os.path.join(tmp_dir, "antigen.results"), "r") as f:
            return f.read()
