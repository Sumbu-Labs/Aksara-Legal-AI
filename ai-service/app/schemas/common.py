from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Citation(BaseModel):
    url: str
    title: str
    section: Optional[str] = None
    snippet: Optional[str] = None


class ModelMeta(BaseModel):
    model: Optional[str] = None
    prompt_tokens: Optional[int] = Field(default=None, alias="promptTokens")
    response_tokens: Optional[int] = Field(default=None, alias="responseTokens")


class RetrievalMeta(BaseModel):
    chunks_considered: Optional[int] = None
    latest_version_date: Optional[str] = None
