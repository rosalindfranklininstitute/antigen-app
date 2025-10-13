# AntigenApp

## Introduction

AntigenApp is a laboratory data management system to capture, store and share nanobody experimental data. It consists of a web application (Python backend, React frontend, Postgres database) which can store data on projects, antigens, llamas, cohorts, libraries, ELISA assays and nanobody sequencing results.

## Running the app

### Set up a development environment

To develop the app in a container environment, clone the repository as shown below:

    git clone https://github.com/rosalindfranklininstitute/antigen-app
    cd antigen-app

Then start the development environment using `docker-compose`:

    docker compose up -d

On first use, or after pulling (in case database schema has changed), initialise/migrate the database:

    docker compose exec api python manage.py migrate

You should then be able to access the development site at http://localhost:8000/

The API will be available at http://localhost:8000/api/

## Example data and tutorial

You can either load the example data directly into the database in a single step, or you can load it step-by-step using the [data files](docs/example-data/) if you prefer.

To load example data directly, run the following command on a clean installation:

    docker compose exec api python manage.py load_fixtures example-smcd1

Alternatively, to go through the data entry process manually (to gain familiarity with AntigenApp), see the [tutorial](docs/TUTORIAL.md).

### Tests - backend

To run the backend (Python+Django) test suite:

    docker compose exec api pipenv run tests

### Tests - frontend

To run the frontend test suite:

    docker compose exec -e CI=true app npm test

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
