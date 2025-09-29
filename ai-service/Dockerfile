# syntax=docker/dockerfile:1.7

ARG PYTHON_VERSION=3.11
FROM python:${PYTHON_VERSION}-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_NO_CACHE_DIR=1 \
    PATH="/opt/venv/bin:$PATH"

ARG APP_USER=appuser
ARG APP_UID=1000
ARG APP_GID=1000

ENV APP_USER=${APP_USER} \
    APP_HOME=/home/${APP_USER}

RUN groupadd --system --gid "${APP_GID}" "${APP_USER}" \
    && useradd --system \
        --create-home \
        --home "${APP_HOME}" \
        --uid "${APP_UID}" \
        --gid "${APP_GID}" \
        "${APP_USER}"

FROM base AS builder

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src

COPY pyproject.toml README.md ./
COPY app ./app
COPY alembic ./alembic

RUN python -m venv /opt/venv \
    && /opt/venv/bin/pip install --upgrade pip \
    && /opt/venv/bin/pip install --no-cache-dir wheel \
    && /opt/venv/bin/pip install --no-cache-dir .

FROM base AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libpq5 \
        libcairo2 \
        libpangocairo-1.0-0 \
        libpango-1.0-0 \
        libgdk-pixbuf-2.0-0 \
        librsvg2-2 \
        shared-mime-info \
        fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
COPY --chown=${APP_USER}:${APP_USER} . .
RUN install -d -o "${APP_USER}" -g "${APP_USER}" /app/generated

USER ${APP_USER}

EXPOSE 7700
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7700"]
