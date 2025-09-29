from __future__ import annotations

from typing import Any

from pydantic import BaseModel, HttpUrl


class IngestSource(BaseModel):
    url: HttpUrl
    permit_type: str | None = None
    region: str | None = None
    title: str | None = None
    version_date: str | None = None
    selectors: dict[str, Any] | None = None


class IngestUpsertRequest(BaseModel):
    sources: list[IngestSource]


class IngestUpsertResponse(BaseModel):
    results: list[dict[str, Any]]
