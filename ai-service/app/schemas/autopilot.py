from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class UploadedDocument(BaseModel):
    """Supporting document supplied by the user for contextual enrichment."""

    name: str = Field(
        ...,
        description="Logical name of the uploaded document.",
        examples=["npwp.pdf"],
    )
    url: str = Field(
        ...,
        description="Pre-signed URL pointing to the uploaded file.",
        examples=["https://storage.example.com/uploads/npwp.pdf"],
    )
    type: str = Field(
        ...,
        description="MIME type of the uploaded document.",
        examples=["application/pdf"],
    )
    fields: dict[str, Any] = Field(
        default_factory=dict,
        description="Optional structured fields parsed from the document (e.g., OCR results).",
    )


class AutopilotOptions(BaseModel):
    """Optional directives that influence document generation."""

    format: Literal["html", "pdf", "docx"] = Field(
        default="html",
        description="Preferred output format. DOCX is deprecated and falls back to HTML.",
        examples=["pdf"],
    )


class AutopilotRequest(BaseModel):
    """Payload describing the business and options for Autopilot generation."""

    permit_type: Literal["PIRT", "HALAL", "BPOM"] = Field(
        ...,
        description="Permit workflow to generate (currently supports PIRT, HALAL, BPOM).",
        examples=["PIRT"],
    )
    region: Literal["DIY"] = Field(
        ...,
        description="Region used to resolve the template and regulatory references.",
        examples=["DIY"],
    )
    user_id: str = Field(
        ...,
        description="Identifier for the requesting user to drive audit logging and rate limiting.",
        examples=["user-123"],
    )
    business_profile: dict[str, Any] = Field(
        ...,
        description="Structured business data (e.g., nama usaha, alamat) that populates the template.",
        examples=[{"nama_usaha": "Warung Sehat", "alamat": "Jl. Malioboro 12"}],
    )
    uploaded_docs: list[UploadedDocument] = Field(
        default_factory=list,
        alias="uploaded_docs",
        description="Optional supporting documents to enrich the generation context.",
    )
    options: AutopilotOptions = Field(
        default_factory=AutopilotOptions,
        description="Advanced options controlling output behavior.",
    )


class FieldAuditEntry(BaseModel):
    """Traceability metadata explaining how each field was populated."""

    value: Any = Field(
        ...,
        description="Final value inserted into the generated document field.",
        examples=["Warung Sehat"],
    )
    source: str = Field(
        ...,
        description="Reference to the data source (e.g., user input, uploaded_docs entry).",
        examples=["business_profile.nama_usaha"],
    )
    source_type: str = Field(
        ...,
        description="Category of the source used to derive the value.",
        examples=["user_input"],
    )
    rationale: str | None = Field(
        default=None,
        description="Optional explanation describing the transformation or business rule applied.",
        examples=["Diambil dari isian pengguna tanpa modifikasi."],
    )


class AutopilotSuccessResponse(BaseModel):
    """Successful document generation result."""

    status: Literal["ok"] = Field(
        ..., description="Indicates the generation completed successfully.", examples=["ok"]
    )
    doc_url: str = Field(
        ...,
        description="Signed URL to the generated HTML document.",
        examples=[
            "https://storage.example.com/generated/pirt/user-123/warung-sehat-2024-07-01.html?signature=..."
        ],
    )
    pdf_url: str | None = Field(
        default=None,
        description="Signed URL to the optional PDF rendition if requested and available.",
        examples=[
            "https://storage.example.com/generated/pirt/user-123/warung-sehat-2024-07-01.pdf?signature=..."
        ],
    )
    field_audit: dict[str, FieldAuditEntry] = Field(
        ...,
        description="Map of template field identifiers to their audit trail entries.",
    )
    model_meta: dict[str, Any] = Field(
        ...,
        description="Arbitrary metadata emitted by the generation pipeline (e.g., model version).",
    )


class AutopilotMissingResponse(BaseModel):
    """Response issued when mandatory inputs are absent."""

    status: Literal["missing_required_fields"] = Field(
        ..., description="Indicates additional user input is required.", examples=["missing_required_fields"]
    )
    missing_fields: list[str] = Field(
        ...,
        description="Ordered list of field paths that must be supplied before generation can continue.",
        examples=[["business_profile.nib", "business_profile.alamat"]],
    )
    guidance: str = Field(
        ...,
        description="Actionable instructions to resolve the missing inputs.",
        examples=["Lengkapi NIB dan alamat usaha sebelum melanjutkan."],
    )

