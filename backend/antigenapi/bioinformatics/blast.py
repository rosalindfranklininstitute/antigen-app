import json
import os
import subprocess
from tempfile import TemporaryDirectory
from typing import Optional

import pandas as pd

from antigenapi.utils.helpers import read_seqrun_results

from ..models import SequencingRun
from .imgt import as_fasta_files

# https://www.ncbi.nlm.nih.gov/books/NBK279684/table/appendices.T.options_common_to_all_blast/
BLAST_FMT_MULTIPLE_FILE_BLAST_JSON = "15"
BLAST_NUM_THREADS = 4

# Thresholds for BLAST search results
ALIGN_PERC_THRESHOLD = 90
E_VALUE_THRESHOLD = 0.05


def get_db_fasta(
    include_run: Optional[int] = None,
    query_type: str = "full",
):
    """Get the sequencing database in fasta format.

    Args:
        include_run (int, optional): Sequencing run ID to include.
          Defaults to None.
        query_type (str): Query type - "full" sequence, "cdr3"
          (aggregate by CDR3), or "cdr3_unagg" (use CDR3 sequence,
          but original labels and unaggregated)
          Defaults to "full".

    Returns:
        str: Sequencing run as a FASTA format string
    """
    fasta_data: dict[str, str] = {}

    usecols = (
        "sequence_id",
        "cdr3_aa" if query_type.startswith("cdr3") else "sequence_alignment_aa",
    )

    if include_run:
        airr_file = read_seqrun_results(include_run, usecols=usecols)
    else:
        airr_file = pd.concat(
            [
                read_seqrun_results(seqrun, usecols=usecols)
                for seqrun in SequencingRun.objects.values_list("pk", flat=True)
            ]
        )

    airr_file = airr_file[
        (
            airr_file.cdr3_aa.notna()
            if query_type.startswith("cdr3")
            else airr_file.sequence_alignment_aa.notna()
        )
    ]
    if not airr_file.empty:
        if query_type == "cdr3":
            cdr3s = set(airr_file.cdr3_aa.unique())
            for cdr3 in cdr3s:
                fasta_data[f"CDR3: {cdr3}"] = cdr3
        else:
            for _, row in airr_file.iterrows():
                if query_type == "cdr3_unagg":
                    seq = row.cdr3_aa.replace(".", "")
                    seq_name = f"{row.nanobody_autoname}[CDR3]"
                else:
                    seq = row.sequence_alignment_aa.replace(".", "")
                    seq_name = row.nanobody_autoname
                try:
                    if fasta_data[seq_name] != seq:
                        raise ValueError(
                            f"Different sequences with same name! {seq_name}"
                        )
                    continue
                except KeyError:
                    fasta_data[seq_name] = seq

    fasta_files = as_fasta_files(fasta_data, max_file_size=None)
    if fasta_files:
        return fasta_files[0]

    return ""


def get_sequencing_run_fasta(sequencing_run_id: int, query_type: str):
    """Get sequencing run in BLAST format.

    Args:
        sequencing_run_id (int): Sequencing run ID
        query_type (str): Query type - "full" sequence, "cdr3", or "cdr3_unagg"

    Returns:
        str: Sequencing run as a FASTA format string
    """
    return get_db_fasta(include_run=sequencing_run_id, query_type=query_type)


def run_blastp_seq_run(
    sequencing_run_id: int,
    query_type: str = "full",
    outfmt: str = BLAST_FMT_MULTIPLE_FILE_BLAST_JSON,
):
    """Run blastp for a sequencing run vs rest of database.

    Args:
        sequencing_run_id (int): Sequencing run ID.
        query_type (str): Query type - "full" sequence or "cdr3"

    Returns:
        str: Single file BLAST results as a string
    """
    query_data = get_sequencing_run_fasta(sequencing_run_id, query_type=query_type)
    if not query_data:
        return None

    # Don't aggregate the database CDR3s, so we can see the sequence names
    if query_type == "cdr3":
        query_type = "cdr3_unagg"

    return run_blastp(query_data, query_type, outfmt)


def run_blastp(
    query_data: str,
    query_type: str = "full",
    outfmt: str = BLAST_FMT_MULTIPLE_FILE_BLAST_JSON,
):
    """Run blastp vs database.

    Args:
        sequencing_run_id (int): Sequencing run ID.
        query_type (str): Query type - "full" sequence or "cdr3"

    Returns:
        str: Single file BLAST results as a string
    """
    db_data = get_db_fasta(query_type=query_type)
    if not db_data:
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


def parse_blast_results(
    blast_str: str,
    query_type: str,
    airr_df=None,
    align_perc_theshold=ALIGN_PERC_THRESHOLD,
    e_value_threshold=E_VALUE_THRESHOLD,
):
    """Parse a BLASTp results string into JSON.

    Args:
        blast_str (int): BLASTp results.
        query_type (str): Query type - "full" sequence or "cdr3"
        airr_df (pd.DataFrame or None): AIRR file to match up CDR3s (optional)
        align_perc_threshold (float or int): minimum alignment percentage
        e_value_threshold (float or int): maximum e-value

    Returns:
        JSONResponse: Single file BLAST JSON
    """
    # Parse the JSON and keep the important bits
    blast_result = json.loads(blast_str)
    res = []
    for blast_run in blast_result["BlastOutput2"]:
        run_res = blast_run["report"]["results"]["search"]
        for blast_hit_set in run_res["hits"]:
            subject_title = blast_hit_set["description"][0]["title"]
            query_title = run_res["query_title"]
            if query_type == "cdr3":
                # TODO: Make more robust
                query_cdr3 = query_title[6:]
            else:
                query_cdr3 = None
                if airr_df is not None:
                    query_cdr3 = airr_df.at[query_title, "cdr3_aa"]
                    if pd.isna(query_cdr3):
                        query_cdr3 = None
            if subject_title.strip() == query_title.strip():
                continue
            hsps = blast_hit_set["hsps"][0]
            assert len(blast_hit_set["description"]) == 1
            for hsps in blast_hit_set["hsps"]:
                align_perc = round((hsps["align_len"] / run_res["query_len"]) * 100, 2)
                if align_perc < align_perc_theshold:
                    continue
                e_value = hsps["evalue"]
                if e_value > e_value_threshold:
                    continue
                res.append(
                    {
                        "query_title": query_title.strip(),
                        "query_cdr3": query_cdr3,
                        "subject_title": subject_title.strip(),
                        "submatch_no": hsps["num"],
                        "query_seq": hsps["qseq"],
                        "subject_seq": hsps["hseq"],
                        "midline": hsps["midline"],
                        "bit_score": hsps["bit_score"],
                        "e_value": e_value,
                        "align_len": hsps["align_len"],
                        "align_perc": align_perc,
                        "ident_perc": round(
                            (hsps["identity"] / hsps["align_len"]) * 100, 2
                        ),
                    }
                )

    # Sort the results
    res = sorted(
        res,
        key=lambda r: (r["query_cdr3"] or "", -r["align_perc"], -r["ident_perc"]),
    )

    return res
