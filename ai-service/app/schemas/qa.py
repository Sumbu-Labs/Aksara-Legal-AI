from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.schemas.common import Citation, ModelMeta, RetrievalMeta


class QaRequest(BaseModel):
    question: str
    permit_type: Optional[Literal["PIRT", "HALAL", "BPOM"]] = Field(default=None)
    region: Optional[Literal["DIY"]] = Field(default="DIY")
    user_id: str


class QaResponse(BaseModel):
    answer_md: str
    citations: list[Citation]
    retrieval_meta: RetrievalMeta
    model_meta: ModelMeta
