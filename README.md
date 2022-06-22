# AntigenApp

## Usage

To run the API server, simply clone the repository and launch docker-compose:

```
    git clone https://github.com/rosalindfranklininstitute/antigen-app
    cd antigen-app
    docker-compose up
```

## Development

To develop the app in a virtual environment, clone the repository as shown below:

```
    git clone https://github.com/rosalindfranklininstitute/antigen-app
    cd antigen-app
```

Then start the development environment using `docker-compose`

```
docker-compose up -d
```

And initialise the database:

```
docker-compose exec api python manage.py migrate
```

### Run backend separately

To create a python virtual enviroment with the required depedancies:

```
    cd backend
    pipenv install --dev
```

To run a development server:

```
    python manage.py runserver
```

### Run frontend separately

To create a node enviroment with the required dependancies:

```
    cd frontend
    npm install
```

To run a development server:

```
    npm start
```
