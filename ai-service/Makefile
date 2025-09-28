.PHONY: install lint fmt test run dev migrate-up migrate-rev

install:
	python -m venv .venv && .venv/Scripts/pip install --upgrade pip && .venv/Scripts/pip install -e .[dev]

lint:
	.venv/Scripts/ruff check app tests
	.venv/Scripts/mypy app

fmt:
	.venv/Scripts/ruff check --fix app tests

migrate-up:
	.venv/Scripts/alembic upgrade head

migrate-rev:
	.venv/Scripts/alembic revision --autogenerate -m "update"

test:
	.venv/Scripts/pytest

dev:
	.venv/Scripts/uvicorn app.main:app --reload --host 0.0.0.0 --port $${PORT:-8000}

run:
	.venv/Scripts/uvicorn app.main:app --host 0.0.0.0 --port $${PORT:-8000}
