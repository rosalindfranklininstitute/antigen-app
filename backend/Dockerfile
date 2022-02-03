FROM registry.hub.docker.com/library/python:3.9 AS base

ENV PIPENV_DEPENDENCIES wheel pipenv
ENV ANTIGENAPP_DIR /antigenapp

RUN python3.9 -m pip install --upgrade pip
RUN python3.9 -m pip install ${PIPENV_DEPENDENCIES}

COPY . ${ANTIGENAPP_DIR}
WORKDIR ${ANTIGENAPP_DIR}

RUN pipenv install --python python3.9 --system --deploy

RUN python3.9 manage.py collectstatic --noinput \
    && mkdir /api_data/ \
    && mv ./static/ /api_data/static/ \
    && python3.9 manage.py makemigrations antigenapi \
    && python3.9 manage.py migrate

CMD ["uwsgi", "--ini", "uwsgi.ini"]