# AntigenApp

## Introduction

AntigenApp is a laboratory data management system for nanobody generation and sequence analysis. Nanobodies are single-domain antibodies derived from the heavy chain-only immunoglobulins of camelids, with broad applications in biosciences as imaging probes, diagnostic agents, and research tools. Generating nanobodies is a multi-stage experimental process: immunisation, library construction, ELISA screening, sequencing, and hit selection. Keeping track of data across these stages is a recurring challenge for nanobody groups.

AntigenApp provides a centralised web application and database that captures data at every step of the nanobody discovery pipeline. It is built with a Python/Django backend, React frontend, and PostgreSQL database, and is designed for straightforward self-hosting with Docker Compose or Kubernetes.

AntigenApp was published in the _Bioinformatics_ journal. Please read the article to learn more: https://doi.org/10.1093/bioinformatics/btaf642

## Features

- **Project and sample tracking** — organise work by project, antigen, llama, and immunisation cohort, with a full audit log on every record
- **Library management** — record panning libraries derived from each cohort
- **ELISA data capture** — store optical density measurements per well for 96-well plates, with configurable thresholds for hit selection
- **Sequencing run management** — configure plate layouts with per-plate OD thresholds, and record nanobody sequencing results against wells
- **Automatic nanobody naming** — a standardised naming convention is applied automatically to nanobodies as they are stored
- **Sequence search and clustering** — search or BLAST against all stored nanobody sequences directly from the interface
- **FASTA export** — download the full nanobody database as a FASTA file
- **Audit log** — every record change is tracked with user and timestamp

## Running the app

### Set up a development environment

To develop the app in a container environment, clone the repository as shown below:

    git clone https://github.com/rosalindfranklininstitute/antigen-app
    cd antigen-app

Then start the development environment using `docker compose`:

    docker compose up -d

**Linux only:** On Linux, set file permissions correctly:

    docker compose run --rm -u root api chgrp -R nonroot /usr/src

On first use, or after a `git pull` (in case database schema has changed), initialise/migrate the database:

    docker compose exec api python manage.py migrate

## Example data and tutorial

You can either load the example data directly into the database in a single step, or you can load it step-by-step using the [data files](docs/example-data/) if you prefer.

To load example data directly, run the following command on a clean installation (make sure to do this before loading the web interface for the first time):

    docker compose exec api python manage.py load_fixtures example-smcd1

Alternatively, to go through the data entry process manually (to gain familiarity with AntigenApp), see the [tutorial](docs/TUTORIAL.md).

## Access the interface

After setting up the development environment above and optionally loading example data, you can access the development site at http://localhost:8000/

The API will be available at http://localhost:8000/api/

## Update the development environment

To update the development environment:

    git pull
    docker compose up -d --build
    docker compose exec api python manage.py migrate

## Updating dependencies

Dependency updates are normally handled automatically by Dependabot. The commands below are for reference when manually updating.

Backend (Python):

    docker compose exec api uv lock
    docker compose restart api

Frontend (npm):

    docker run --rm -v ./frontend:/app -w /app node:22-alpine npm update
    docker compose up -d --build

## Troubleshoot the development environment

If you encounter an error when first running AntigenApp, please check that you've run the `migrate` command described earlier.

If you see an HTTP error 500, this indicates an error with the backend service. Please look at the logs for further information:

    docker compose logs api

If you believe it looks like a bug, please open an issue in this repo. Please include logs and a description of how to recreate the issue.

### Tests - backend

To run the backend (Python+Django) test suite:

    docker compose exec api python -m pytest

### Tests - frontend

To run the frontend test suite:

    docker compose exec app npx vitest run

### Running in production

AntigenApp could be run in production using Docker Compose or Kubernetes. In both cases, make sure:

- `DJANGO_DEBUG` should be set to false.
- A reverse proxy server or ingress should be used with HTTPS, e.g. nginx.
- The reverse server should add authentication, e.g. using OpenID Connect (OIDC).
- S3 file storage will be more scalable for larger installations.
- Configure backups for the database and uploaded files.

For Kubernetes, see the [example manifests](docs/kubernetes-manifests) which give a scaffold for
configuring AntigenApp with ingress-nginx, CruncyData's Postgres Operator, OIDC authentication and
an S3 bucket. These manifests can be adapted to integrate your organisations infrastructure.

## Citation

If you use AntigenApp in your research, please cite:

> Lubbock ALR, Eyssen LE-A, Parker K, Basham M, Shemilt LA, Owens RJ.
> AntigenApp: a laboratory data management system for nanobody generation and sequence analysis.
> _Bioinformatics_. 2025;41(12):btaf642.
> https://doi.org/10.1093/bioinformatics/btaf642
