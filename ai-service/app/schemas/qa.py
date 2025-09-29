from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import Citation, ModelMeta, RetrievalMeta


class QaRequest(BaseModel):
    """Payload for grounded legal Q&A requests."""

    question: str = Field(
        ...,
        description="Natural-language question to answer with grounded citations.",
        examples=["Apa persyaratan utama untuk mendapatkan izin PIRT?"],
    )
    permit_type: Literal["PIRT", "HALAL", "BPOM"] | None = Field(
        default=None,
        description="Optional permit category to bias retrieval results.",
        examples=["PIRT"],
    )
    region: Literal["DIY"] | None = Field(
        default="DIY",
        description="Regional context for the request. DIY is the current supported value.",
        examples=["DIY"],
    )
    user_id: str = Field(
        ...,
        description="Stable identifier for the end user, used for rate limiting and audit trails.",
        examples=["user-123"],
    )


class QaResponse(BaseModel):
    """Grounded answer enriched with retrieval and model metadata."""

    answer_md: str = Field(
        ...,
        description="Markdown-formatted answer drafted by the LLM.",
        examples=["**Ringkasan:** Pelaku usaha wajib memiliki sertifikat PIRT sebelum produksi."],
    )
    citations: list[Citation] = Field(
        ...,
        description="Sources that substantiate the answer.",
        examples=[
            [
                {
                    "url": "https://perizinan.example.id/pirt/perka-12-2024",
                    "title": "Perka BPOM No.12/2024",
                    "section": "Bab II Pasal 3",
                    "snippet": "Pelaku usaha wajib memiliki sertifikat PIRT sebelum mengedarkan produk.",
                }
            ]
        ],
    )
    retrieval_meta: RetrievalMeta = Field(
        ...,
        description="Statistics describing the retrieval context backing the answer.",
    )
    model_meta: ModelMeta = Field(
        ...,
        description="Telemetry about the language model invocation.",
    )
