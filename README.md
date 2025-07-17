# AntigenApp

## Development

### Setup

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

    docker compose exec api python manage.py loaddata example-smcd1

To go through the data entry process to gain familiarity with AntigenApp, see the [tutorial](docs/TUTORIAL.md).

### Tests - backend

To run the backend (Python+Django) test suite:

    docker compose exec api pipenv run tests

### Tests - frontend

To run the frontend test suite:

    docker compose exec -e CI=true app npm test
