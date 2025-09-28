from __future__ import annotations

from typing import Any, Dict, Literal, Optional

from pydantic import BaseModel, Field


class UploadedDocument(BaseModel):
    name: str
    url: str
    type: str
    fields: Dict[str, Any] = Field(default_factory=dict)


class AutopilotOptions(BaseModel):
    format: Literal["docx", "pdf"] = Field(default="docx")


class AutopilotRequest(BaseModel):
    permit_type: Literal["PIRT", "HALAL", "BPOM"]
    region: Literal["DIY"]
    user_id: str
    business_profile: Dict[str, Any]
    uploaded_docs: list[UploadedDocument] = Field(default_factory=list, alias="uploaded_docs")
    options: AutopilotOptions = Field(default_factory=AutopilotOptions)


class FieldAuditEntry(BaseModel):\n    value: Any\n    source: str\n    source_type: str\n    rationale: Optional[str] = None\n

class AutopilotSuccessResponse(BaseModel):
    status: Literal["ok"]
    doc_url: str
    pdf_url: Optional[str] = None
    field_audit: Dict[str, FieldAuditEntry]
    model_meta: Dict[str, Any]


class AutopilotMissingResponse(BaseModel):
    status: Literal["missing_required_fields"]
    missing_fields: list[str]
    guidance: str

