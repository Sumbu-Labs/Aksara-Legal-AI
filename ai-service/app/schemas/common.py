from __future__ import annotations

from pydantic import BaseModel, Field


class Citation(BaseModel):
    url: str
    title: str
    section: str | None = None
    snippet: str | None = None


class ModelMeta(BaseModel):
    model: str | None = None
    prompt_tokens: int | None = Field(default=None, alias="promptTokens")
    response_tokens: int | None = Field(default=None, alias="responseTokens")


class RetrievalMeta(BaseModel):
    chunks_considered: int | None = None
    latest_version_date: str | None = None
