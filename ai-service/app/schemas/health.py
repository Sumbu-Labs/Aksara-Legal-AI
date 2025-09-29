from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class HealthStatus(BaseModel):
    """Service and dependency health snapshot."""

    status: Literal["ok", "error"] = Field(
        ...,
        description="Overall health indicator summarizing dependency checks.",
        examples=["ok"],
    )
    details: dict[str, str] = Field(
        ...,
        description="Per dependency status map (e.g., database, RAG index, LLM).",
        examples=[[{"db": "ok", "rag": "empty", "llm": "ok"}]],
    )
