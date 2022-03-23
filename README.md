# AntigenApp

## Usage

To run the API server, simply clone the repository and launch docker-compose:

```
    git clone https://github.com/rosalindfranklininstitute/antigen-app
    cd antigen-app
    docker-compose up
```

## Development

To develop the app in a virtual environment, clone the repository as shown below and follow the instructions for the backend & frontend:

```
    git clone https://github.com/rosalindfranklininstitute/antigen-app
    cd antigen-app
```

### Backend

To create a python virtual enviroment with the required depedancies:

```
    cd backend
    pipenv install --dev
```

To run a development server:

```
    python manage.py runserver
```

### Frontend

To create a node enviroment with the required dependancies:

```
    cd frontend
    npm install
```

To run a development server:

```
    npm start
```
