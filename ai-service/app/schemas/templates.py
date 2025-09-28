from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class TemplateResponse(BaseModel):
    permit_type: str
    region: str
    schema: dict[str, Any]
