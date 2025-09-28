from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, HttpUrl


class IngestSource(BaseModel):
    url: HttpUrl
    permit_type: Optional[str] = None
    region: Optional[str] = None
    title: Optional[str] = None
    version_date: Optional[str] = None
    selectors: Optional[dict[str, Any]] = None


class IngestUpsertRequest(BaseModel):
    sources: list[IngestSource]


class IngestUpsertResponse(BaseModel):
    results: list[dict[str, Any]]
