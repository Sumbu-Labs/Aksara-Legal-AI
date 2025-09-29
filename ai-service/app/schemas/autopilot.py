from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class UploadedDocument(BaseModel):
    name: str
    url: str
    type: str
    fields: dict[str, Any] = Field(default_factory=dict)


class AutopilotOptions(BaseModel):
    format: Literal["docx", "pdf"] = Field(default="docx")


class AutopilotRequest(BaseModel):
    permit_type: Literal["PIRT", "HALAL", "BPOM"]
    region: Literal["DIY"]
    user_id: str
    business_profile: dict[str, Any]
    uploaded_docs: list[UploadedDocument] = Field(
        default_factory=list, alias="uploaded_docs"
    )
    options: AutopilotOptions = Field(default_factory=AutopilotOptions)


class FieldAuditEntry(BaseModel):
    value: Any
    source: str
    source_type: str
    rationale: str | None = None


class AutopilotSuccessResponse(BaseModel):
    status: Literal["ok"]
    doc_url: str
    pdf_url: str | None = None
    field_audit: dict[str, FieldAuditEntry]
    model_meta: dict[str, Any]


class AutopilotMissingResponse(BaseModel):
    status: Literal["missing_required_fields"]
    missing_fields: list[str]
    guidance: str

