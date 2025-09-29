from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field, ConfigDict


class Citation(BaseModel):
    """Metadata describing a document citation returned with an answer."""

    url: str = Field(
        ...,
        description="Canonical URL of the cited regulation or guideline.",
        examples=["https://perizinan.example.id/pirt/perka-12-2024"],
    )
    title: str = Field(
        ...,
        description="Human-readable title of the cited source.",
        examples=["Peraturan Kepala BPOM Nomor 12 Tahun 2024"],
    )
    section: str | None = Field(
        default=None,
        description="Specific section, article, or anchor within the cited source.",
        examples=["Bab II Pasal 3"],
    )
    snippet: str | None = Field(
        default=None,
        description="Relevant quote or summary from the source supporting the answer.",
        examples=["Pelaku usaha wajib memiliki sertifikat PIRT sebelum mengedarkan produk."],
    )


class ModelMeta(BaseModel):
    """Telemetry about the LLM invocation backing the response."""

    model_config = ConfigDict(populate_by_name=True)

    model: str | None = Field(
        default=None,
        description="Identifier of the underlying LLM model used to craft the response.",
        examples=["gemini-2.5-pro"],
    )
    prompt_tokens: int | None = Field(
        default=None,
        alias="promptTokens",
        description="Number of tokens sent to the model for this request.",
        examples=[512],
    )
    response_tokens: int | None = Field(
        default=None,
        alias="responseTokens",
        description="Number of tokens returned by the model.",
        examples=[245],
    )


class RetrievalMeta(BaseModel):
    """Details about the retrieval layer that grounded the answer."""

    chunks_considered: int | None = Field(
        default=None,
        description="How many document chunks were evaluated for grounding the answer.",
        examples=[24],
    )
    latest_version_date: str | None = Field(
        default=None,
        description="ISO date of the most recent regulatory update considered.",
        examples=["2024-07-01"],
    )


class ErrorResponse(BaseModel):
    """Standard envelope for API errors and operational failures."""

    error: str = Field(
        ...,
        description="Short machine-readable error code.",
        examples=["unauthorized", "rate_limit_exceeded", "internal_error"],
    )
    message: str = Field(
        ...,
        description="Human-readable explanation suitable for surfaced error messages.",
        examples=["Authorization token missing or invalid."],
    )
    details: dict[str, Any] | None = Field(
        default=None,
        description="Optional context such as request identifiers or validation hints.",
        examples=[{"request_id": "req-123", "missing_fields": ["business_profile"]}],
    )
