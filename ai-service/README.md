# Aksara Legal AI Service

FastAPI microservice providing grounded legal Q&A with citations and Autopilot document generation for UMKM permit workflows (PIRT, Halal, BPOM) in DIY Yogyakarta.

## Features

- **Grounded Q&A** via Gemini 2.5 Pro with hybrid RAG (pgvector embeddings + BM25) and guardrails.
- **Autopilot document generation** producing `.docx` (and optional `.pdf`) using JSON schema templates, deterministic mappings, and field-level audit trails.
- **Ingestion pipeline** for HTML/PDF sources with chunking, embeddings, and metadata versioning.
- **Operational tooling**: structured logging, request IDs, rate limiting, Alembic migrations, Docker/Docker Compose, GitHub Actions CI.

## Quick Start

1. Copy `.env.example` to `.env` and fill secrets (Gemini API key, JWT public key, storage URL, etc.).
2. Create virtualenv & install dependencies:

   ```sh
   python -m venv .venv
   .venv/Scripts/pip install --upgrade pip
   .venv/Scripts/pip install -e .[dev]
   ```

3. Start Postgres locally (or `docker-compose up postgres`), then apply migrations:

   ```sh
   .venv/Scripts/alembic upgrade head
   ```

4. Launch the API:

   ```sh
   .venv/Scripts/uvicorn app.main:app --reload
   ```

5. Open `http://localhost:7700/docs` to launch the Scalar API Reference (served from this service).

### Docker Compose

```sh
docker network create aksara_network  # run once if the shared network doesn't exist
docker-compose up --build
```

The compose stack attaches to the shared `aksara_network` bridge so it can talk to sibling services (backend, frontend, etc.). The API listens on `http://localhost:7700`; Postgres is available on `localhost:5432`.

### One-shot Docker build & run script

```sh
./scripts/run-docker.sh
```

This helper script builds the image defined in `Dockerfile`, then launches the container while mounting `generated/` back to the host. Customize behavior with flags such as `--port 9000`, `--env-file path/to/.env`, `--image my-registry/aksara`, or `--build-only` to skip the run step. Pass extra `docker run` options after `--`, for example `./scripts/run-docker.sh -- -e DEBUG=true`.

## Key Environment Variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Async SQLAlchemy DSN (`postgresql+psycopg://...`). |
| `GEMINI_API_KEY` | Google Gemini API key. |
| `STORAGE_BUCKET_URL` | Base URL for generated documents. |
| `ENABLE_PDF_EXPORT` | `true` to enable LibreOffice PDF conversion. |
| `JWT_PUBLIC_KEY` | PEM-encoded RSA public key for token validation. |

See `.env.example` for the full list.

## API Reference

- Scalar UI: `http://localhost:7700/docs` (renders the OpenAPI spec with live calls)
- Raw OpenAPI schema: `http://localhost:7700/openapi.json`

## API Overview

- `POST /v1/qa/query` — ask legal questions; always returns grounded answers or "Saya tidak dapat memverifikasi ini.". Citations include URL, section, and version date metadata.
- `POST /v1/autopilot/generate` — generate application documents; responds with download URLs or missing field guidance.
- `GET /v1/templates/{permit_type}` — fetch JSON schema template metadata.
- `POST /v1/ingest/upsert` — ingest/refresh regulatory sources.
- `GET /v1/health` — checks DB connectivity, RAG readiness, and LLM config.

Use `Authorization: Bearer <JWT>` headers to enable per-user rate limiting and context binding.

## Development Workflow

- Format & lint: `make fmt` / `make lint`
- Run tests: `make test`
- Create migrations: `make migrate-rev`
- Apply migrations: `make migrate-up`

## Tests

- Unit tests cover chunking, field validation, and guardrails (`tests/unit`).
- Golden snapshots (`tests/golden`) are scaffolded; populate with curated Q&A fixtures once the RAG index is seeded.
- Autopilot integration tests should be extended with template fixtures and storage mocks.

Run the full suite via:

```sh
pytest
```

## Demo Script (Sample)

```sh
# 1. Ask a question
echo '{"question":"Apa perbedaan PIRT dan BPOM?","permit_type":"PIRT","region":"DIY","user_id":"demo-user"}' \
  | http POST :7700/v1/qa/query Authorization:"Bearer $JWT"

# 2. Generate document
http POST :7700/v1/autopilot/generate Authorization:"Bearer $JWT" \
  permit_type=PIRT region=DIY user_id=demo-user \
  business_profile:='{"nama_usaha":"Warung Sehat","alamat":"Jl. Malioboro"}' \
  options:='{"format":"docx"}'
```

## Repository Structure

```bash
app/
  api/            # FastAPI routers and dependencies
  core/           # Config, logging, prompt loader
  db/             # Session management
  models/         # SQLAlchemy models
  schemas/        # Pydantic request/response models
  services/       # RAG, Autopilot, storage, LLM clients
  utils/          # Helpers (IDs, rate limiting, auth)

alembic/          # Migrations
PROMPTS.md        # Shared prompt definitions
Dockerfile, docker-compose.yml, Makefile
```

## Next Steps

- Seed regulatory sources via `/v1/ingest/upsert` to build the retrieval index (20–30 curated DIY references).
- Upload template schemas/docx files into the `templates` table and storage bucket.
- Expand CI with integration tests connecting to ephemeral Postgres + mocked Gemini endpoints.

## License

See [LICENSE](../LICENSE).
