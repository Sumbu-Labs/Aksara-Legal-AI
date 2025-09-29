from __future__ import annotations

from typing import Any

from pydantic import BaseModel, HttpUrl, Field


class IngestSource(BaseModel):
    """Source document specification to ingest into the retrieval index."""

    url: HttpUrl = Field(
        ...,
        description="Public URL to crawl and ingest.",
        examples=["https://perizinan.example.id/pirt/panduan.html"],
    )
    permit_type: str | None = Field(
        default=None,
        description="Optional permit type hint used to scope retrieval results.",
        examples=["PIRT"],
    )
    region: str | None = Field(
        default=None,
        description="Regional tag for the source if different from default.",
        examples=["DIY"],
    )
    title: str | None = Field(
        default=None,
        description="Friendly title displayed in citations.",
        examples=["Panduan Produksi Pangan Industri Rumah Tangga"],
    )
    version_date: str | None = Field(
        default=None,
        description="ISO date when the source was last updated.",
        examples=["2024-05-12"],
    )
    selectors: dict[str, Any] | None = Field(
        default=None,
        description="Optional extraction selectors or overrides applied during ingestion.",
    )


class IngestUpsertRequest(BaseModel):
    """Batch ingestion request."""

    sources: list[IngestSource] = Field(
        ...,
        description="Collection of sources to ingest or refresh.",
        examples=[[{"url": "https://perizinan.example.id/pirt/panduan.html", "permit_type": "PIRT"}]],
    )


class IngestUpsertResponse(BaseModel):
    """Ingestion outcome for each submitted source."""

    results: list[dict[str, Any]] = Field(
        ...,
        description="Status objects describing ingestion success, failures, and derived metadata.",
    )
