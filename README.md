# AntigenApp

## Development

### Setup

To develop the app in a container environment, clone the repository as shown below:

```
git clone https://github.com/rosalindfranklininstitute/antigen-app
cd antigen-app
```

Then start the development environment using `docker-compose`:

```
docker compose up -d
```

On first use, or after pulling (in case database schema has changed), initialise/migrate the database:

```
docker compose exec api python manage.py migrate
```

You should then be able to access the development site at http://localhost:8000/

The API will be available at http://localhost:8000/api/

### Tests - backend

To run the backend (Python+Django) test suite:

    docker compose exec api pipenv run tests

### Tests - frontend

To run the test suite:

    docker compose exec -e CI=true app npm test
