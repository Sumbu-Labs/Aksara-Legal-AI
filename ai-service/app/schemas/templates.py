from __future__ import annotations

from typing import Any, Dict

from pydantic import BaseModel


class TemplateResponse(BaseModel):
    permit_type: str
    region: str
    schema: Dict[str, Any]
