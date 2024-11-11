import os
import subprocess
from tempfile import TemporaryDirectory
from typing import Optional

from ..models import SequencingRunResults
from .imgt import as_fasta_files, read_airr_file

# https://www.ncbi.nlm.nih.gov/books/NBK279684/table/appendices.T.options_common_to_all_blast/
BLAST_FMT_MULTIPLE_FILE_BLAST_JSON = "15"
BLAST_NUM_THREADS = 4


def get_db_fasta(
    include_run: Optional[int] = None,
    exclude_run: Optional[int] = None,
    query_type: str = "full",
):
    """Get the sequencing database in fasta format.

    Args:
        include_run (int, optional): Sequencing run ID to include.
          Defaults to None.
        exclude_run (int, optional): Sequencing run ID to exclude.
          Defaults to None.
        query_type (str): Query type - "full" sequence or "cdr3"
          Defaults to "full".

    Returns:
        str: Sequencing run as a FASTA format string
    """
    fasta_data: dict[str, str] = {}
    query = SequencingRunResults.objects.all()
    if include_run:
        query = query.filter(sequencing_run_id=include_run)
    if exclude_run:
        query = query.exclude(sequencing_run_id=exclude_run)
    for sr in query:
        airr_file = read_airr_file(
            sr.airr_file,
            usecols=(
                "sequence_id",
                "cdr3_aa" if query_type == "cdr3" else "sequence_alignment_aa",
            ),
        )
        airr_file = airr_file[
            airr_file.cdr3_aa.notna()
            if query_type == "cdr3"
            else airr_file.sequence_alignment_aa.notna()
        ]
        if not airr_file.empty:
            if query_type == "cdr3":
                cdr3s = set(airr_file.cdr3_aa.unique())
                for cdr3 in cdr3s:
                    fasta_data[f"CDR3: {cdr3}"] = cdr3
            else:
                for _, row in airr_file.iterrows():
                    seq = row.sequence_alignment_aa.replace(".", "")
                    try:
                        if fasta_data[row.sequence_id] != seq:
                            raise ValueError(
                                f"Different sequences with same name! {row.sequence_id}"
                            )
                        continue
                    except KeyError:
                        fasta_data[row.sequence_id] = seq

    fasta_files = as_fasta_files(fasta_data, max_file_size=None)
    if fasta_files:
        return fasta_files[0]

    return ""


def get_sequencing_run_fasta(sequencing_run_id: int, query_type: str):
    """Get sequencing run in BLAST format.

    Args:
        sequencing_run_id (int): Sequencing run ID
        query_type (str): Query type - "full" sequence or "cdr3"

    Returns:
        str: Sequencing run as a FASTA format string
    """
    return get_db_fasta(include_run=sequencing_run_id, query_type=query_type)


def run_blastp(
    sequencing_run_id: int,
    query_type: str = "full",
    outfmt: str = BLAST_FMT_MULTIPLE_FILE_BLAST_JSON,
):
    """Run blastp for a sequencing run vs rest of database.

    Args:
        sequencing_run_id (int): Sequencing run ID.
        query_type (str): Query type - "full" sequence or "cdr3"

    Returns:
        JSONResponse: Single file BLAST JSON
    """
    db_data = get_db_fasta()
    if not db_data:
        return None
    query_data = get_sequencing_run_fasta(sequencing_run_id, query_type=query_type)
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
