FROM quay.io/rosalindfranklininstitute/blast:2.16.0 AS blast

FROM python:3.12-bookworm AS builder

RUN pip install --upgrade pip wheel pipenv

RUN adduser --uid 10191 --group --system --no-create-home nonroot
RUN chown -R nonroot:nonroot /usr/src
USER nonroot
WORKDIR /usr/src

# Tell pipenv to create venv in the current directory
ENV PIPENV_VENV_IN_PROJECT=1
ENV PATH="/usr/src/.venv/bin:$PATH"

COPY Pipfile Pipfile.lock pyproject.toml setup.cfg /usr/src/

ARG PIPENV_SYNC_FLAGS=
RUN pipenv sync ${PIPENV_SYNC_FLAGS}

COPY manage.py /usr/src/
COPY antigendjango /usr/src/antigendjango
COPY antigenapi /usr/src/antigenapi

RUN DJANGO_CI=true .venv/bin/python manage.py collectstatic --noinput

FROM python:3.12-slim-bookworm AS prod

# liblmdb-dev and libgomp1 required by BLAST
RUN apt-get update && apt-get install -y \
    libxml2 \
    media-types \
    liblmdb-dev \
    libgomp1 \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

RUN adduser --uid 10191 --group --system --no-create-home nonroot
RUN chown -R nonroot:nonroot /usr/src
USER nonroot
ENV PATH="/usr/src/.venv/bin:$PATH"
WORKDIR /usr/src

# blastp and makeblastdb commands
COPY --from=blast /blast/ReleaseMT/bin/blastp /usr/local/bin/blastp
COPY --from=blast /blast/ReleaseMT/bin/makeblastdb /usr/local/bin/makeblastdb

COPY --from=builder /usr/src/.venv/ /usr/src/.venv/
COPY --from=builder /usr/src/static/ /api_data/static/
COPY --from=builder /usr/src/manage.py /usr/src/
COPY --from=builder /usr/src/antigenapi /usr/src/antigenapi
COPY --from=builder /usr/src/antigendjango /usr/src/antigendjango
COPY uwsgi.ini /usr/src

WORKDIR /usr/src

CMD [".venv/bin/uwsgi", "--ini", "uwsgi.ini"]

FROM builder AS dev

# liblmdb-dev required by BLAST
USER root
RUN apt update && apt install -y liblmdb-dev && rm -rf /var/lib/apt/lists/*
USER nonroot

# blastp and makeblastdb commands
COPY --from=blast /blast/ReleaseMT/bin/blastp /usr/local/bin/blastp
COPY --from=blast /blast/ReleaseMT/bin/makeblastdb /usr/local/bin/makeblastdb

CMD ["pipenv", "run", "python", "manage.py", "runserver", "0.0.0.0:8080"]
