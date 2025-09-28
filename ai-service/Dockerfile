FROM python:3.11-slim AS base
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1
RUN useradd --create-home appuser

FROM base AS builder
RUN apt-get update && apt-get install -y build-essential libpq-dev libreoffice && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY pyproject.toml README.md ./
RUN pip install --upgrade pip && pip install .[dev]

FROM base AS runtime
RUN apt-get update && apt-get install -y libpq-dev libreoffice && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /usr/local /usr/local
COPY . .
RUN mkdir -p generated && chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
