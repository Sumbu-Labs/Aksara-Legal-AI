from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class TemplateResponse(BaseModel):
    """Schema metadata returned for a permit template."""

    permit_type: str = Field(
        ...,
        description="Permit type identifier matching the request.",
        examples=["PIRT"],
    )
    region: str = Field(
        ...,
        description="Region the template is scoped to.",
        examples=["DIY"],
    )
    schema_data: dict[str, Any] = Field(
        ...,
        description="JSON schema describing required fields and validation rules.",
    )
