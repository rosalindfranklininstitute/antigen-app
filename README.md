# AntigenApp

## Usage

To run the API server, simply clone the repository and launch docker-compose:
```
    git clone https://github.com/rosalindfranklininstitute/antigen-app
    cd antigen-app
    docker-compose up
```

### Development

To develop the app in a virtual environment, simply clone the repository and install the pipenv environment:
```
    git clone https://github.com/rosalindfranklininstitute/antigen-app
    cd antigen-app
    pipenv install --dev
```

To run a development server:
```
    python manage.py runserver
```