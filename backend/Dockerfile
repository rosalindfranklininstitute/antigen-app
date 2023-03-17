FROM python:3.11-bullseye AS builder

RUN pip install --user wheel pipenv

# Tell pipenv to create venv in the current directory
ENV PIPENV_VENV_IN_PROJECT=1

COPY Pipfile Pipfile.lock pyproject.toml setup.cfg /usr/src/
WORKDIR /usr/src

RUN /root/.local/bin/pipenv sync

RUN .venv/bin/python --version

COPY manage.py /usr/src/
COPY antigendjango /usr/src/antigendjango
COPY antigenapi /usr/src/antigenapi

RUN DJANGO_CI=true .venv/bin/python manage.py collectstatic --noinput

FROM python:3.11-slim-bullseye

RUN apt-get update && apt-get install -y \
    libxml2 \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -v /usr/src/.venv

COPY --from=builder /usr/src/.venv/ /usr/src/.venv/
COPY --from=builder /usr/src/static/ /api_data/static/
COPY --from=builder /usr/src/manage.py /usr/src/
COPY --from=builder /usr/src/antigenapi /usr/src/antigenapi
COPY --from=builder /usr/src/antigendjango /usr/src/antigendjango
COPY uwsgi.ini /usr/src

WORKDIR /usr/src

CMD [".venv/bin/uwsgi", "--ini", "uwsgi.ini"]
