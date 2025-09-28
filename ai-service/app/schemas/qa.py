from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import Citation, ModelMeta, RetrievalMeta


class QaRequest(BaseModel):
    question: str
    permit_type: Literal["PIRT", "HALAL", "BPOM"] | None = Field(default=None)
    region: Literal["DIY"] | None = Field(default="DIY")
    user_id: str


class QaResponse(BaseModel):
    answer_md: str
    citations: list[Citation]
    retrieval_meta: RetrievalMeta
    model_meta: ModelMeta
