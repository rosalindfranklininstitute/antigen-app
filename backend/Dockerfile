FROM registry.hub.docker.com/library/python:3.9 AS base

ENV ANTIGENAPP_DIR /antigenapp

RUN python3.9 -m pip install --upgrade pip
RUN python3.9 -m pip install wheel pipenv

COPY Pipfile ${ANTIGENAPP_DIR}/Pipfile
COPY Pipfile.lock ${ANTIGENAPP_DIR}/Pipfile.lock
COPY pyproject.toml ${ANTIGENAPP_DIR}/pyproject.toml
COPY setup.cfg ${ANTIGENAPP_DIR}/setup.cfg
WORKDIR ${ANTIGENAPP_DIR}

RUN pipenv install --python python3.9 --system --deploy --verbose

COPY . ${ANTIGENAPP_DIR}

RUN DJANGO_CI=true python3.9 manage.py collectstatic --noinput \
    && mkdir /api_data/ \
    && mv ./static/ /api_data/static/

CMD ["uwsgi", "--ini", "uwsgi.ini"]
